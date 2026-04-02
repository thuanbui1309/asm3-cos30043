require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const postgres = require('postgres')
const { v4: uuidv4 } = require('uuid')

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

const INSTRUCTORS = [
  { username: 'alex_dev',   email: 'alex@learnify.dev',  bio: 'Full-stack developer & educator. 10+ years building web apps.' },
  { username: 'sarah_chen', email: 'sarah@learnify.dev', bio: 'Data scientist at heart. Teaching ML & Python since 2018.' },
  { username: 'minh_tran',  email: 'minh@learnify.dev',  bio: 'Mobile developer specializing in React Native & Flutter.' },
  { username: 'lisa_park',  email: 'lisa@learnify.dev',   bio: 'UI/UX designer turned instructor. Design thinking advocate.' },
]

const STUDENTS = [
  'anna_lee', 'bob_smith', 'charlie_wang', 'diana_ross', 'eric_zhang',
  'fiona_clark', 'george_liu', 'hannah_kim', 'ivan_petrov', 'julia_chen',
  'kevin_brown', 'lena_nguyen', 'marcus_jones', 'nina_patel', 'oscar_garcia',
  'priya_sharma', 'quinn_taylor', 'rosa_martinez', 'sam_wilson', 'tina_le',
  'uma_reddy', 'victor_yang', 'wendy_zhou', 'xavier_davis', 'yuki_tanaka',
  'zara_ahmed', 'adam_white', 'bella_tran', 'carl_johnson', 'daisy_wu',
  'ethan_moore', 'grace_lin', 'henry_park', 'iris_scott', 'jack_thomas',
  'kate_robinson', 'leo_hernandez', 'mia_jackson', 'noah_anderson', 'olive_martin',
  'peter_hall', 'ruby_lewis', 'steve_walker', 'tara_green', 'ulf_berg',
  'vera_santos', 'will_turner', 'xena_cole', 'yosef_ali', 'zoe_baker',
]

const ALEX_COURSES = [
  { title: 'Vue.js 3 Complete Guide',      category: 'web-dev', difficulty: 'beginner',     price: 0,    lessons: ['Introduction & Setup', 'Reactivity & Data Binding', 'Components Deep Dive', 'Vue Router & Navigation', 'State Management with Pinia'] },
  { title: 'React Masterclass 2024',       category: 'web-dev', difficulty: 'intermediate', price: 3000, lessons: ['React Fundamentals', 'Hooks In Depth', 'State & Context', 'Performance Optimization'] },
  { title: 'TypeScript Deep Dive',         category: 'web-dev', difficulty: 'intermediate', price: 3000, lessons: ['Type System Basics', 'Generics & Utility Types', 'TypeScript with React'] },
  { title: 'Full-Stack with Next.js',      category: 'web-dev', difficulty: 'advanced',     price: 5000, lessons: ['App Router Fundamentals', 'Server Components', 'Data Fetching Patterns', 'Authentication & Middleware', 'Deployment to Vercel'] },
  { title: 'JavaScript: The Hard Parts',   category: 'web-dev', difficulty: 'advanced',     price: 0,    lessons: ['Execution Context & Closures', 'Prototypal Inheritance', 'Async & Event Loop'] },
  { title: 'Node.js API Development',      category: 'web-dev', difficulty: 'beginner',     price: 0,    lessons: ['Express Basics', 'REST API Design', 'Database Integration', 'Authentication'] },
  { title: 'HTML & CSS for Beginners',     category: 'web-dev', difficulty: 'beginner',     price: 0,    lessons: ['HTML Structure', 'CSS Selectors & Layout', 'Responsive Design'] },
  { title: 'GraphQL API Development',      category: 'web-dev', difficulty: 'intermediate', price: 4000, lessons: ['Schema Design', 'Resolvers & Data Sources', 'Subscriptions & Real-time'] },
  { title: 'Tailwind CSS Crash Course',    category: 'web-dev', difficulty: 'beginner',     price: 0,    lessons: ['Utility-First Basics', 'Responsive Design', 'Component Patterns'] },
  { title: 'Web Performance Optimization', category: 'web-dev', difficulty: 'advanced',     price: 4000, lessons: ['Core Web Vitals', 'Bundle Optimization', 'Caching Strategies'] },
  { title: 'Testing with Vitest & Cypress', category: 'web-dev', difficulty: 'intermediate', price: 3000, lessons: ['Unit Testing Basics', 'Component Testing', 'E2E with Cypress'] },
  { title: 'Git & GitHub Essentials',      category: 'other',   difficulty: 'beginner',     price: 0,    lessons: ['Git Fundamentals', 'Branching & Merging', 'Pull Requests & Collaboration'] },
]

