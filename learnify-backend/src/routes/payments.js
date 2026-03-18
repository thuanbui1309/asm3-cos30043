const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticate, async (req, res, next) => {
  try {
    const { course_id, method } = req.body;

    if (!course_id) {
      return res.status(400).json({ success: false, error: 'Course ID is required' });
    }

    const course = await sql`SELECT id, price, title FROM courses WHERE id = ${course_id}`;
    if (course.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const existing = await sql`
      SELECT id FROM enrollments WHERE user_id = ${req.user.id} AND course_id = ${course_id}
    `;
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Already enrolled in this course' });
    }

    const id = uuidv4();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const amount = course.rows[0].price;

    const result = await sql`
      INSERT INTO payments (id, user_id, course_id, amount, method, transaction_id, status)
      VALUES (${id}, ${req.user.id}, ${course_id}, ${amount}, ${method || 'sepay'}, ${transactionId}, 'pending')
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: {
        payment: result.rows[0],
        qr_info: {
          amount,
          transaction_id: transactionId,
          description: `Payment for ${course.rows[0].title}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await sql`
      SELECT * FROM payments WHERE id = ${id} AND user_id = ${req.user.id}
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const { transaction_id, status, api_key } = req.body;

    if (api_key !== process.env.SEPAY_API_KEY) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    const payment = await sql`
      SELECT * FROM payments WHERE transaction_id = ${transaction_id}
    `;
    if (payment.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const paymentData = payment.rows[0];
    const newStatus = status === 'success' ? 'completed' : 'failed';

    await sql`
      UPDATE payments SET status = ${newStatus} WHERE id = ${paymentData.id}
    `;

    if (newStatus === 'completed') {
      const existingEnrollment = await sql`
        SELECT id FROM enrollments
        WHERE user_id = ${paymentData.user_id} AND course_id = ${paymentData.course_id}
      `;

      if (existingEnrollment.rows.length === 0) {
        const enrollmentId = uuidv4();
        await sql`
          INSERT INTO enrollments (id, user_id, course_id, progress)
          VALUES (${enrollmentId}, ${paymentData.user_id}, ${paymentData.course_id}, ${'{}'}::jsonb)
        `;
      }
    }

    res.json({ success: true, data: { message: 'Webhook processed' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
