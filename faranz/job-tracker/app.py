"""Local job application tracker."""
import csv
import io
import json
import os
import threading
import time
from datetime import date

from flask import (
    Flask, Response, abort, flash, jsonify, redirect, render_template,
    request, url_for
)

import db
import emailer
import inbox

app = Flask(__name__)
app.secret_key = "job-ledger-local"  # only used for flash messages, app is local-only
db.init_db()


def start_inbox_poller() -> None:
    """Check the inbox in the background every IMAP_POLL_MINUTES (default 10)."""
    if not inbox.is_configured():
        return
    minutes = int(emailer.load_config().get("IMAP_POLL_MINUTES", "10") or 10)

    def loop():
        time.sleep(10)  # let the server finish starting first
        while True:
            try:
                inbox.check_inbox()
            except Exception as exc:
                print(f"[inbox poller] {exc}")
            time.sleep(minutes * 60)

    threading.Thread(target=loop, daemon=True, name="inbox-poller").start()


def job_or_404(job_id: int):
    job = db.get_job(job_id)
    if job is None:
        abort(404)
    return job


def form_fields() -> dict:
    status = request.form.get("status", "Applied")
    if status not in db.STATUSES:
        status = "Applied"
    return {
        "company": request.form.get("company", "").strip(),
        "title": request.form.get("title", "").strip(),
        "url": request.form.get("url", "").strip(),
        "location": request.form.get("location", "").strip(),
        "salary": request.form.get("salary", "").strip(),
        "status": status,
        "date_applied": request.form.get("date_applied", "").strip(),
        "contact_email": request.form.get("contact_email", "").strip(),
    }


@app.route("/")
def index():
    status = request.args.get("status", "")
    q = request.args.get("q", "")
    jobs = db.list_jobs(status=status, q=q)
    counts = db.status_counts()
    return render_template(
        "index.html",
        jobs=jobs,
        counts=counts,
        total=sum(counts.values()),
        statuses=db.STATUSES,
        active_status=status,
        q=q,
    )


@app.route("/job/new", methods=["GET", "POST"])
def new_job():
    if request.method == "POST":
        fields = form_fields()
        if fields["company"] and fields["title"]:
            job_id = db.create_job(fields)
            return redirect(url_for("job_detail", job_id=job_id))
    return render_template(
        "job_form.html",
        job=None,
        statuses=db.STATUSES,
        today=date.today().isoformat(),
    )


@app.route("/job/<int:job_id>")
def job_detail(job_id: int):
    job = job_or_404(job_id)
    followup_subject = f"Following up on my {job['title']} application"
    followup_body = (
        f"Hi,\n\n"
        f"I recently applied for the {job['title']} position at {job['company']}"
        f"{' on ' + job['date_applied'] if job['date_applied'] else ''} "
        f"and wanted to follow up on the status of my application.\n\n"
        f"I remain very interested in the role and would welcome the chance to "
        f"discuss how I could contribute to the team. Please let me know if you "
        f"need anything further from me.\n\n"
        f"Best regards"
    )
    return render_template(
        "job_detail.html",
        job=job,
        notes=db.list_notes(job_id),
        statuses=db.STATUSES,
        email_configured=emailer.is_configured(),
        followup_subject=followup_subject,
        followup_body=followup_body,
    )


@app.route("/job/<int:job_id>/edit", methods=["GET", "POST"])
def edit_job(job_id: int):
    job = job_or_404(job_id)
    if request.method == "POST":
        fields = form_fields()
        if fields["company"] and fields["title"]:
            if fields["status"] != job["status"]:
                db.set_status(job_id, fields["status"])
            db.update_job(job_id, fields)
            return redirect(url_for("job_detail", job_id=job_id))
    return render_template(
        "job_form.html",
        job=job,
        statuses=db.STATUSES,
        today=date.today().isoformat(),
    )


