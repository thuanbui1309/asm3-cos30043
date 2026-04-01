const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { q, category, difficulty, page = 1, limit = 10, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);
    const search = q ? `%${q}%` : null;
    const cat = category || null;
    const diff = difficulty || null;

    const orderClauses = {
      newest: sql`c.created_at DESC`,
      popular: sql`enrollment_count DESC, c.created_at DESC`,
      rating: sql`avg_rating DESC, review_count DESC`,
      'price-asc': sql`c.price ASC, c.created_at DESC`,
      'price-desc': sql`c.price DESC, c.created_at DESC`,
    };
    const orderBy = orderClauses[sort] || orderClauses.newest;

    const courses = await sql`
      SELECT c.*, u.username AS instructor_name,
        (SELECT COUNT(*) FROM likes WHERE course_id = c.id)::int AS like_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::int AS lesson_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)::int AS enrollment_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE (${search}::text IS NULL OR c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
        AND (${cat}::text IS NULL OR c.category = ${cat})
        AND (${diff}::text IS NULL OR c.difficulty = ${diff})
      ORDER BY ${orderBy}
      LIMIT ${lim} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) FROM courses c
      WHERE (${search}::text IS NULL OR c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
        AND (${cat}::text IS NULL OR c.category = ${cat})
        AND (${diff}::text IS NULL OR c.difficulty = ${diff})
    `;
    const total = parseInt(countResult[0].count);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
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

router.get('/featured', optionalAuth, async (req, res, next) => {
  try {
    const popular = await sql`
      SELECT c.*, u.username AS instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)::int AS enrollment_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::int AS lesson_count
      FROM courses c JOIN users u ON c.instructor_id = u.id
      ORDER BY enrollment_count DESC LIMIT 4
    `;
    const topRated = await sql`
      SELECT c.*, u.username AS instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)::int AS enrollment_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::int AS lesson_count
      FROM courses c JOIN users u ON c.instructor_id = u.id
      ORDER BY avg_rating DESC, review_count DESC LIMIT 4
    `;
    const newest = await sql`
      SELECT c.*, u.username AS instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)::int AS enrollment_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::int AS lesson_count
      FROM courses c JOIN users u ON c.instructor_id = u.id
      ORDER BY c.created_at DESC LIMIT 4
    `;
    res.json({ success: true, data: { popular, top_rated: topRated, newest } });
  } catch (error) {
    next(error);
  }
});

router.get('/continue', authenticate, async (req, res, next) => {
  try {
    const result = await sql`
      SELECT c.*, u.username AS instructor_name, e.progress,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id)::int AS lesson_count,
        (SELECT COALESCE(json_agg(id ORDER BY order_index), '[]'::json) FROM lessons WHERE course_id = c.id) AS lesson_ids
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ${req.user.id}
      ORDER BY e.purchased_at DESC LIMIT 4
    `;
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const result = await sql`
      SELECT
        (SELECT COUNT(*) FROM courses)::int AS course_count,
        (SELECT COUNT(*) FROM users WHERE role = 'student')::int AS student_count,
        (SELECT COUNT(*) FROM users WHERE role = 'instructor')::int AS instructor_count
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, error: 'Only instructors can access this' });
    }
    const courses = await sql`
      SELECT c.*, u.username AS instructor_name,
        COUNT(DISTINCT e.id)::int AS student_count,
        COUNT(DISTINCT l.id)::int AS lesson_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN lessons l ON l.course_id = c.id
      WHERE c.instructor_id = ${req.user.id}
      GROUP BY c.id, u.username
      ORDER BY c.created_at DESC
    `;
    res.json({ success: true, data: { courses } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const courseResult = await sql`
      SELECT c.*, u.username AS instructor_name, u.bio AS instructor_bio, u.avatar_url AS instructor_avatar,
        (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id)::int AS enrollment_count,
        COALESCE((SELECT AVG(rating) FROM reviews WHERE course_id = c.id), 0) AS avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id)::int AS review_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ${id}
    `;

    if (courseResult.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const course = courseResult[0];

    const lessonsResult = await sql`
      SELECT id, title, video_url, description, order_index
      FROM lessons WHERE course_id = ${id}
      ORDER BY order_index ASC
    `;

    let userLiked = false;
    let isEnrolled = false;
    let userBookmarked = false;
    if (req.user) {
      const likeResult = await sql`
        SELECT 1 FROM likes WHERE user_id = ${req.user.id} AND course_id = ${id}
      `;
      userLiked = likeResult.length > 0;
      const enrollResult = await sql`
        SELECT 1 FROM enrollments WHERE user_id = ${req.user.id} AND course_id = ${id}
      `;
      isEnrolled = enrollResult.length > 0;
      const bookmarkResult = await sql`
        SELECT 1 FROM bookmarks WHERE user_id = ${req.user.id} AND course_id = ${id}
      `;
      userBookmarked = bookmarkResult.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...course,
        lessons: lessonsResult,
        user_liked: userLiked,
        is_enrolled: isEnrolled,
        user_bookmarked: userBookmarked,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, error: 'Only instructors can create courses' });
    }

    const { title, description, category, difficulty, price, thumbnail_url } = req.body;

    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({ success: false, error: 'Title, description, category, and difficulty are required' });
    }

    const id = uuidv4();
    const result = await sql`
      INSERT INTO courses (id, instructor_id, title, description, category, difficulty, price, thumbnail_url)
      VALUES (${id}, ${req.user.id}, ${title}, ${description}, ${category}, ${difficulty}, ${price || 0}, ${thumbnail_url || null})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT instructor_id FROM courses WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    if (existing[0].instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this course' });
    }

    const { title, description, category, difficulty, price, thumbnail_url } = req.body;

    const result = await sql`
      UPDATE courses SET
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description || null}, description),
        category = COALESCE(${category || null}, category),
        difficulty = COALESCE(${difficulty || null}, difficulty),
        price = COALESCE(${price !== undefined ? price : null}, price),
        thumbnail_url = COALESCE(${thumbnail_url || null}, thumbnail_url),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT instructor_id FROM courses WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    if (existing[0].instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this course' });
    }

    await sql`DELETE FROM likes WHERE course_id = ${id}`;
    await sql`DELETE FROM lessons WHERE course_id = ${id}`;
    await sql`DELETE FROM enrollments WHERE course_id = ${id}`;
    await sql`DELETE FROM payments WHERE course_id = ${id}`;
    await sql`DELETE FROM courses WHERE id = ${id}`;

    res.json({ success: true, data: { message: 'Course deleted' } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await sql`
      SELECT 1 FROM likes WHERE user_id = ${userId} AND course_id = ${id}
    `;

    if (existing.length > 0) {
      await sql`DELETE FROM likes WHERE user_id = ${userId} AND course_id = ${id}`;
    } else {
      await sql`INSERT INTO likes (user_id, course_id) VALUES (${userId}, ${id})`;
    }

    const countResult = await sql`SELECT COUNT(*) FROM likes WHERE course_id = ${id}`;

    res.json({
      success: true,
      data: {
        liked: existing.length === 0,
        like_count: parseInt(countResult[0].count),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
