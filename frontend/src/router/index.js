import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewsView from '@/views/NewsView.vue'
import AboutView from '@/views/AboutView.vue'
import SettingsView from '@/views/SettingsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/news', name: 'news', component: NewsView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/settings', name: 'settings', component: SettingsView },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guest: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-courses',
    name: 'my-courses',
    component: () => import('@/views/MyCoursesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('@/views/CoursesView.vue'),
  },
  {
    path: '/courses/create',
    name: 'course-create',
    component: () => import('@/views/CreateCourseView.vue'),
    meta: { requiresAuth: true, role: 'instructor' },
  },
  {
    path: '/courses/:id',
    name: 'course-detail',
    component: () => import('@/views/CourseDetailView.vue'),
  },
  {
    path: '/courses/:id/edit',
    name: 'course-edit',
    component: () => import('@/views/EditCourseView.vue'),
    meta: { requiresAuth: true, role: 'instructor' },
  },
  {
    path: '/courses/:id/learn',
    name: 'course-learn',
    component: () => import('@/views/LearnView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payment/:courseId',
    name: 'payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guest && token) {
    return next({ name: 'home' })
  }

  if (to.meta.role && user?.role !== to.meta.role) {
    return next({ name: 'home' })
  }

  next()
})

export default router
