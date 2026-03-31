ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0,
  DROP COLUMN IF EXISTS description;

DELETE FROM database_migrations WHERE version = 'v2';