const SARAH_COURSES = [
  { title: 'Python for Data Science',         category: 'data-science', difficulty: 'beginner',     price: 0,    lessons: ['Python Basics', 'NumPy & Pandas', 'Data Cleaning'] },
  { title: 'Machine Learning A-Z',            category: 'data-science', difficulty: 'advanced',     price: 5000, lessons: ['Supervised Learning', 'Neural Networks', 'Model Evaluation'] },
  { title: 'Data Visualization with Python',  category: 'data-science', difficulty: 'beginner',     price: 0,    lessons: ['Matplotlib Basics', 'Seaborn & Plotly', 'Dashboard Design'] },
  { title: 'SQL for Data Analysts',           category: 'data-science', difficulty: 'intermediate', price: 0,    lessons: ['SELECT & Joins', 'Aggregation & Subqueries', 'Window Functions'] },
  { title: 'Statistics for Machine Learning', category: 'data-science', difficulty: 'intermediate', price: 3000, lessons: ['Probability Fundamentals', 'Hypothesis Testing', 'Bayesian Methods'] },
  { title: 'Deep Learning with PyTorch',      category: 'data-science', difficulty: 'advanced',     price: 5000, lessons: ['Tensors & Autograd', 'CNNs & RNNs', 'Training & Deployment'] },
  { title: 'Natural Language Processing',     category: 'data-science', difficulty: 'advanced',     price: 4000, lessons: ['Text Preprocessing', 'Word Embeddings', 'Transformers & BERT'] },
  { title: 'Data Analysis with Pandas',       category: 'data-science', difficulty: 'beginner',     price: 0,    lessons: ['DataFrames 101', 'Cleaning & Transforming', 'Time Series Analysis'] },
]

const MINH_COURSES = [
  { title: 'React Native for Beginners',     category: 'mobile-dev', difficulty: 'beginner',     price: 0,    lessons: ['Setup & First App', 'Navigation & Screens', 'API Integration'] },
  { title: 'Flutter & Dart Complete Course',  category: 'mobile-dev', difficulty: 'intermediate', price: 3000, lessons: ['Dart Fundamentals', 'Widget System', 'State Management'] },
  { title: 'iOS Dev with Swift',             category: 'mobile-dev', difficulty: 'intermediate', price: 4000, lessons: ['Swift Basics', 'UIKit & SwiftUI', 'Networking & Persistence'] },
  { title: 'Android Jetpack Compose',        category: 'mobile-dev', difficulty: 'intermediate', price: 3000, lessons: ['Compose Fundamentals', 'State & Navigation', 'Material Design 3'] },
  { title: 'Mobile App UI Design',           category: 'mobile-dev', difficulty: 'beginner',     price: 0,    lessons: ['Design Principles', 'Wireframing for Mobile', 'Prototyping'] },
  { title: 'Advanced iOS Architecture',      category: 'mobile-dev', difficulty: 'advanced',     price: 5000, lessons: ['MVVM & Clean Architecture', 'Dependency Injection', 'Testing Strategies'] },
]

