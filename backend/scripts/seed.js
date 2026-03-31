require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

const INSTRUCTORS = [
  { username: 'alex_dev',    email: 'alex@learnify.dev' },
  { username: 'sarah_chen',  email: 'sarah@learnify.dev' },
  { username: 'minh_tran',   email: 'minh@learnify.dev' },
  { username: 'lisa_park',   email: 'lisa@learnify.dev' },
  { username: 'james_wu',    email: 'james@learnify.dev' },
  { username: 'emma_nguyen', email: 'emma@learnify.dev' },
  { username: 'david_kim',   email: 'david@learnify.dev' },
  { username: 'olivia_le',   email: 'olivia@learnify.dev' },
  { username: 'ryan_pham',   email: 'ryan@learnify.dev' },
  { username: 'jessica_ho',  email: 'jessica@learnify.dev' },
]

const COURSES = [
  { title: 'Vue.js 3 Complete Guide',          category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'React Masterclass 2024',           category: 'web-dev',      difficulty: 'intermediate', price: 1000 },
  { title: 'TypeScript Deep Dive',             category: 'web-dev',      difficulty: 'intermediate', price: 1000 },
  { title: 'Full-Stack with Next.js',          category: 'web-dev',      difficulty: 'advanced',     price: 1000 },
  { title: 'HTML & CSS for Beginners',         category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'JavaScript: The Hard Parts',       category: 'web-dev',      difficulty: 'advanced',     price: 1000 },
  { title: 'Tailwind CSS Crash Course',        category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'GraphQL API Development',          category: 'web-dev',      difficulty: 'intermediate', price: 1000 },
  { title: 'Web Performance Optimization',     category: 'web-dev',      difficulty: 'advanced',     price: 0 },
  { title: 'Node.js API Development',          category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'Python for Data Science',          category: 'data-science', difficulty: 'beginner',     price: 0 },
  { title: 'Machine Learning A-Z',             category: 'data-science', difficulty: 'advanced',     price: 1000 },
  { title: 'Deep Learning with PyTorch',       category: 'data-science', difficulty: 'advanced',     price: 1000 },
  { title: 'Data Analysis with Pandas',        category: 'data-science', difficulty: 'beginner',     price: 0 },
  { title: 'SQL for Data Analysts',            category: 'data-science', difficulty: 'intermediate', price: 0 },
  { title: 'Statistics for Machine Learning',  category: 'data-science', difficulty: 'intermediate', price: 1000 },
  { title: 'Natural Language Processing',      category: 'data-science', difficulty: 'advanced',     price: 1000 },
  { title: 'Data Visualization with Python',   category: 'data-science', difficulty: 'beginner',     price: 0 },
  { title: 'iOS Dev with Swift',               category: 'mobile-dev',   difficulty: 'intermediate', price: 1000 },
  { title: 'Android Jetpack Compose',          category: 'mobile-dev',   difficulty: 'intermediate', price: 1000 },
  { title: 'React Native for Beginners',       category: 'mobile-dev',   difficulty: 'beginner',     price: 0 },
  { title: 'Flutter & Dart Complete Course',   category: 'mobile-dev',   difficulty: 'beginner',     price: 0 },
  { title: 'Mobile App UI Design',             category: 'mobile-dev',   difficulty: 'beginner',     price: 0 },
  { title: 'Advanced iOS Architecture',        category: 'mobile-dev',   difficulty: 'advanced',     price: 1000 },
  { title: 'UI/UX Design Fundamentals',        category: 'design',       difficulty: 'beginner',     price: 0 },
  { title: 'Figma Masterclass',                category: 'design',       difficulty: 'intermediate', price: 0 },
  { title: 'Design Systems at Scale',          category: 'design',       difficulty: 'advanced',     price: 1000 },
  { title: 'Motion Design with After Effects', category: 'design',       difficulty: 'intermediate', price: 1000 },
  { title: 'Brand Identity Design',            category: 'design',       difficulty: 'beginner',     price: 0 },
  { title: 'Advanced Typography',              category: 'design',       difficulty: 'advanced',     price: 1000 },
  { title: 'Docker & Kubernetes Bootcamp',     category: 'devops',       difficulty: 'intermediate', price: 1000 },
  { title: 'AWS Cloud Practitioner',           category: 'devops',       difficulty: 'beginner',     price: 0 },
  { title: 'CI/CD with GitHub Actions',        category: 'devops',       difficulty: 'intermediate', price: 1000 },
  { title: 'Terraform Infrastructure as Code', category: 'devops',       difficulty: 'advanced',     price: 1000 },
  { title: 'Linux for Developers',             category: 'devops',       difficulty: 'beginner',     price: 0 },
  { title: 'Site Reliability Engineering',     category: 'devops',       difficulty: 'advanced',     price: 0 },
  { title: 'Git & GitHub Essentials',          category: 'other',        difficulty: 'beginner',     price: 0 },
  { title: 'Agile & Scrum Fundamentals',       category: 'other',        difficulty: 'beginner',     price: 0 },
  { title: 'Technical Writing for Devs',       category: 'other',        difficulty: 'intermediate', price: 1000 },
  { title: 'Open Source Contribution Guide',   category: 'other',        difficulty: 'intermediate', price: 1000 },
]

