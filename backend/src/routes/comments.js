const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function parseMentions(content) {
  const regex = /@\[([^\]]+)\]/g;
  const mentions = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

router.get('/lessons/:lessonId/comments', optionalAuth, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { page: rawPage = 1, limit: rawLimit = 20 } = req.query;
    const page = Math.max(1, parseInt(rawPage));
    const lim = Math.min(100, Math.max(1, parseInt(rawLimit)));
    const offset = (page - 1) * lim;

    const comments = await sql`
      SELECT c.*, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM comments WHERE parent_id = c.id)::int AS reply_count
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.lesson_id = ${lessonId} AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total FROM comments WHERE lesson_id = ${lessonId} AND parent_id IS NULL
    `;

    const commentIds = comments.map(c => c.id);
    const allReplies = commentIds.length > 0
      ? await sql`
          SELECT c.*, u.username, u.avatar_url
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.parent_id = ANY(${commentIds})
          ORDER BY c.created_at ASC
        `
      : [];
    for (const comment of comments) {
      comment.replies = allReplies.filter(r => r.parent_id === comment.id);
    }

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
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

router.post('/lessons/:lessonId/comments', authenticate, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { content, parent_id } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const lesson = await sql`SELECT id FROM lessons WHERE id = ${lessonId}`;
    if (lesson.length === 0) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    const id = uuidv4();
    const result = await sql`
      INSERT INTO comments (id, user_id, lesson_id, parent_id, content)
      VALUES (${id}, ${userId}, ${lessonId}, ${parent_id || null}, ${content.trim()})
      RETURNING *
    `;

    const comment = result[0];

    const userResult = await sql`SELECT username, avatar_url FROM users WHERE id = ${userId}`;
    comment.username = userResult[0].username;
    comment.avatar_url = userResult[0].avatar_url;
    comment.replies = [];
    comment.reply_count = 0;

    const lessonInfo = await sql`
      SELECT l.title AS lesson_title, c.title AS course_title, c.id AS course_id
      FROM lessons l JOIN courses c ON l.course_id = c.id
      WHERE l.id = ${lessonId}
    `;
    const lessonTitle = lessonInfo[0]?.lesson_title || '';
    const courseTitle = lessonInfo[0]?.course_title || '';
    const courseId = lessonInfo[0]?.course_id || '';

    const mentionedUsernames = parseMentions(content);
    const notifiedUserIds = new Set();
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await sql`
        SELECT id, username FROM users WHERE username = ANY(${mentionedUsernames})
      `;
      for (const mentioned of mentionedUsers) {
        if (mentioned.id !== userId) {
          await sql`
            INSERT INTO comment_mentions (comment_id, mentioned_user_id)
            VALUES (${id}, ${mentioned.id})
            ON CONFLICT DO NOTHING
          `;
          notifiedUserIds.add(mentioned.id);
          const notifId = uuidv4();
          await sql`
            INSERT INTO notifications (id, user_id, type, reference_id, reference_type, message)
            VALUES (${notifId}, ${mentioned.id}, 'mention', ${id}, 'comment',
              ${`${comment.username} mentioned you in ${lessonTitle} — ${courseTitle}|${lessonId}|${courseId}`})
          `;
        }
      }
    }

    if (parent_id) {
      const parentComment = await sql`SELECT user_id FROM comments WHERE id = ${parent_id}`;
      if (parentComment.length > 0 && parentComment[0].user_id !== userId && !notifiedUserIds.has(parentComment[0].user_id)) {
        const notifId = uuidv4();
        await sql`
          INSERT INTO notifications (id, user_id, type, reference_id, reference_type, message)
          VALUES (${notifId}, ${parentComment[0].user_id}, 'reply', ${id}, 'comment',
            ${`${comment.username} replied to your comment in ${lessonTitle} — ${courseTitle}|${lessonId}|${courseId}`})
        `;
      }
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

router.put('/comments/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'Content is required and must be a string' });
    }

    const existing = await sql`SELECT * FROM comments WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const result = await sql`
      UPDATE comments SET content = ${content.trim()}, updated_at = NOW()
      WHERE id = ${id} RETURNING *
    `;
    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/comments/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await sql`SELECT * FROM comments WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await sql`DELETE FROM comments WHERE id = ${id}`;
    res.json({ success: true, data: { message: 'Comment deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
