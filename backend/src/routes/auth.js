const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Username, email, and password are required' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters with 1 uppercase letter and 1 number' });
    }

    const userRole = role === 'instructor' ? 'instructor' : 'student';

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await sql`
      INSERT INTO users (id, username, email, password, role)
      VALUES (${id}, ${username}, ${email}, ${hashedPassword}, ${userRole})
      RETURNING id, username, email, role, created_at
    `;

    const user = result[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await sql`
      SELECT id, username, email, role, created_at
      FROM users WHERE id = ${req.user.id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, error: 'Username and email are required' });
    }

    const emailTaken = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${req.user.id}`;
    if (emailTaken.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already in use by another account' });
    }

    const result = await sql`
      UPDATE users SET username = ${username}, email = ${email}
      WHERE id = ${req.user.id}
      RETURNING id, username, email, role, created_at
    `;

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q = '', course_id } = req.query;

    if (!course_id && !q) {
      return res.json({ success: true, data: [] });
    }

    let result;
    if (course_id && q) {
      result = await sql`
        SELECT u.id, u.username, u.avatar_url, u.role FROM users u
        WHERE u.username ILIKE ${`${q}%`}
          AND (
            u.id IN (SELECT user_id FROM enrollments WHERE course_id = ${course_id})
            OR u.id = (SELECT instructor_id FROM courses WHERE id = ${course_id})
          )
        ORDER BY
          CASE WHEN u.role = 'instructor' THEN 0 ELSE 1 END,
          u.username
        LIMIT 10
      `;
    } else if (course_id) {
      result = await sql`
        SELECT u.id, u.username, u.avatar_url, u.role FROM users u
        WHERE (
          u.id IN (SELECT user_id FROM enrollments WHERE course_id = ${course_id})
          OR u.id = (SELECT instructor_id FROM courses WHERE id = ${course_id})
        )
        ORDER BY
          CASE WHEN u.role = 'instructor' THEN 0 ELSE 1 END,
          u.username
        LIMIT 10
      `;
    } else {
      result = await sql`
        SELECT id, username, avatar_url, role FROM users
        WHERE username ILIKE ${`${q}%`}
        LIMIT 5
      `;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
