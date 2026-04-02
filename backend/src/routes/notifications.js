const express = require('express');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page: rawPage = 1, limit: rawLimit = 20 } = req.query;
    const page = Math.max(1, parseInt(rawPage));
    const lim = Math.min(100, Math.max(1, parseInt(rawLimit)));
    const offset = (page - 1) * lim;

    const [notifications, countResult] = await Promise.all([
      sql`
        SELECT * FROM notifications
        WHERE user_id = ${req.user.id}
        ORDER BY created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int AS total FROM notifications
        WHERE user_id = ${req.user.id}
      `,
    ]);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit: lim,
          total,
          pages: Math.ceil(total / lim),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const result = await sql`
      SELECT COUNT(*)::int AS count FROM notifications
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `;
    res.json({ success: true, data: { count: result[0].count } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    await sql`
      UPDATE notifications SET is_read = TRUE
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (error) {
    next(error);
  }
});

router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await sql`
      UPDATE notifications SET is_read = TRUE
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `;
    res.json({ success: true, data: { message: 'All marked as read' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
