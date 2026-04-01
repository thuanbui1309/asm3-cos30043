DROP TABLE IF EXISTS comment_mentions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS reviews;

ALTER TABLE users
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS avatar_url;

DELETE FROM database_migrations WHERE version = 'v3';
