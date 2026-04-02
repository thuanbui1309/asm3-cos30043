const express = require('express');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const TRANSACTION_PREFIX = 'SEVQR';
const INBOUND_TRANSFER_TYPE = 'in';

const router = express.Router();

router.get('/qr-proxy', (req, res) => {
  const { url } = req.query;
  if (!url || !url.startsWith('https://img.vietqr.io/')) {
    return res.status(400).json({ success: false, error: 'Invalid QR URL' });
  }
  https.get(url, (upstream) => {
    res.setHeader('Content-Type', upstream.headers['content-type'] || 'image/jpeg');
    upstream.pipe(res);
  }).on('error', () => res.status(502).end());
});

router.post('/create', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can make payments' });
    }
    const { course_id, method } = req.body;

    if (!course_id) {
      return res.status(400).json({ success: false, error: 'Course ID is required' });
    }

    const course = await sql`SELECT id, price, title FROM courses WHERE id = ${course_id}`;
    if (course.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const existing = await sql`
      SELECT id FROM enrollments WHERE user_id = ${req.user.id} AND course_id = ${course_id}
    `;
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Already enrolled in this course' });
    }

    const id = uuidv4();
    const transactionId = `${TRANSACTION_PREFIX} TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const amount = course[0].price;

    const result = await sql`
      INSERT INTO payments (id, user_id, course_id, amount, method, transaction_id, status)
      VALUES (${id}, ${req.user.id}, ${course_id}, ${amount}, ${method || 'sepay'}, ${transactionId}, 'pending')
      RETURNING *
    `;

    const bankCode = process.env.BANK_CODE;
    const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
    const accountName = process.env.BANK_ACCOUNT_NAME || '';
    let qrUrl = null;
    if (bankCode && accountNumber) {
      qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg`
        + `?amount=${encodeURIComponent(amount)}`
        + `&addInfo=${encodeURIComponent(transactionId)}`
        + `&accountName=${encodeURIComponent(accountName)}`;
    }

    res.status(201).json({
      success: true,
      data: {
        payment: result[0],
        qr_url: qrUrl,
        transfer_content: transactionId,
        qr_info: {
          amount,
          transaction_id: transactionId,
          description: `Payment for ${course[0].title}`,
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

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        headers JSONB,
        body JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      INSERT INTO webhook_logs (headers, body)
      VALUES (${JSON.stringify(req.headers)}::jsonb, ${JSON.stringify(req.body)}::jsonb)
    `;
    const authHeader = req.headers['authorization'] || '';
    const match = authHeader.match(/^(?:Bearer|Apikey)\s+(.+)$/i);
    const apiKey = (match && match[1]) || req.body.api_key;

    if (!apiKey || apiKey !== process.env.SEPAY_API_KEY) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    if (req.body.transferType !== INBOUND_TRANSFER_TYPE) {
      return res.json({ success: true, data: { message: 'Ignored' } });
    }

    const content = req.body.content || '';
    if (!content.includes('TXN')) {
      return res.json({ success: true, data: { message: 'Ignored: no transaction ID' } });
    }

    const contentClean = content.replace(/[\s\-]/g, '').toUpperCase();

    const pendingPayments = await sql`SELECT * FROM payments WHERE status = 'pending'`;
    const payment = pendingPayments.filter((p) => {
      const cleanTxn = p.transaction_id.replace(/[\s\-]/g, '').toUpperCase();
      return contentClean.includes(cleanTxn);
    });

    if (payment.length === 0) {
      return res.json({ success: true, data: { message: 'Ignored: no matching payment' } });
    }

    const paymentData = payment[0];

    if (Number(req.body.transferAmount) < Number(paymentData.amount)) {
      return res.json({ success: true, data: { message: 'Ignored: insufficient amount' } });
    }

    const updated = await sql`
      UPDATE payments SET status = 'completed'
      WHERE id = ${paymentData.id} AND status = 'pending'
      RETURNING *
    `;
    if (updated.length === 0) {
      return res.json({ success: true, data: { message: 'Ignored: already processed' } });
    }

    const existingEnrollment = await sql`
      SELECT id FROM enrollments
      WHERE user_id = ${paymentData.user_id} AND course_id = ${paymentData.course_id}
    `;
    if (existingEnrollment.length === 0) {
      const enrollmentId = uuidv4();
      await sql`
        INSERT INTO enrollments (id, user_id, course_id, progress)
        VALUES (${enrollmentId}, ${paymentData.user_id}, ${paymentData.course_id}, ${'{}'}::jsonb)
      `;
    }

    res.json({ success: true, data: { message: 'Payment completed' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
