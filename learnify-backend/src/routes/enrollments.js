const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await sql`
      SELECT e.*, c.title, c.description, c.category, c.difficulty,
        c.thumbnail_url, c.price, u.username AS instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ${req.user.id}
      ORDER BY e.purchased_at DESC
    `;

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { course_id, payment_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ success: false, error: 'Course ID is required' });
    }

    const existing = await sql`
      SELECT id FROM enrollments WHERE user_id = ${req.user.id} AND course_id = ${course_id}
    `;
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Already enrolled in this course' });
    }

    if (payment_id) {
      const payment = await sql`
        SELECT status FROM payments WHERE id = ${payment_id} AND user_id = ${req.user.id}
      `;
      if (payment.rows.length === 0 || payment.rows[0].status !== 'completed') {
        return res.status(400).json({ success: false, error: 'Payment not verified' });
      }
    }

    const id = uuidv4();
    const result = await sql`
      INSERT INTO enrollments (id, user_id, course_id, progress)
      VALUES (${id}, ${req.user.id}, ${course_id}, ${'{}'}::jsonb)
      RETURNING *
    `;

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/progress', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const enrollment = await sql`
      SELECT user_id FROM enrollments WHERE id = ${id}
    `;
    if (enrollment.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }
    if (enrollment.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const result = await sql`
      UPDATE enrollments SET progress = ${JSON.stringify(progress)}::jsonb
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
