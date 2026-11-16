# Security checklist

- [ ] Replace demo headers with university SSO/OIDC.
- [ ] Use TLS for API, database, object storage, and video provider traffic.
- [ ] Store secrets outside source control.
- [ ] Use S3-compatible signed URLs with short expiry.
- [ ] Scan PDFs before marking them clean.
- [ ] Enforce maximum upload size and PDF MIME/signature validation.
- [ ] Rate-limit authentication, uploads, signed URLs, quiz starts, and answer saves.
- [ ] Verify course enrolment for note access.
- [ ] Verify consent for attendance, marks, recording, and counsellor feedback.
- [ ] Keep audit logs append-only and prevent application updates/deletes.
- [ ] Suppress aggregate groups below five students.
- [ ] Review npm audit findings before pilot.
- [ ] Test backup restore and retention deletion jobs.
