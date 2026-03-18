-- Users: 2 instructors, 3 students
-- Passwords are bcrypt hashes of "password123"
INSERT INTO users (id, username, email, password, role) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dr. Sarah Chen', 'sarah@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'instructor'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Prof. James Wilson', 'james@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'instructor'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Alice Nguyen', 'alice@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Bob Martinez', 'bob@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Charlie Kim', 'charlie@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student');

-- Courses: 6 across categories
INSERT INTO courses (id, instructor_id, title, description, category, difficulty, price, thumbnail_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Modern JavaScript Fundamentals', 'Master the core concepts of modern JavaScript including ES6+, async/await, and DOM manipulation.', 'Web Dev', 'beginner', 29.99, 'https://res.cloudinary.com/demo/image/upload/v1/courses/js-fundamentals.jpg'),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Vue.js 3 Complete Guide', 'Build production-ready applications with Vue.js 3, Composition API, and Vue Router.', 'Web Dev', 'intermediate', 49.99, 'https://res.cloudinary.com/demo/image/upload/v1/courses/vue3-guide.jpg'),
  ('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Python for Data Science', 'Learn data analysis, visualization, and machine learning with Python, pandas, and scikit-learn.', 'Data Science', 'beginner', 39.99, 'https://res.cloudinary.com/demo/image/upload/v1/courses/python-ds.jpg'),
  ('44444444-4444-4444-4444-444444444444', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Advanced Machine Learning', 'Deep dive into neural networks, NLP, and computer vision with TensorFlow and PyTorch.', 'Data Science', 'advanced', 79.99, 'https://res.cloudinary.com/demo/image/upload/v1/courses/advanced-ml.jpg'),
  ('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'React Native Mobile Apps', 'Build cross-platform mobile applications with React Native and Expo.', 'Mobile Dev', 'intermediate', 59.99, 'https://res.cloudinary.com/demo/image/upload/v1/courses/react-native.jpg'),
  ('66666666-6666-6666-6666-666666666666', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'UI/UX Design Principles', 'Master user interface and experience design fundamentals using Figma and design thinking.', 'Design', 'beginner', 34.99, 'https://res.cloudinary.com/demo/image/upload/v1/courses/uiux-design.jpg');

-- Lessons: 3-4 per course
INSERT INTO lessons (id, course_id, title, video_url, duration, order_index) VALUES
  -- JS Fundamentals
  ('aaa11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Variables and Data Types', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/js-variables.mp4', 1200, 1),
  ('aaa22222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Functions and Scope', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/js-functions.mp4', 1500, 2),
  ('aaa33333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Async/Await and Promises', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/js-async.mp4', 1800, 3),
  -- Vue.js 3
  ('bbb11111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Vue 3 Project Setup', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/vue-setup.mp4', 900, 1),
  ('bbb22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Composition API Deep Dive', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/vue-composition.mp4', 2100, 2),
  ('bbb33333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Vue Router and Navigation', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/vue-router.mp4', 1600, 3),
  ('bbb44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'State Management with Pinia', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/vue-pinia.mp4', 1400, 4),
  -- Python DS
  ('ccc11111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Python Basics for Data', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/python-basics.mp4', 1300, 1),
  ('ccc22222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Pandas DataFrames', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/python-pandas.mp4', 1700, 2),
  ('ccc33333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Data Visualization with Matplotlib', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/python-matplotlib.mp4', 1500, 3),
  -- Advanced ML
  ('ddd11111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Neural Network Fundamentals', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ml-neural.mp4', 2000, 1),
  ('ddd22222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Convolutional Neural Networks', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ml-cnn.mp4', 2400, 2),
  ('ddd33333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Natural Language Processing', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ml-nlp.mp4', 2200, 3),
  ('ddd44444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Model Deployment', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ml-deploy.mp4', 1800, 4),
  -- React Native
  ('eee11111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Expo and React Native Setup', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/rn-setup.mp4', 1100, 1),
  ('eee22222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'Components and Navigation', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/rn-components.mp4', 1900, 2),
  ('eee33333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'State and API Integration', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/rn-state.mp4', 1600, 3),
  -- UI/UX Design
  ('fff11111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Design Thinking Process', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ux-thinking.mp4', 1200, 1),
  ('fff22222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Figma Essentials', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ux-figma.mp4', 1800, 2),
  ('fff33333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Prototyping and User Testing', 'https://res.cloudinary.com/demo/video/upload/v1/lessons/ux-prototype.mp4', 1500, 3);

-- Enrollments
INSERT INTO enrollments (id, user_id, course_id, progress) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111111', '{"completed_lessons": ["aaa11111-1111-1111-1111-111111111111"]}'),
  ('aaaa2222-2222-2222-2222-222222222222', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '22222222-2222-2222-2222-222222222222', '{}'),
  ('aaaa3333-3333-3333-3333-333333333333', 'd4e5f6a7-b8c9-0123-defa-234567890123', '33333333-3333-3333-3333-333333333333', '{"completed_lessons": ["ccc11111-1111-1111-1111-111111111111", "ccc22222-2222-2222-2222-222222222222"]}'),
  ('aaaa4444-4444-4444-4444-444444444444', 'e5f6a7b8-c9d0-1234-efab-345678901234', '66666666-6666-6666-6666-666666666666', '{}');

-- Likes
INSERT INTO likes (user_id, course_id) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111111'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', '22222222-2222-2222-2222-222222222222'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111111'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', '33333333-3333-3333-3333-333333333333'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', '22222222-2222-2222-2222-222222222222'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', '55555555-5555-5555-5555-555555555555'),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', '66666666-6666-6666-6666-666666666666');