const CATEGORY_COLORS = {
  'web-dev':      '6366f1',
  'data-science': '10b981',
  'devops':       'f59e0b',
  'design':       'ec4899',
  'mobile-dev':   '3b82f6',
  'other':        '64748b',
}

const DEMO_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'
const NUM_STUDENTS = 210
const INSTRUCTOR_USERNAMES = INSTRUCTORS.map((i) => i.username)

function thumbnailUrl(title, category) {
  const color = CATEGORY_COLORS[category] || '64748b'
  const text = encodeURIComponent(title.substring(0, 30))
  return `https://placehold.co/1280x720/${color}/white?text=${text}`
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

async function seed() {
  console.log('Seeding database...')

  const hash = await bcrypt.hash('Test1234', 10)

  console.log('Step 1: Cleaning existing seed data')
  await sql`
    DELETE FROM users
    WHERE username LIKE 'student%'
       OR username = ANY(${INSTRUCTOR_USERNAMES})
  `

  console.log('Step 2: Inserting instructors')
  const instructorData = INSTRUCTORS.map((i) => ({
    username: i.username, email: i.email, password: hash, role: 'instructor',
  }))
  const instructorRows = await sql`
    INSERT INTO users ${sql(instructorData, 'username', 'email', 'password', 'role')}
    RETURNING id, username
  `
  const instructorIds = instructorRows.map((r) => r.id)

  console.log('Step 3: Inserting students')
  const studentData = Array.from({ length: NUM_STUDENTS }, (_, i) => {
    const n = String(i + 1).padStart(3, '0')
    return { username: `student${n}`, email: `student${n}@test.com`, password: hash, role: 'student' }
  })
  const studentRows = await sql`
    INSERT INTO users ${sql(studentData, 'username', 'email', 'password', 'role')}
    RETURNING id
  `
  const studentIds = studentRows.map((r) => r.id)

  console.log('Step 4: Inserting courses')
  const courseData = COURSES.map((c, i) => ({
    instructor_id: instructorIds[i % instructorIds.length],
    title: c.title,
    description: `A comprehensive course on ${c.title}. Learn from industry experts and build real-world projects.`,
    category: c.category,
    difficulty: c.difficulty,
    price: c.price,
    thumbnail_url: thumbnailUrl(c.title, c.category),
  }))
  const courseRows = await sql`
    INSERT INTO courses ${sql(courseData, 'instructor_id', 'title', 'description', 'category', 'difficulty', 'price', 'thumbnail_url')}
    RETURNING id
  `
  const courseIds = courseRows.map((r) => r.id)

  console.log('Step 5: Inserting lessons')
  const lessonTitles = ['Introduction & Setup', 'Core Concepts', 'Building Your First Project']
  const lessonData = courseIds.flatMap((courseId) =>
    lessonTitles.map((title, idx) => ({
      course_id: courseId,
      title,
      video_url: DEMO_VIDEO,
      description: `${title} — hands-on walkthrough with examples.`,
      order_index: idx + 1,
    }))
  )
  const lessonRows = await sql`
    INSERT INTO lessons ${sql(lessonData, 'course_id', 'title', 'video_url', 'description', 'order_index')}
    RETURNING id, course_id
  `

  const lessonsByCourse = {}
  for (const l of lessonRows) {
    if (!lessonsByCourse[l.course_id]) lessonsByCourse[l.course_id] = []
    lessonsByCourse[l.course_id].push(l.id)
  }

  console.log('Step 6: Inserting enrollments & likes')
  const enrollmentData = []
  const likeData = []

  for (const studentId of studentIds) {
    const count = 2 + Math.floor(Math.random() * 4)
    const enrolled = pickRandom(courseIds, count)

    for (const courseId of enrolled) {
      const lessonIds = lessonsByCourse[courseId] || []
      const doneTier = Math.floor(Math.random() * 4)
      const progress = {}
      for (const lid of lessonIds.slice(0, doneTier)) progress[lid] = true
      enrollmentData.push({ user_id: studentId, course_id: courseId, progress })
    }

    for (const courseId of pickRandom(enrolled, Math.floor(Math.random() * 3))) {
      likeData.push({ user_id: studentId, course_id: courseId })
    }
  }

  for (let i = 0; i < enrollmentData.length; i += 200) {
    const batch = enrollmentData.slice(i, i + 200)
    await sql`INSERT INTO enrollments ${sql(batch, 'user_id', 'course_id', 'progress')}`
  }

  for (let i = 0; i < likeData.length; i += 200) {
    const batch = likeData.slice(i, i + 200)
    await sql`INSERT INTO likes ${sql(batch, 'user_id', 'course_id')} ON CONFLICT DO NOTHING`
  }

  console.log(`
Done
  Instructors: ${instructorIds.length}
  Students:    ${studentIds.length}
  Courses:     ${courseIds.length}
  Lessons:     ${lessonRows.length}
  Enrollments: ${enrollmentData.length}
  Likes:       ${likeData.length}
`)

  await sql.end()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