const LISA_COURSES = [
  { title: 'UI/UX Design Fundamentals',      category: 'design', difficulty: 'beginner',     price: 0,    lessons: ['Design Principles', 'User Research', 'Wireframing'] },
  { title: 'Figma Masterclass',               category: 'design', difficulty: 'intermediate', price: 3000, lessons: ['Interface Design', 'Auto Layout', 'Prototyping & Handoff'] },
  { title: 'Design Systems at Scale',         category: 'design', difficulty: 'advanced',     price: 5000, lessons: ['Token Architecture', 'Component Library', 'Documentation'] },
  { title: 'Motion Design with After Effects', category: 'design', difficulty: 'intermediate', price: 3000, lessons: ['Keyframe Animation', 'Shape Layers', 'UI Animation Export'] },
  { title: 'Brand Identity Design',           category: 'design', difficulty: 'beginner',     price: 0,    lessons: ['Brand Strategy', 'Logo Design Process', 'Style Guide Creation'] },
  { title: 'Advanced Typography',             category: 'design', difficulty: 'advanced',     price: 4000, lessons: ['Type Theory', 'Pairing & Hierarchy', 'Variable Fonts'] },
  { title: 'Docker & Kubernetes Bootcamp',    category: 'devops', difficulty: 'intermediate', price: 4000, lessons: ['Containers 101', 'Docker Compose', 'Kubernetes Basics'] },
  { title: 'AWS Cloud Practitioner',          category: 'devops', difficulty: 'beginner',     price: 0,    lessons: ['Cloud Fundamentals', 'Core Services', 'Security & Pricing'] },
]

const COURSE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1280&h=720&fit=crop',
]

const DEMO_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'

const REVIEW_COMMENTS = [
  'Great course! Very well structured and easy to follow.',
  'The instructor explains complex concepts in a simple way.',
  'Loved the hands-on projects. Really helped solidify the concepts.',
  'Good content but could use more advanced examples.',
  'Excellent value for the price. Highly recommend!',
  'Clear explanations and great pacing throughout.',
  'Perfect for beginners. Got me up to speed quickly.',
  'Solid course with practical, real-world examples.',
  'One of the best courses I have taken online.',
  'Very thorough coverage of the topic. Well done!',
]

const DISCUSSION_COMMENTS = [
  { content: 'Hey everyone! Just started this lesson. The setup process was smoother than I expected.', replies: [
    { content: 'Same here! Make sure you install the latest version though, there were some breaking changes.' },
    { content: 'Thanks for the tip! I almost ran into that issue.' },
  ]},
  { content: '@[alex_dev] Quick question — should we use the Composition API or Options API for the exercises?', replies: [
    { content: 'Both work fine for this course. I personally prefer Composition API for new projects, but Options API is great for learning the fundamentals.' },
  ]},
  { content: 'I am getting a weird error when importing components. Anyone else seeing this?', replies: [
    { content: 'Are you using the correct file extension? Try adding .vue at the end of the import path.' },
    { content: 'That fixed it for me too. Also make sure your vite.config.js has the Vue plugin configured.' },
    { content: 'Thanks both! The .vue extension was the issue. Works perfectly now.' },
  ]},
  { content: 'The section on reactivity was really eye-opening. Never understood proxies until now.', replies: [] },
  { content: 'Can someone explain the difference between ref() and reactive()? I keep mixing them up.', replies: [
    { content: 'ref() wraps a single value (string, number, etc) and you access it with .value. reactive() is for objects and arrays — no .value needed.' },
    { content: '@[alex_dev] covers this in the next lesson too, with some great examples!' },
  ]},
  { content: 'Just finished the routing section. Vue Router is so much cleaner than what I used before.', replies: [
    { content: 'Wait until you get to navigation guards — they are super powerful for auth flows.' },
  ]},
  { content: 'Loving this course so far. The pacing is perfect for someone coming from vanilla JS.', replies: [] },
  { content: 'Pro tip: use the Vue DevTools browser extension while following along. Makes debugging so much easier.', replies: [
    { content: 'Great advice! The component tree view is especially helpful.' },
  ]},
]

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

