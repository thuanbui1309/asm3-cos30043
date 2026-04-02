require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const lessonsRoutes = require('./routes/lessons');
const enrollmentsRoutes = require('./routes/enrollments');
const paymentsRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');
const reviewsRoutes = require('./routes/reviews');
const bookmarksRoutes = require('./routes/bookmarks');
const commentsRoutes = require('./routes/comments');
const notificationsRoutes = require('./routes/notifications');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(compression());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', lessonsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', reviewsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api', bookmarksRoutes);
app.use('/api', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api', notesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use((err, req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
