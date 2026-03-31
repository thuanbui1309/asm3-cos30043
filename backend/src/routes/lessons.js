const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/courses/:id/lessons', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, error: 'Only instructors can add lessons' });
    }
    const { id: courseId } = req.params;

    const course = await sql`SELECT instructor_id FROM courses WHERE id = ${courseId}`;
    if (course.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    if (course[0].instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to add lessons to this course' });
    }

    const { title, video_url, description, order_index } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const id = uuidv4();
    const result = await sql`
      INSERT INTO lessons (id, course_id, title, video_url, description, order_index)
      VALUES (${id}, ${courseId}, ${title}, ${video_url || null}, ${description || null}, ${order_index || 0})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/lessons/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, error: 'Only instructors can update lessons' });
    }
    const { id } = req.params;

    const lesson = await sql`
      SELECT l.*, c.instructor_id FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = ${id}
    `;
    if (lesson.length === 0) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    if (lesson[0].instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this lesson' });
    }

    const { title, video_url, description, order_index } = req.body;

    const result = await sql`
      UPDATE lessons SET
        title = COALESCE(${title || null}, title),
        video_url = COALESCE(${video_url || null}, video_url),
        description = COALESCE(${description || null}, description),
        order_index = COALESCE(${order_index !== undefined ? order_index : null}, order_index)
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/lessons/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, error: 'Only instructors can delete lessons' });
    }
    const { id } = req.params;

    const lesson = await sql`
      SELECT l.*, c.instructor_id FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = ${id}
    `;
    if (lesson.length === 0) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    if (lesson[0].instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this lesson' });
    }

    await sql`DELETE FROM lessons WHERE id = ${id}`;

    res.json({ success: true, data: { message: 'Lesson deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