async function seed() {
  console.log('Seeding database...\n')

  const hash = await bcrypt.hash('Test1234', 10)

  console.log('Step 1: Cleaning all data')
  await sql`DELETE FROM notifications`
  await sql`DELETE FROM comment_mentions`
  await sql`DELETE FROM comments`
  await sql`DELETE FROM notes`
  await sql`DELETE FROM reviews`
  await sql`DELETE FROM bookmarks`
  await sql`DELETE FROM likes`
  await sql`DELETE FROM payments`
  await sql`DELETE FROM enrollments`
  await sql`DELETE FROM lessons`
  await sql`DELETE FROM courses`
  await sql`DELETE FROM users`

  console.log('Step 2: Inserting instructors')
  const instructorRows = []
  for (const inst of INSTRUCTORS) {
    const rows = await sql`
      INSERT INTO users (id, username, email, password, role, bio)
      VALUES (${uuidv4()}, ${inst.username}, ${inst.email}, ${hash}, 'instructor', ${inst.bio})
      RETURNING id, username
    `
    instructorRows.push(rows[0])
  }
  const instructorMap = {}
  for (const r of instructorRows) instructorMap[r.username] = r.id

  console.log('Step 3: Inserting students')
  const studentRows = []
  for (const name of STUDENTS) {
    const rows = await sql`
      INSERT INTO users (id, username, email, password, role)
      VALUES (${uuidv4()}, ${name}, ${name.replace('_', '.') + '@learnify.dev'}, ${hash}, 'student')
      RETURNING id, username
    `
    studentRows.push(rows[0])
  }
  const studentMap = {}
  for (const r of studentRows) studentMap[r.username] = r.id

  console.log('Step 4: Inserting courses & lessons')
  const allCourseDefs = [
    ...ALEX_COURSES.map((c) => ({ ...c, instructor: 'alex_dev' })),
    ...SARAH_COURSES.map((c) => ({ ...c, instructor: 'sarah_chen' })),
    ...MINH_COURSES.map((c) => ({ ...c, instructor: 'minh_tran' })),
    ...LISA_COURSES.map((c) => ({ ...c, instructor: 'lisa_park' })),
  ]

  const courseRows = []
  const lessonsByCourse = {}

  for (let i = 0; i < allCourseDefs.length; i++) {
    const c = allCourseDefs[i]
    const courseId = uuidv4()
    await sql`
      INSERT INTO courses (id, instructor_id, title, description, category, difficulty, price, thumbnail_url)
      VALUES (${courseId}, ${instructorMap[c.instructor]}, ${c.title},
        ${'A comprehensive course on ' + c.title + '. Learn from industry experts and build real-world projects.'},
        ${c.category}, ${c.difficulty}, ${c.price}, ${COURSE_THUMBNAILS[i % COURSE_THUMBNAILS.length]})
    `
    courseRows.push({ id: courseId, title: c.title, instructor: c.instructor })

    lessonsByCourse[courseId] = []
    for (let j = 0; j < c.lessons.length; j++) {
      const lessonId = uuidv4()
      await sql`
        INSERT INTO lessons (id, course_id, title, video_url, description, order_index)
        VALUES (${lessonId}, ${courseId}, ${c.lessons[j]}, ${DEMO_VIDEO},
          ${c.lessons[j] + ' — hands-on walkthrough with examples.'}, ${j + 1})
      `
      lessonsByCourse[courseId].push(lessonId)
    }
  }

  const alexCourseIds = courseRows.filter((c) => c.instructor === 'alex_dev').map((c) => c.id)
  const otherCourseIds = courseRows.filter((c) => c.instructor !== 'alex_dev').map((c) => c.id)
  const allCourseIds = courseRows.map((c) => c.id)

  console.log('Step 5: Inserting enrollments')
  const enrollmentPairs = new Set()
  const enrolledStudentsByCourse = {}

  for (const student of studentRows) {
    const alexCount = 3 + Math.floor(Math.random() * 4)
    const alexPicks = pickRandom(alexCourseIds, Math.min(alexCount, alexCourseIds.length))
    const otherCount = 1 + Math.floor(Math.random() * 3)
    const otherPicks = pickRandom(otherCourseIds, otherCount)
    const enrolled = [...alexPicks, ...otherPicks]

    for (const courseId of enrolled) {
      const key = `${student.id}:${courseId}`
      if (enrollmentPairs.has(key)) continue
      enrollmentPairs.add(key)
      if (!enrolledStudentsByCourse[courseId]) enrolledStudentsByCourse[courseId] = []
      enrolledStudentsByCourse[courseId].push(student)

      const lessonIds = lessonsByCourse[courseId] || []
      const doneTier = Math.floor(Math.random() * (lessonIds.length + 1))
      const progress = {}
      for (const lid of lessonIds.slice(0, doneTier)) progress[lid] = true

      await sql`
        INSERT INTO enrollments (id, user_id, course_id, progress)
        VALUES (${uuidv4()}, ${student.id}, ${courseId}, ${JSON.stringify(progress)}::jsonb)
      `
    }
  }

  console.log('Step 6: Inserting likes & bookmarks')
  for (const student of studentRows) {
    for (const courseId of pickRandom(allCourseIds, 2 + Math.floor(Math.random() * 4))) {
      await sql`INSERT INTO likes (user_id, course_id) VALUES (${student.id}, ${courseId}) ON CONFLICT DO NOTHING`
    }
    for (const courseId of pickRandom(allCourseIds, Math.floor(Math.random() * 3))) {
      await sql`INSERT INTO bookmarks (user_id, course_id) VALUES (${student.id}, ${courseId}) ON CONFLICT DO NOTHING`
    }
  }

  console.log('Step 7: Inserting reviews')
  for (const course of courseRows) {
    const enrolledForCourse = enrolledStudentsByCourse[course.id] || []
    if (enrolledForCourse.length === 0) continue
    const reviewers = pickRandom(enrolledForCourse, Math.min(3 + Math.floor(Math.random() * 5), enrolledForCourse.length))
    for (const reviewer of reviewers) {
      const rating = 3 + Math.floor(Math.random() * 3)
      const comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)]
      await sql`
        INSERT INTO reviews (id, user_id, course_id, rating, comment)
        VALUES (${uuidv4()}, ${reviewer.id}, ${course.id}, ${rating}, ${comment})
        ON CONFLICT DO NOTHING
      `
    }
  }

  console.log('Step 8: Inserting discussion comments')
  const vueCourse = courseRows.find((c) => c.title === 'Vue.js 3 Complete Guide')
  if (vueCourse) {
    const firstLessonId = lessonsByCourse[vueCourse.id]?.[0]
    if (firstLessonId) {
      const enrolledStudents = studentRows.slice(0, 20)
      let studentIdx = 0

      for (const thread of DISCUSSION_COMMENTS) {
        const author = enrolledStudents[studentIdx % enrolledStudents.length]
        studentIdx++
        const commentId = uuidv4()

        let content = thread.content

        await sql`
          INSERT INTO comments (id, user_id, lesson_id, content)
          VALUES (${commentId}, ${author.id}, ${firstLessonId}, ${content})
        `

        if (content.includes('@[alex_dev]')) {
          await sql`
            INSERT INTO comment_mentions (comment_id, mentioned_user_id)
            VALUES (${commentId}, ${instructorMap.alex_dev})
            ON CONFLICT DO NOTHING
          `
        }

        for (const reply of thread.replies) {
          const isInstructorReply = reply.content.includes('Both work fine') || reply.content.includes('covers this')
          const replyAuthor = isInstructorReply
            ? { id: instructorMap.alex_dev }
            : enrolledStudents[studentIdx % enrolledStudents.length]
          studentIdx++
          const replyId = uuidv4()
          let replyContent = reply.content

          await sql`
            INSERT INTO comments (id, user_id, lesson_id, parent_id, content)
            VALUES (${replyId}, ${replyAuthor.id}, ${firstLessonId}, ${commentId}, ${replyContent})
          `

          if (replyContent.includes('@[alex_dev]')) {
            await sql`
              INSERT INTO comment_mentions (comment_id, mentioned_user_id)
              VALUES (${replyId}, ${instructorMap.alex_dev})
              ON CONFLICT DO NOTHING
            `
          }
        }
      }
    }
  }

  console.log(`
Done
  Instructors: ${INSTRUCTORS.length}
  Students:    ${STUDENTS.length}
  Courses:     ${courseRows.length} (${alexCourseIds.length} by alex_dev)
  Enrollments: ${enrollmentPairs.size}
`)

  await sql.end()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
