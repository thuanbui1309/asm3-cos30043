ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS description TEXT,
  DROP COLUMN IF EXISTS duration;

INSERT INTO database_migrations (version, description, applied_by, script_name)
VALUES (
    'v2',
    'lessons: replace duration with description',
    'manual',
    'v2/up.sql'
);
