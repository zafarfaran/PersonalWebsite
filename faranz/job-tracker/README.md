# The Job Ledger

A local job application tracker. Flask + SQLite, no accounts, no cloud — everything lives in `jobs.db` next to the app.

## Run it

```bash
make up        # installs deps + starts the server
```

Or without make:

```bash
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5050

## Features

- Log applications: company, role, posting URL, location, salary, date applied
- Statuses: Wishlist, Applied, Phone Screen, Interview, Offer, Rejected, Ghosted, Withdrawn
- Notes timeline per job — status changes are logged automatically
- Filter by status, search by company/role/location
- Export everything to CSV or JSON (buttons in the header)
- One-click follow-up emails (see below)

## Follow-up emails

Each job page has a "Send follow-up email" panel: pre-filled with the recruiter's
address (the job's contact email), a subject, and a polite template you can edit
before sending. Sent emails are logged in the job's timeline.

To enable it:

1. Copy `.env.example` to `.env`
2. Fill in your SMTP details. For Gmail: turn on 2FA, create an
   [App Password](https://myaccount.google.com/apppasswords), and use that as
   `SMTP_PASSWORD`.
3. Restart the app.

`.env` is gitignored, so your credentials stay on your machine.

## Inbox watching (auto status updates)

With `IMAP_HOST` set in `.env` (same user/password as sending), the app checks
your inbox every `IMAP_POLL_MINUTES` (default 10) — there's also a
**Check inbox** button in the header to scan on demand.

For each new email it tries to match a tracked job, most-confident first:

1. Sender address equals the job's contact email
2. Sender domain matches the contact's domain (company domains only — shared
   providers like gmail.com are skipped)
3. Company name appears in the sender or subject

When matched, the email is logged in the job's timeline, and if the wording
clearly signals an outcome ("pleased to offer", "unfortunately", "schedule an
interview", "screening call", ...) the status is updated automatically. Every
match raises a popup alert in the web UI that links to the job; dismissing it
marks it as read. Emails are only peeked — never marked read or modified.

## Layout

| File | Purpose |
|---|---|
| `app.py` | Flask routes |
| `db.py` | SQLite schema + all queries |
| `emailer.py` | SMTP sending + `.env` config |
| `inbox.py` | IMAP inbox watcher, job matching, status inference |
| `templates/` | Jinja pages (`index`, `job_detail`, `job_form`) |
| `static/style.css` | All styling |
| `jobs.db` | Your data (created on first run) |

To add a field: add the column in `db.py` (`SCHEMA` + insert/update), one input in `templates/job_form.html`, and render it where you want it.
