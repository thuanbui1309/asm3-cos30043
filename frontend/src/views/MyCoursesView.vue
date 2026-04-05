<template>
  <div class="container py-5">

    <template v-if="isInstructor">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">{{ $t('nav.myCourses') }}</h2>
        <router-link to="/courses/create" class="btn btn-primary">
          + {{ $t('courses.createCourse') }}
        </router-link>
      </div>

      <div v-if="loading" class="row g-4">
        <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-lg-4">
          <SkeletonLoader type="card" />
        </div>
      </div>

      <template v-else>
        <div class="stats-row mb-4">
          <div class="stat-card">
            <div class="stat-value">{{ myCourses.length }}</div>
            <div class="stat-label">{{ $t('myCourses.totalCourses') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalStudents }}</div>
            <div class="stat-label">{{ $t('myCourses.totalStudents') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalRevenue }}</div>
            <div class="stat-label">{{ $t('myCourses.estRevenue') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              <StarRating :rating="avgRatingAll" size="sm" />
              {{ avgRatingAll > 0 ? avgRatingAll.toFixed(1) : '—' }}
            </div>
            <div class="stat-label">{{ $t('myCourses.avgRating') }}</div>
          </div>
        </div>

        <div v-if="myCourses.length === 0" class="empty-state">
          <p class="text-muted mb-3">{{ $t('profile.noCourses') }}</p>
          <router-link to="/courses/create" class="btn btn-primary">
            {{ $t('courses.createCourse') }}
          </router-link>
        </div>

        <template v-else>
          <div class="toolbar mb-3">
            <div class="toolbar-left">
              <div class="search-wrap">
                <span class="search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input v-model="instructorSearch" type="text" class="search-input" :placeholder="$t('myCourses.searchMyCourses')" aria-label="Search my courses" />
              </div>
            </div>
            <div class="toolbar-right">
              <select v-model="instructorCategoryFilter" class="filter-select" aria-label="Filter by category">
                <option value="">{{ $t('courses.allCategories') }}</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ $t(`courses.categories.${cat}`) }}</option>
              </select>
              <select v-model="instructorDifficultyFilter" class="filter-select" aria-label="Filter by difficulty">
                <option value="">{{ $t('courses.allLevels') }}</option>
                <option value="beginner">{{ $t('courses.beginner') }}</option>
                <option value="intermediate">{{ $t('courses.intermediate') }}</option>
                <option value="advanced">{{ $t('courses.advanced') }}</option>
              </select>
            </div>
          </div>

          <div v-if="filteredInstructorCourses.length === 0" class="empty-state">
            <p class="text-muted mb-0">{{ $t('courses.noFilterMatch') }}</p>
          </div>

          <div v-else class="dashboard-table-wrap">
            <table class="dashboard-table" aria-label="My courses">
              <thead>
                <tr>
                  <th scope="col">{{ $t('courses.course') }}</th>
                  <th scope="col">{{ $t('courses.category') }}</th>
                  <th scope="col">{{ $t('courses.difficulty') }}</th>
                  <th scope="col">{{ $t('courses.students') }}</th>
                  <th scope="col">{{ $t('myCourses.avgRating') }}</th>
                  <th scope="col">{{ $t('courses.price') }}</th>
                  <th scope="col">{{ $t('courses.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in filteredInstructorCourses" :key="course.id">
                  <td class="col-course">
                    <div class="course-row-info">
                      <img
                        :src="course.thumbnail_url || defaultThumbnail"
                        :alt="course.title"
                        class="course-row-thumb"
                      />
                      <div>
                        <div class="course-row-title">{{ course.title }}</div>
                        <div class="course-row-meta">{{ course.lesson_count || 0 }} {{ $t('courses.lessons') }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="tag-category">{{ $t(`courses.categories.${course.category}`) }}</span>
                  </td>
                  <td>
                    <span class="difficulty-badge" :class="`badge-${course.difficulty}`">
                      {{ $t(`courses.${course.difficulty}`) }}
                    </span>
                  </td>
                  <td class="col-num">{{ course.student_count || 0 }}</td>
                  <td class="col-rating">
                    <template v-if="Number(course.avg_rating) > 0">
                      <StarRating :rating="Number(course.avg_rating)" size="sm" />
                      <span class="rating-text">{{ Number(course.avg_rating).toFixed(1) }} ({{ course.review_count }})</span>
                    </template>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td class="col-price">
                    {{ course.price > 0 ? Number(course.price).toLocaleString('vi-VN') + '₫' : $t('courses.free') }}
                  </td>
                  <td class="col-actions">
                    <div class="action-btns">
                      <router-link :to="`/courses/${course.id}`" class="btn btn-xs btn-outline-secondary">{{ $t('courses.view') }}</router-link>
                      <router-link :to="`/courses/${course.id}/edit`" class="btn btn-xs btn-outline-primary">{{ $t('courses.editCourse') }}</router-link>
                      <button class="btn btn-xs btn-outline-danger" @click="openDeleteModal(course)">{{ $t('courses.deleteCourse') }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </template>

    <template v-else>
      <h2 class="mb-4">{{ $t('nav.myCourses') }}</h2>

      <div v-if="loading" class="row g-4">
        <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-lg-4">
          <SkeletonLoader type="card" />
        </div>
      </div>

      <template v-else>
        <div v-if="enrollments.length === 0" class="empty-state">
          <p class="text-muted mb-3">{{ $t('profile.noEnrollments') }}</p>
          <router-link to="/courses" class="btn btn-primary">
            {{ $t('home.explore') }}
          </router-link>
        </div>

        <template v-else>
          <div class="toolbar mb-3">
            <div class="toolbar-left">
              <div class="search-wrap">
                <span class="search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input v-model="studentSearch" type="text" class="search-input" :placeholder="$t('myCourses.searchEnrolled')" aria-label="Search enrolled courses" />
              </div>
            </div>
            <div class="toolbar-right">
              <select v-model="studentCategoryFilter" class="filter-select" aria-label="Filter by category">
                <option value="">{{ $t('courses.allCategories') }}</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ $t(`courses.categories.${cat}`) }}</option>
              </select>
            </div>
          </div>

          <div class="tab-switcher mb-3">
            <button
              class="tab-btn"
              :class="{ active: studentTab === 'enrolled' }"
              @click="studentTab = 'enrolled'"
            >{{ $t('courses.enrolled') }}</button>
            <button
              class="tab-btn"
              :class="{ active: studentTab === 'bookmarked' }"
              @click="studentTab = 'bookmarked'; fetchBookmarks()"
            >{{ $t('myCourses.bookmarked') }}</button>
          </div>

          <div v-if="studentTab === 'enrolled'" class="quick-filters mb-3">
            <button :class="['chip', studentStatusFilter === 'all' ? 'chip-active' : '']" @click="studentStatusFilter = 'all'">{{ $t('courses.all') }}</button>
            <button :class="['chip', studentStatusFilter === 'not-started' ? 'chip-active' : '']" @click="studentStatusFilter = 'not-started'">{{ $t('myCourses.notStarted') }}</button>
            <button :class="['chip', studentStatusFilter === 'in-progress' ? 'chip-active' : '']" @click="studentStatusFilter = 'in-progress'">{{ $t('myCourses.inProgress') }}</button>
            <button :class="['chip', studentStatusFilter === 'completed' ? 'chip-active' : '']" @click="studentStatusFilter = 'completed'">{{ $t('myCourses.completed') }}</button>
          </div>

          <template v-if="studentTab === 'enrolled'">
            <div v-if="filteredEnrollments.length === 0" class="empty-state">
              <p class="text-muted mb-0">{{ $t('courses.noFilterMatch') }}</p>
            </div>

            <div v-else class="row g-4">
              <div
                v-for="item in filteredEnrollments"
                :key="item.id"
                class="col-12 col-sm-6 col-lg-4"
              >
                <div class="my-course-card" @click="$router.push(`/courses/${item.course_id}`)">
                  <div class="my-course-thumbnail">
                    <img :src="item.thumbnail_url || defaultThumbnail" :alt="item.title" />
                    <span v-if="progressPercent(item) === 100" class="completed-badge">{{ $t('myCourses.completedBadge') }}</span>
                    <div class="progress-overlay">
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" :style="{ width: `${progressPercent(item)}%` }"></div>
                      </div>
                      <span class="progress-label">{{ progressPercent(item) }}%</span>
                    </div>
                  </div>
                  <div class="my-course-body">
                    <h5 class="course-title">{{ item.title }}</h5>
                    <p class="course-instructor">{{ $t('courses.byInstructor') }} {{ item.instructor_name }}</p>
                    <router-link
                      :to="`/courses/${item.course_id}/learn`"
                      class="btn btn-sm btn-primary w-100 mt-auto"
                      @click.stop
                    >
                      {{ $t('courses.enrolled') }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="studentTab === 'bookmarked'">
            <div v-if="bookmarkedCourses.length === 0" class="empty-state">
              <p class="text-muted mb-0">{{ $t('bookmarks.noBookmarks') }}</p>
            </div>
            <div v-else class="row g-4">
              <div v-for="course in bookmarkedCourses" :key="course.id" class="col-12 col-sm-6 col-lg-4">
                <CourseCardSmall :course="course" />
              </div>
            </div>
          </template>
        </template>
      </template>
    </template>

  </div>

  <Teleport to="body">
    <div v-if="deleteModal.show" class="modal-backdrop" @click.self="deleteModal.show = false">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h5 id="modal-title">{{ $t('courses.deleteCourse') }}</h5>
          <button class="modal-close" aria-label="Close" @click="deleteModal.show = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ $t('courses.confirmDelete') }} <strong>{{ deleteModal.courseTitle }}</strong>?</p>
          <p class="modal-warning">{{ $t('myCourses.deleteWarning') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" @click="deleteModal.show = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleteModal.deleting" @click="confirmDelete">
            <span v-if="deleteModal.deleting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import StarRating from '@/components/courses/StarRating.vue'
import CourseCardSmall from '@/components/courses/CourseCardSmall.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import defaultThumb from '@/assets/images/default.svg'

export default {
  name: 'MyCoursesView',
  components: { StarRating, CourseCardSmall, SkeletonLoader },
  data() {
    return {
      myCourses: [],
      enrollments: [],
      loading: true,
      deleteModal: { show: false, courseId: null, courseTitle: '', deleting: false },
      defaultThumbnail: defaultThumb,
      categories: ['web-dev', 'data-science', 'mobile-dev', 'design', 'devops', 'other'],
      instructorSearch: '',
      instructorCategoryFilter: '',
      instructorDifficultyFilter: '',
      studentSearch: '',
      studentCategoryFilter: '',
      studentStatusFilter: 'all',
      studentTab: 'enrolled',
      bookmarkedCourses: [],
    }
  },
  computed: {
    isInstructor() { return useAuthStore().isInstructor },
    avgRatingAll() {
      const rated = this.myCourses.filter((c) => Number(c.avg_rating) > 0)
      if (rated.length === 0) return 0
      return rated.reduce((sum, c) => sum + Number(c.avg_rating), 0) / rated.length
    },
    totalStudents() {
      return this.myCourses.reduce((sum, c) => sum + (c.student_count || 0), 0)
    },
    totalRevenue() {
      const total = this.myCourses.reduce((sum, c) => sum + (c.student_count || 0) * Number(c.price || 0), 0)
      return total > 0 ? total.toLocaleString('vi-VN') + '₫' : '—'
    },
    filteredInstructorCourses() {
      let result = this.myCourses
      if (this.instructorSearch) {
        const q = this.instructorSearch.toLowerCase()
        result = result.filter((c) => c.title.toLowerCase().includes(q))
      }
      if (this.instructorCategoryFilter) {
        result = result.filter((c) => c.category === this.instructorCategoryFilter)
      }
      if (this.instructorDifficultyFilter) {
        result = result.filter((c) => c.difficulty === this.instructorDifficultyFilter)
      }
      return result
    },
    filteredEnrollments() {
      let result = this.enrollments
      if (this.studentSearch) {
        const q = this.studentSearch.toLowerCase()
        result = result.filter((e) =>
          e.title?.toLowerCase().includes(q) ||
          e.instructor_name?.toLowerCase().includes(q)
        )
      }
      if (this.studentCategoryFilter) {
        result = result.filter((e) => e.category === this.studentCategoryFilter)
      }
      if (this.studentStatusFilter !== 'all') {
        result = result.filter((e) => {
          const pct = this.progressPercent(e)
          if (this.studentStatusFilter === 'not-started') return pct === 0
          if (this.studentStatusFilter === 'in-progress') return pct > 0 && pct < 100
          if (this.studentStatusFilter === 'completed') return pct === 100
          return true
        })
      }
      return result
    },
  },
  async created() {
    if (this.isInstructor) {
      await this.fetchMyCourses()
    } else {
      await this.fetchEnrollments()
    }
  },
  methods: {
    progressPercent(item) {
      const lessonIds = Array.isArray(item.lesson_ids) ? item.lesson_ids : []
      if (lessonIds.length === 0) return 0
      let p = item.progress
      if (typeof p === 'string') {
        try { p = JSON.parse(p) } catch { p = {} }
      }
      const progress = (p && typeof p === 'object') ? p : {}
      const done = lessonIds.filter((id) => progress[id]).length
      return Math.round((done / lessonIds.length) * 100)
    },
    async fetchMyCourses() {
      this.loading = true
      try {
        const { data } = await api.get('/courses/mine')
        this.myCourses = data.data.courses || data.data || []
      } catch {
        this.myCourses = []
      } finally {
        this.loading = false
      }
    },
    async fetchEnrollments() {
      this.loading = true
      try {
        const { data } = await api.get('/enrollments')
        this.enrollments = data.data || []
      } catch {
        this.enrollments = []
      } finally {
        this.loading = false
      }
    },
    async fetchBookmarks() {
      try {
        const { data } = await api.get('/bookmarks')
        this.bookmarkedCourses = data.data || []
      } catch {
        this.bookmarkedCourses = []
      }
    },
    openDeleteModal(course) {
      this.deleteModal = { show: true, courseId: course.id, courseTitle: course.title, deleting: false }
    },
    async confirmDelete() {
      this.deleteModal.deleting = true
      try {
        await api.delete(`/courses/${this.deleteModal.courseId}`)
        this.myCourses = this.myCourses.filter((c) => c.id !== this.deleteModal.courseId)
        this.deleteModal.show = false
      } catch {
        this.deleteModal.deleting = false
      }
    },
  },
}
</script>

<style scoped>
  .tab-switcher {
    display: flex;
    gap: 0;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
  }

  .tab-btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.88rem;
    font-weight: 600;
    border: none;
    background: var(--color-bg);
    color: var(--color-text-light);
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
  }

  .tab-btn:not(:last-child) {
    border-right: 1.5px solid var(--color-border-strong);
  }

  .tab-btn:hover {
    color: var(--color-primary);
    background-color: var(--color-bg-light);
  }

  .tab-btn.active {
    background-color: var(--color-primary);
    color: #fff;
  }

  .toolbar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    background-color: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    padding: 0.85rem 1rem;
  }

  .toolbar-left {
    flex: 1;
    min-width: 200px;
  }

  .toolbar-right {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .search-wrap {
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    display: flex;
  }

  .search-input {
    width: 100%;
    padding: 0.55rem 0.85rem 0.55rem 2.4rem;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    font-size: 0.9rem;
    background-color: var(--color-bg);
    color: var(--color-text);
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    border-color: var(--color-primary);
  }

  .filter-select {
    padding: 0.55rem 2rem 0.55rem 0.85rem;
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    font-size: 0.9rem;
    background-color: var(--color-bg);
    color: var(--color-text);
    outline: none;
    cursor: pointer;
    appearance: auto;
    transition: border-color 0.15s;
  }

  .filter-select:focus {
    border-color: var(--color-primary);
  }

  .quick-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .chip {
    padding: 0.35rem 1rem;
    border: 1.5px solid var(--color-border);
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    background: var(--color-bg);
    color: var(--color-text-light);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background-color 0.15s;
  }

  .chip:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .chip-active {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    color: #fff;
  }

  .chip-active:hover {
    background-color: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: #fff;
  }

  .completed-badge {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    background: #28a745;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    z-index: 1;
  }

  .col-rating {
    white-space: nowrap;
  }

  .col-rating .rating-text {
    font-size: 0.8rem;
    color: var(--color-text-light);
    margin-left: 0.25rem;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1;
    margin-bottom: 0.35rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--color-text-light);
  }

  .dashboard-table-wrap {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .dashboard-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .dashboard-table thead tr {
    background-color: var(--color-bg-light);
    border-bottom: 1px solid var(--color-border);
  }

  .dashboard-table th {
    padding: 0.85rem 1.25rem;
    text-align: left;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-light);
    white-space: nowrap;
  }

  .dashboard-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
  }

  .dashboard-table tbody tr:last-child td {
    border-bottom: none;
  }

  .dashboard-table tbody tr:hover {
    background-color: var(--color-bg-light);
  }

  .course-row-info {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .course-row-thumb {
    width: 64px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
    background-color: var(--color-bg-light);
  }

  .course-row-title {
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
  }

  .course-row-meta {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.1rem;
  }

  .tag-category {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-primary);
    background-color: rgba(99, 102, 241, 0.08);
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  .difficulty-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    text-transform: capitalize;
  }

  .badge-beginner { background-color: #d4edda; color: #155724; }
  .badge-intermediate { background-color: #fff3cd; color: #856404; }
  .badge-advanced { background-color: #f8d7da; color: #721c24; }

  .col-num { text-align: center; }
  .col-price { font-weight: 700; color: var(--color-primary); white-space: nowrap; }
  .col-actions { white-space: nowrap; }

  .action-btns, .action-confirm {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  .confirm-label {
    font-size: 0.8rem;
    color: #dc3545;
    font-weight: 600;
    margin-right: 0.15rem;
  }

  .btn-xs {
    padding: 0.2rem 0.6rem;
    font-size: 0.78rem;
    border-radius: 4px;
    font-weight: 600;
    border-width: 1.5px;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 1rem;
  }

  .modal-box {
    background: var(--color-bg);
    border-radius: 12px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-header h5 {
    font-weight: 700;
    margin: 0;
    font-size: 1rem;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.4rem;
    line-height: 1;
    color: var(--color-text-light);
    cursor: pointer;
    padding: 0;
  }

  .modal-close:hover {
    color: var(--color-text);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-body p {
    margin-bottom: 0.5rem;
  }

  .modal-warning {
    font-size: 0.85rem;
    color: #dc3545;
    margin-bottom: 0 !important;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 0;
  }

  .my-course-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .my-course-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .my-course-thumbnail {
    position: relative;
    height: 180px;
    overflow: hidden;
  }

  .my-course-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .progress-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem 0.75rem 0.4rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-bar-track {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .progress-label {
    font-size: 0.7rem;
    color: #fff;
    font-weight: 600;
    white-space: nowrap;
  }

  .my-course-body {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .course-title {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.3rem;
    line-height: 1.3;
  }

  .course-instructor {
    font-size: 0.85rem;
    color: var(--color-text-light);
    margin-bottom: 0.5rem;
  }

  @media (max-width: 767.98px) {
    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-table th:nth-child(3),
    .dashboard-table td:nth-child(3) {
      display: none;
    }
  }

  @media (max-width: 575.98px) {
    .stats-row {
      grid-template-columns: 1fr 1fr;
    }

    .stats-row .stat-card:last-child {
      grid-column: span 2;
    }

    .dashboard-table th:nth-child(2),
    .dashboard-table td:nth-child(2),
    .dashboard-table th:nth-child(4),
    .dashboard-table td:nth-child(4) {
      display: none;
    }
  }
</style>
