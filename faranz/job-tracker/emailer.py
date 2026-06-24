"""Send follow-up emails over SMTP. Config lives in .env next to the app."""
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

ENV_PATH = Path(__file__).parent / ".env"


def load_config() -> dict:
    """Tiny .env parser - KEY=VALUE lines, # comments ignored."""
    config = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            config[key.strip()] = value.strip().strip('"').strip("'")
    return config


def is_configured() -> bool:
    cfg = load_config()
    return all(cfg.get(k) for k in ("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"))


def send_email(to: str, subject: str, body: str) -> None:
    """Raises on failure; caller turns errors into a flash message."""
    cfg = load_config()
    if not is_configured():
        raise RuntimeError(
            "Email is not configured. Copy .env.example to .env and fill in your SMTP details."
        )

    msg = EmailMessage()
    from_name = cfg.get("FROM_NAME", "")
    sender = cfg["SMTP_USER"]
    msg["From"] = f"{from_name} <{sender}>" if from_name else sender
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    host, port = cfg["SMTP_HOST"], int(cfg["SMTP_PORT"])
    context = ssl.create_default_context()
    if port == 465:
        with smtplib.SMTP_SSL(host, port, context=context) as server:
            server.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
            server.send_message(msg)
    else:  # 587 / STARTTLS
        with smtplib.SMTP(host, port) as server:
            server.starttls(context=context)
            server.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
            server.send_message(msg)
