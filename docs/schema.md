# Data model

The authoritative ERD is represented by `backend/src/db/migrations/001_initial.sql`. Core domains stay separate: attendance, assessment scores, mentor observations, risk flags, interviews, notes, and exams. Audit logs and consent records are cross-cutting tables.
