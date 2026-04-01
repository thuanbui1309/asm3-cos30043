const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/lessons/:lessonId/notes', authenticate, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const result = await sql`
      SELECT * FROM notes
      WHERE user_id = ${req.user.id} AND lesson_id = ${lessonId}
      ORDER BY timestamp_sec ASC, created_at ASC
    `;
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/lessons/:lessonId/notes', authenticate, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { content, timestamp_sec = 0 } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const id = uuidv4();
    const result = await sql`
      INSERT INTO notes (id, user_id, lesson_id, content, timestamp_sec)
      VALUES (${id}, ${req.user.id}, ${lessonId}, ${content.trim()}, ${timestamp_sec})
      RETURNING *
    `;
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/notes/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const existing = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Note not found' });
    if (existing[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    const result = await sql`
      UPDATE notes SET content = ${content.trim()}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/notes/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Note not found' });
    if (existing[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    await sql`DELETE FROM notes WHERE id = ${id}`;
    res.json({ success: true, data: { message: 'Note deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
