const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { q, category, difficulty, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let courses;
    let countResult;

    if (q && category && difficulty) {
      const search = `%${q}%`;
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE (c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
          AND c.category = ${category}
          AND c.difficulty = ${difficulty}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c
        WHERE (c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
          AND c.category = ${category}
          AND c.difficulty = ${difficulty}
      `;
    } else if (q && category) {
      const search = `%${q}%`;
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE (c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
          AND c.category = ${category}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c
        WHERE (c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
          AND c.category = ${category}
      `;
    } else if (q && difficulty) {
      const search = `%${q}%`;
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE (c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
          AND c.difficulty = ${difficulty}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c
        WHERE (c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search})
          AND c.difficulty = ${difficulty}
      `;
    } else if (category && difficulty) {
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.category = ${category} AND c.difficulty = ${difficulty}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c
        WHERE c.category = ${category} AND c.difficulty = ${difficulty}
      `;
    } else if (q) {
      const search = `%${q}%`;
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c
        WHERE c.title ILIKE ${search} OR c.description ILIKE ${search} OR c.category ILIKE ${search}
      `;
    } else if (category) {
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.category = ${category}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c WHERE c.category = ${category}
      `;
    } else if (difficulty) {
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.difficulty = ${difficulty}
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM courses c WHERE c.difficulty = ${difficulty}
      `;
    } else {
      courses = await sql`
        SELECT c.*, u.username AS instructor_name,
          (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        ORDER BY c.created_at DESC
        LIMIT ${lim} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*) FROM courses`;
    }

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        courses: courses.rows,
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

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const courseResult = await sql`
      SELECT c.*, u.username AS instructor_name,
        (SELECT COUNT(*) FROM likes WHERE course_id = c.id) AS like_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ${id}
    `;

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    const lessonsResult = await sql`
      SELECT id, title, video_url, duration, order_index
      FROM lessons WHERE course_id = ${id}
      ORDER BY order_index ASC
    `;

    let userLiked = false;
    if (req.user) {
      const likeResult = await sql`
        SELECT 1 FROM likes WHERE user_id = ${req.user.id} AND course_id = ${id}
      `;
      userLiked = likeResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: {
        ...course,
        lessons: lessonsResult.rows,
        user_liked: userLiked,
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

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT instructor_id FROM courses WHERE id = ${id}`;
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    if (existing.rows[0].instructor_id !== req.user.id) {
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

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT instructor_id FROM courses WHERE id = ${id}`;
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    if (existing.rows[0].instructor_id !== req.user.id) {
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

    if (existing.rows.length > 0) {
      await sql`DELETE FROM likes WHERE user_id = ${userId} AND course_id = ${id}`;
    } else {
      await sql`INSERT INTO likes (user_id, course_id) VALUES (${userId}, ${id})`;
    }

    const countResult = await sql`SELECT COUNT(*) FROM likes WHERE course_id = ${id}`;

    res.json({
      success: true,
      data: {
        liked: existing.rows.length === 0,
        like_count: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
