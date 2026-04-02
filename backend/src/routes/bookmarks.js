const express = require('express');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await sql`
      SELECT c.*, u.username AS instructor_name,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::int AS lesson_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)::int AS enrollment_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count,
        b.created_at AS bookmarked_at
      FROM bookmarks b
      JOIN courses c ON b.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE b.user_id = ${req.user.id}
      ORDER BY b.created_at DESC
    `;
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:courseId/bookmark', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await sql`SELECT id FROM courses WHERE id = ${courseId}`;
    if (course.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const existing = await sql`
      SELECT 1 FROM bookmarks WHERE user_id = ${userId} AND course_id = ${courseId}
    `;

    if (existing.length > 0) {
      await sql`DELETE FROM bookmarks WHERE user_id = ${userId} AND course_id = ${courseId}`;
      res.json({ success: true, data: { bookmarked: false } });
    } else {
      await sql`INSERT INTO bookmarks (user_id, course_id) VALUES (${userId}, ${courseId})`;
      res.json({ success: true, data: { bookmarked: true } });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
