"""SQLite helpers for the job tracker. All queries live here."""
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "jobs.db"

STATUSES = [
    "Wishlist",
    "Applied",
    "Phone Screen",
    "Interview",
    "Offer",
    "Rejected",
    "Ghosted",
    "Withdrawn",
]

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    company      TEXT NOT NULL,
    title        TEXT NOT NULL,
    url          TEXT NOT NULL DEFAULT '',
    location     TEXT NOT NULL DEFAULT '',
    salary       TEXT NOT NULL DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'Applied',
    date_applied TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL DEFAULT '',
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id     INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL DEFAULT 'note',
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id     INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL,
    seen       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS processed_emails (
    message_id   TEXT PRIMARY KEY,
    processed_at TEXT NOT NULL
);
"""


def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(SCHEMA)
        # Migration for databases created before contact_email existed.
        cols = {row["name"] for row in conn.execute("PRAGMA table_info(jobs)")}
        if "contact_email" not in cols:
            conn.execute(
                "ALTER TABLE jobs ADD COLUMN contact_email TEXT NOT NULL DEFAULT ''"
            )


# ---------------------------------------------------------------- jobs

def list_jobs(status: str = "", q: str = "") -> list[sqlite3.Row]:
    sql = "SELECT * FROM jobs WHERE 1=1"
    params: list = []
    if status:
        sql += " AND status = ?"
        params.append(status)
    if q:
        sql += " AND (company LIKE ? OR title LIKE ? OR location LIKE ?)"
        like = f"%{q}%"
        params += [like, like, like]
    sql += " ORDER BY updated_at DESC"
    with get_conn() as conn:
        return conn.execute(sql, params).fetchall()


def get_job(job_id: int) -> sqlite3.Row | None:
    with get_conn() as conn:
        return conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()


def create_job(fields: dict) -> int:
    ts = now()
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO jobs
               (company, title, url, location, salary, status, date_applied,
                contact_email, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                fields["company"], fields["title"], fields["url"],
                fields["location"], fields["salary"], fields["status"],
                fields["date_applied"], fields["contact_email"], ts, ts,
            ),
        )
        return cur.lastrowid


def update_job(job_id: int, fields: dict) -> None:
    with get_conn() as conn:
        conn.execute(
            """UPDATE jobs SET company=?, title=?, url=?, location=?, salary=?,
               status=?, date_applied=?, contact_email=?, updated_at=? WHERE id=?""",
            (
                fields["company"], fields["title"], fields["url"],
                fields["location"], fields["salary"], fields["status"],
                fields["date_applied"], fields["contact_email"], now(), job_id,
            ),
        )


def set_status(job_id: int, status: str) -> None:
    ts = now()
    with get_conn() as conn:
        conn.execute(
            "UPDATE jobs SET status=?, updated_at=? WHERE id=?",
            (status, ts, job_id),
        )
        conn.execute(
            "INSERT INTO notes (job_id, kind, content, created_at) VALUES (?, 'status', ?, ?)",
            (job_id, f"Status changed to {status}", ts),
        )


def delete_job(job_id: int) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))


def status_counts() -> dict[str, int]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT status, COUNT(*) AS n FROM jobs GROUP BY status"
        ).fetchall()
    return {row["status"]: row["n"] for row in rows}


# ---------------------------------------------------------------- notes

def list_notes(job_id: int) -> list[sqlite3.Row]:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM notes WHERE job_id = ? ORDER BY created_at DESC, id DESC",
            (job_id,),
        ).fetchall()


def add_note(job_id: int, content: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO notes (job_id, kind, content, created_at) VALUES (?, 'note', ?, ?)",
            (job_id, content, now()),
        )
        conn.execute(
            "UPDATE jobs SET updated_at=? WHERE id=?", (now(), job_id)
        )


def log_email(job_id: int, to: str, subject: str) -> None:
    ts = now()
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO notes (job_id, kind, content, created_at) VALUES (?, 'email', ?, ?)",
            (job_id, f"Follow-up email sent to {to} — “{subject}”", ts),
        )
        conn.execute("UPDATE jobs SET updated_at=? WHERE id=?", (ts, job_id))


def delete_note(note_id: int) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))


# ---------------------------------------------------------------- alerts

def add_alert(job_id: int | None, message: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO alerts (job_id, message, created_at) VALUES (?, ?, ?)",
            (job_id, message, now()),
        )


def unseen_alerts() -> list[sqlite3.Row]:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM alerts WHERE seen = 0 ORDER BY id"
        ).fetchall()


def mark_alert_seen(alert_id: int) -> None:
    with get_conn() as conn:
        conn.execute("UPDATE alerts SET seen = 1 WHERE id = ?", (alert_id,))


# ---------------------------------------------------------------- inbox processing

def is_email_processed(message_id: str) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT 1 FROM processed_emails WHERE message_id = ?", (message_id,)
        ).fetchone()
    return row is not None


def mark_email_processed(message_id: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO processed_emails (message_id, processed_at) VALUES (?, ?)",
            (message_id, now()),
        )


def add_inbox_note(job_id: int, content: str) -> None:
    ts = now()
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO notes (job_id, kind, content, created_at) VALUES (?, 'inbox', ?, ?)",
            (job_id, content, ts),
        )
        conn.execute("UPDATE jobs SET updated_at=? WHERE id=?", (ts, job_id))


# ---------------------------------------------------------------- export

def export_rows() -> list[dict]:
    """Every job with its notes folded in, ready for CSV/JSON."""
    with get_conn() as conn:
        jobs = conn.execute("SELECT * FROM jobs ORDER BY id").fetchall()
        notes = conn.execute(
            "SELECT * FROM notes ORDER BY job_id, created_at"
        ).fetchall()

    by_job: dict[int, list[sqlite3.Row]] = {}
    for note in notes:
        by_job.setdefault(note["job_id"], []).append(note)

    out = []
    for job in jobs:
        row = dict(job)
        row["notes"] = [
            {"kind": n["kind"], "content": n["content"], "created_at": n["created_at"]}
            for n in by_job.get(job["id"], [])
        ]
        out.append(row)
    return out
