# Testing plan

## Unit

- Rules engine threshold and explanation text.
- Consent purpose and version handling.
- Under-18 recording restriction.
- MCQ grading and timer state.
- Small-group suppression at fewer than five.

## Integration

- Sensitive reads create audit rows.
- Missing or withdrawn consent returns 403.
- Production startup fails when required governance content is not approved.
- Note view/download permissions and access logs.
- Student ownership of exam attempts.
- Descriptive answers remain pending faculty review.

## End-to-end

- Student changes each consent in Settings.
- Interviewer schedules and joins a one-to-one interview.
- Recording cannot start before consent.
- Student previews a note and a disabled download is rejected.
- Student completes a timed exam and receives explanations.
- Counsellor cannot see feedback until the student shares it.
