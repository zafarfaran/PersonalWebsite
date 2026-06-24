"""Watch the inbox over IMAP, match emails to tracked jobs, update statuses.

Uses the same credentials as emailer.py (.env). Emails are never modified or
marked as read on the server - we only peek.
"""
import email
import email.utils
import imaplib
import re
from datetime import datetime, timedelta
from email.header import decode_header, make_header

import db
from emailer import load_config

# Generic mail providers: a shared domain is not evidence the email relates
# to a job, unlike e.g. @acme.com matching a contact at Acme.
FREEMAIL_DOMAINS = {
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
    "yahoo.com", "icloud.com", "proton.me", "protonmail.com", "aol.com",
}

# Checked in order - first match wins. Offer before Interview, because offer
# emails often mention the interview process.
STATUS_RULES = [
    ("Offer", [
        "pleased to offer", "happy to offer", "offer of employment",
        "extend an offer", "job offer", "offer letter",
    ]),
    ("Rejected", [
        "unfortunately", "regret to inform", "will not be progressing",
        "not be moving forward", "other candidates", "unsuccessful",
        "decided not to proceed", "position has been filled",
    ]),
    ("Phone Screen", [
        "phone screen", "screening call", "initial call", "brief call",
        "introductory call",
    ]),
    ("Interview", [
        "interview", "meet the team", "next stage", "next round",
        "technical assessment", "take-home",
    ]),
]

MAX_EMAILS_PER_CHECK = 50
LOOKBACK_DAYS = 3

_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def is_configured() -> bool:
    cfg = load_config()
    return all(cfg.get(k) for k in ("IMAP_HOST", "SMTP_USER", "SMTP_PASSWORD"))


def _decode(value: str | None) -> str:
    if not value:
        return ""
    try:
        return str(make_header(decode_header(value)))
    except Exception:
        return value


def _body_text(msg: email.message.Message) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
        return ""
    payload = msg.get_payload(decode=True)
    if not payload:
        return ""
    charset = msg.get_content_charset() or "utf-8"
    return payload.decode(charset, errors="replace")


def infer_status(text: str) -> str | None:
    lowered = text.lower()
    for status, phrases in STATUS_RULES:
        if any(p in lowered for p in phrases):
            return status
    return None


GENERIC_COMPANY_WORDS = {
    "corp", "corporation", "company", "limited", "group", "global",
    "holdings", "partners", "consulting", "solutions", "services",
    "international", "technologies",
}


def _company_words(company: str) -> list[str]:
    """Distinctive words of a company name, for domain matching."""
    return [
        w for w in re.findall(r"[a-z0-9]+", company.lower())
        if len(w) >= 4 and w not in GENERIC_COMPANY_WORDS
    ]


def match_job(jobs, sender_addr: str, sender_name: str, subject: str) -> "db.sqlite3.Row | None":
    """Most-confident match first: exact contact, then domain, then company name."""
    sender_addr = sender_addr.lower()
    domain = sender_addr.rsplit("@", 1)[-1]

    for job in jobs:
        contact = (job["contact_email"] or "").lower()
        if contact and contact == sender_addr:
            return job

    if domain not in FREEMAIL_DOMAINS:
        for job in jobs:
            contact = (job["contact_email"] or "").lower()
            if contact and contact.rsplit("@", 1)[-1] == domain:
                return job
        flat_domain = re.sub(r"[^a-z0-9]", "", domain)
        for job in jobs:
            # distinctive word of the company inside the sender's domain,
            # e.g. "Acme Corp" matching acme.bamboohr.com
            for word in _company_words(job["company"]):
                if word in flat_domain:
                    return job

    haystack = f"{sender_name} {subject}".lower()
    for job in jobs:
        company = job["company"].lower()
        if len(company) >= 4 and company in haystack:
            return job
    return None


def check_inbox() -> dict:
    """Fetch recent emails, match against jobs, update statuses, raise alerts.

    Returns a summary: {"checked": n, "matched": n, "status_updates": n}
    """
    summary = {"checked": 0, "matched": 0, "status_updates": 0}
    if not is_configured():
        raise RuntimeError(
            "Inbox watching is not configured. Set IMAP_HOST in .env "
            "(plus SMTP_USER/SMTP_PASSWORD, shared with sending)."
        )

    cfg = load_config()
    own_addr = cfg["SMTP_USER"].lower()
    jobs = db.list_jobs()
    if not jobs:
        return summary

    since = datetime.now() - timedelta(days=LOOKBACK_DAYS)
    since_str = f"{since.day:02d}-{_MONTHS[since.month - 1]}-{since.year}"

    mail = imaplib.IMAP4_SSL(cfg["IMAP_HOST"])
    try:
        mail.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
        mail.select("INBOX", readonly=True)
        _, data = mail.search(None, f"(SINCE {since_str})")
        ids = data[0].split()[-MAX_EMAILS_PER_CHECK:]

        for num in ids:
            _, msg_data = mail.fetch(num, "(BODY.PEEK[])")
            if not msg_data or msg_data[0] is None:
                continue
            msg = email.message_from_bytes(msg_data[0][1])

            message_id = msg.get("Message-ID", "").strip()
            if not message_id or db.is_email_processed(message_id):
                continue
            summary["checked"] += 1
            db.mark_email_processed(message_id)

            sender_name, sender_addr = email.utils.parseaddr(_decode(msg.get("From")))
            if not sender_addr or sender_addr.lower() == own_addr:
                continue

            subject = _decode(msg.get("Subject"))
            job = match_job(jobs, sender_addr, sender_name, subject)
            if job is None:
                continue
            summary["matched"] += 1

            body = _body_text(msg)[:4000]
            snippet = re.sub(r"\s+", " ", body).strip()[:200]
            db.add_inbox_note(
                job["id"],
                f"Email received from {sender_addr} — “{subject}”\n{snippet}",
            )

            new_status = infer_status(f"{subject}\n{body}")
            if new_status and new_status != job["status"]:
                db.set_status(job["id"], new_status)
                jobs = db.list_jobs()  # refresh so later emails in this batch see the new status
                summary["status_updates"] += 1
                db.add_alert(
                    job["id"],
                    f"{job['company']}: new email — “{subject}” · status moved to {new_status}",
                )
            else:
                db.add_alert(
                    job["id"],
                    f"{job['company']}: new email — “{subject}”",
                )
    finally:
        try:
            mail.logout()
        except Exception:
            pass

    return summary
