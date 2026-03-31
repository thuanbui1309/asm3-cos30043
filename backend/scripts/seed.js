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
  { title: 'React Masterclass 2024',           category: 'web-dev',      difficulty: 'intermediate', price: 3000 },
  { title: 'TypeScript Deep Dive',             category: 'web-dev',      difficulty: 'intermediate', price: 3000 },
  { title: 'Full-Stack with Next.js',          category: 'web-dev',      difficulty: 'advanced',     price: 3000 },
  { title: 'HTML & CSS for Beginners',         category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'JavaScript: The Hard Parts',       category: 'web-dev',      difficulty: 'advanced',     price: 3000 },
  { title: 'Tailwind CSS Crash Course',        category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'GraphQL API Development',          category: 'web-dev',      difficulty: 'intermediate', price: 3000 },
  { title: 'Web Performance Optimization',     category: 'web-dev',      difficulty: 'advanced',     price: 0 },
  { title: 'Node.js API Development',          category: 'web-dev',      difficulty: 'beginner',     price: 0 },
  { title: 'Python for Data Science',          category: 'data-science', difficulty: 'beginner',     price: 0 },
  { title: 'Machine Learning A-Z',             category: 'data-science', difficulty: 'advanced',     price: 3000 },
  { title: 'Deep Learning with PyTorch',       category: 'data-science', difficulty: 'advanced',     price: 3000 },
  { title: 'Data Analysis with Pandas',        category: 'data-science', difficulty: 'beginner',     price: 0 },
  { title: 'SQL for Data Analysts',            category: 'data-science', difficulty: 'intermediate', price: 0 },
  { title: 'Statistics for Machine Learning',  category: 'data-science', difficulty: 'intermediate', price: 3000 },
  { title: 'Natural Language Processing',      category: 'data-science', difficulty: 'advanced',     price: 3000 },
  { title: 'Data Visualization with Python',   category: 'data-science', difficulty: 'beginner',     price: 0 },
  { title: 'iOS Dev with Swift',               category: 'mobile-dev',   difficulty: 'intermediate', price: 3000 },
  { title: 'Android Jetpack Compose',          category: 'mobile-dev',   difficulty: 'intermediate', price: 3000 },
  { title: 'React Native for Beginners',       category: 'mobile-dev',   difficulty: 'beginner',     price: 0 },
  { title: 'Flutter & Dart Complete Course',   category: 'mobile-dev',   difficulty: 'beginner',     price: 0 },
  { title: 'Mobile App UI Design',             category: 'mobile-dev',   difficulty: 'beginner',     price: 0 },
  { title: 'Advanced iOS Architecture',        category: 'mobile-dev',   difficulty: 'advanced',     price: 3000 },
  { title: 'UI/UX Design Fundamentals',        category: 'design',       difficulty: 'beginner',     price: 0 },
  { title: 'Figma Masterclass',                category: 'design',       difficulty: 'intermediate', price: 0 },
  { title: 'Design Systems at Scale',          category: 'design',       difficulty: 'advanced',     price: 3000 },
  { title: 'Motion Design with After Effects', category: 'design',       difficulty: 'intermediate', price: 3000 },
  { title: 'Brand Identity Design',            category: 'design',       difficulty: 'beginner',     price: 0 },
  { title: 'Advanced Typography',              category: 'design',       difficulty: 'advanced',     price: 3000 },
  { title: 'Docker & Kubernetes Bootcamp',     category: 'devops',       difficulty: 'intermediate', price: 3000 },
  { title: 'AWS Cloud Practitioner',           category: 'devops',       difficulty: 'beginner',     price: 0 },
  { title: 'CI/CD with GitHub Actions',        category: 'devops',       difficulty: 'intermediate', price: 3000 },
  { title: 'Terraform Infrastructure as Code', category: 'devops',       difficulty: 'advanced',     price: 3000 },
  { title: 'Linux for Developers',             category: 'devops',       difficulty: 'beginner',     price: 0 },
  { title: 'Site Reliability Engineering',     category: 'devops',       difficulty: 'advanced',     price: 0 },
  { title: 'Git & GitHub Essentials',          category: 'other',        difficulty: 'beginner',     price: 0 },
  { title: 'Agile & Scrum Fundamentals',       category: 'other',        difficulty: 'beginner',     price: 0 },
  { title: 'Technical Writing for Devs',       category: 'other',        difficulty: 'intermediate', price: 3000 },
  { title: 'Open Source Contribution Guide',   category: 'other',        difficulty: 'intermediate', price: 3000 },
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
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1280&h=720&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1280&h=720&fit=crop',
]

const DEMO_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'
const NUM_STUDENTS = 210
const INSTRUCTOR_USERNAMES = INSTRUCTORS.map((i) => i.username)

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
    thumbnail_url: COURSE_THUMBNAILS[i],
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
