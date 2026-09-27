# Teacher feedback and statistics

Teachers record a lesson topic and an internal comment from the attendance menu.
Saving marks the lesson as needing help. The Statistics tab groups these records
by student; selecting a student opens the full history in a right-side drawer.
History is loaded in pages of 50 records. Existing internal notes are preserved.

Feedback text is private to teachers. Family API responses omit lesson comments,
private notes, and understanding assessments. Saving feedback does not notify
families. Public support-session tasks do not automatically copy private comments.

The backend statistics and student-feedback endpoints must be deployed before
this frontend. No database migration is required for this change.
