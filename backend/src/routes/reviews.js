const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/courses/:courseId/reviews', optionalAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    const reviews = await sql`
      SELECT r.*, u.username, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ${courseId}
      ORDER BY r.created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total FROM reviews WHERE course_id = ${courseId}
    `;

    const aggregate = await sql`
      SELECT
        COALESCE(AVG(rating), 0) AS avg_rating,
        COUNT(*)::int AS total_reviews,
        COUNT(*) FILTER (WHERE rating = 1)::int AS r1,
        COUNT(*) FILTER (WHERE rating = 2)::int AS r2,
        COUNT(*) FILTER (WHERE rating = 3)::int AS r3,
        COUNT(*) FILTER (WHERE rating = 4)::int AS r4,
        COUNT(*) FILTER (WHERE rating = 5)::int AS r5
      FROM reviews WHERE course_id = ${courseId}
    `;

    const agg = aggregate[0];

    let userReview = null;
    if (req.user) {
      const ur = await sql`
        SELECT * FROM reviews WHERE user_id = ${req.user.id} AND course_id = ${courseId}
      `;
      if (ur.length > 0) userReview = ur[0];
    }

    res.json({
      success: true,
      data: {
        reviews,
        user_review: userReview,
        aggregate: {
          avg_rating: parseFloat(Number(agg.avg_rating).toFixed(1)),
          total_reviews: agg.total_reviews,
          distribution: { 1: agg.r1, 2: agg.r2, 3: agg.r3, 4: agg.r4, 5: agg.r5 },
        },
        pagination: {
          page: parseInt(page),
          limit: lim,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / lim),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:courseId/reviews', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const enrolled = await sql`
      SELECT 1 FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}
    `;
    if (enrolled.length === 0) {
      return res.status(403).json({ success: false, error: 'You must be enrolled to review this course' });
    }

    const existing = await sql`
      SELECT 1 FROM reviews WHERE user_id = ${userId} AND course_id = ${courseId}
    `;
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'You have already reviewed this course' });
    }

    const id = uuidv4();
    const result = await sql`
      INSERT INTO reviews (id, user_id, course_id, rating, comment)
      VALUES (${id}, ${userId}, ${courseId}, ${rating}, ${comment || null})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/reviews/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existing = await sql`SELECT * FROM reviews WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const result = await sql`
      UPDATE reviews SET
        rating = COALESCE(${rating || null}, rating),
        comment = ${comment !== undefined ? comment : existing[0].comment},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/reviews/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT * FROM reviews WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await sql`DELETE FROM reviews WHERE id = ${id}`;
    res.json({ success: true, data: { message: 'Review deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