@app.route("/job/<int:job_id>/status", methods=["POST"])
def change_status(job_id: int):
    job_or_404(job_id)
    status = request.form.get("status", "")
    if status in db.STATUSES:
        db.set_status(job_id, status)
    return redirect(request.referrer or url_for("job_detail", job_id=job_id))


@app.route("/job/<int:job_id>/notes", methods=["POST"])
def add_note(job_id: int):
    job_or_404(job_id)
    content = request.form.get("content", "").strip()
    if content:
        db.add_note(job_id, content)
    return redirect(url_for("job_detail", job_id=job_id))


@app.route("/job/<int:job_id>/followup", methods=["POST"])
def send_followup(job_id: int):
    job_or_404(job_id)
    to = request.form.get("to", "").strip()
    subject = request.form.get("subject", "").strip()
    body = request.form.get("body", "").strip()
    if not (to and subject and body):
        flash("To, subject and body are all required.", "error")
        return redirect(url_for("job_detail", job_id=job_id))
    try:
        emailer.send_email(to, subject, body)
    except Exception as exc:
        flash(f"Could not send email: {exc}", "error")
    else:
        db.log_email(job_id, to, subject)
        flash(f"Follow-up sent to {to}.", "ok")
    return redirect(url_for("job_detail", job_id=job_id))


@app.route("/job/<int:job_id>/delete", methods=["POST"])
def delete_job(job_id: int):
    job_or_404(job_id)
    db.delete_job(job_id)
    return redirect(url_for("index"))


@app.route("/job/<int:job_id>/notes/<int:note_id>/delete", methods=["POST"])
def delete_note(job_id: int, note_id: int):
    job_or_404(job_id)
    db.delete_note(note_id)
    return redirect(url_for("job_detail", job_id=job_id))


# ---------------------------------------------------------------- inbox + alerts

@app.route("/inbox/check", methods=["POST"])
def inbox_check():
    try:
        result = inbox.check_inbox()
    except Exception as exc:
        flash(f"Inbox check failed: {exc}", "error")
    else:
        flash(
            f"Inbox checked: {result['checked']} new email(s), "
            f"{result['matched']} matched, {result['status_updates']} status update(s).",
            "ok",
        )
    return redirect(request.referrer or url_for("index"))


@app.route("/api/alerts")
def api_alerts():
    return jsonify([
        {
            "id": a["id"],
            "job_id": a["job_id"],
            "message": a["message"],
            "created_at": a["created_at"],
        }
        for a in db.unseen_alerts()
    ])


@app.route("/api/alerts/<int:alert_id>/seen", methods=["POST"])
def alert_seen(alert_id: int):
    db.mark_alert_seen(alert_id)
    return ("", 204)


# ---------------------------------------------------------------- export

@app.route("/export/json")
def export_json():
    payload = json.dumps(db.export_rows(), indent=2)
    return Response(
        payload,
        mimetype="application/json",
        headers={"Content-Disposition": "attachment; filename=jobs.json"},
    )


@app.route("/export/csv")
def export_csv():
    rows = db.export_rows()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "company", "title", "url", "location", "salary",
        "status", "date_applied", "contact_email",
        "created_at", "updated_at", "notes",
    ])
    for row in rows:
        notes = " | ".join(
            f"[{n['created_at']}] {n['content']}" for n in row["notes"]
        )
        writer.writerow([
            row["id"], row["company"], row["title"], row["url"],
            row["location"], row["salary"], row["status"],
            row["date_applied"], row["contact_email"],
            row["created_at"], row["updated_at"], notes,
        ])
    # BOM so Excel detects UTF-8 (salary symbols like £ survive)
    return Response(
        "\ufeff" + buf.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=jobs.csv"},
    )


if __name__ == "__main__":
    # Under the debug reloader the module loads twice; only the child
    # (WERKZEUG_RUN_MAIN=true) actually serves, so only it gets the poller.
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        start_inbox_poller()
    app.run(debug=True, port=5050)
