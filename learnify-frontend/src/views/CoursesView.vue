<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">{{ $t('courses.title') }}</h2>
      <router-link
        v-if="isInstructor"
        to="/courses/create"
        class="btn btn-primary"
      >
        {{ $t('courses.createCourse') }}
      </router-link>
    </div>

    <div class="filters-bar mb-4">
      <div class="row g-3">
        <div class="col-12 col-md-5">
          <input
            v-model="search"
            type="text"
            class="form-control"
            :placeholder="$t('courses.search')"
            aria-label="Search courses"
          />
        </div>
        <div class="col-6 col-md-3">
          <select v-model="categoryFilter" class="form-select" aria-label="Filter by category">
            <option value="">{{ $t('courses.all') }} {{ $t('courses.category') }}</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ $t(`courses.categories.${cat}`) }}
            </option>
          </select>
        </div>
        <div class="col-6 col-md-3">
          <select v-model="difficultyFilter" class="form-select" aria-label="Filter by difficulty">
            <option value="">{{ $t('courses.all') }} {{ $t('courses.difficulty') }}</option>
            <option value="beginner">{{ $t('courses.beginner') }}</option>
            <option value="intermediate">{{ $t('courses.intermediate') }}</option>
            <option value="advanced">{{ $t('courses.advanced') }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="filteredCourses.length === 0" class="text-center py-5">
      <p class="text-muted">{{ $t('courses.noResults') }}</p>
    </div>

    <template v-else>
      <div class="row g-4">
        <div
          v-for="course in paginatedCourses"
          :key="course.id"
          class="col-12 col-sm-6 col-lg-4"
        >
          <div class="course-card" @click="$router.push(`/courses/${course.id}`)">
            <div class="course-thumbnail">
              <img
                :src="course.thumbnail_url || defaultThumbnail"
                :alt="course.title"
              />
              <span class="course-difficulty-badge" :class="`badge-${course.difficulty}`">
                {{ course.difficulty }}
              </span>
            </div>
            <div class="course-body">
              <span class="course-category">
                {{ $t(`courses.categories.${course.category}`) }}
              </span>
              <h5 class="course-title">{{ course.title }}</h5>
              <p class="course-instructor">
                {{ $t('courses.byInstructor') }} {{ course.instructor_name }}
              </p>
              <div class="course-meta">
                <span v-tooltip="$t('courses.lessons')">{{ course.lesson_count || 0 }} {{ $t('courses.lessons') }}</span>
                <span v-tooltip="$t('courses.like')">{{ course.like_count || 0 }} {{ $t('courses.like') }}</span>
              </div>
              <div class="course-price">
                {{ course.price > 0 ? `$${course.price}` : $t('courses.free') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaginationBar
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="currentPage = $event"
      />
    </template>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import PaginationBar from '@/components/common/PaginationBar.vue'

export default {
  name: 'CoursesView',
  components: { PaginationBar },
  data() {
    return {
      courses: [],
      loading: true,
      search: '',
      categoryFilter: '',
      difficultyFilter: '',
      currentPage: 1,
      perPage: 9,
      categories: ['web-dev', 'data-science', 'mobile-dev', 'design', 'devops', 'other'],
      defaultThumbnail: 'https://placehold.co/400x225/e8e8e8/999?text=Course',
    }
  },
  computed: {
    isInstructor() { return useAuthStore().isInstructor },
    filteredCourses() {
      let result = this.courses
      if (this.search) {
        const q = this.search.toLowerCase()
        result = result.filter((c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.instructor_name?.toLowerCase().includes(q)
        )
      }
      if (this.categoryFilter) {
        result = result.filter((c) => c.category === this.categoryFilter)
      }
      if (this.difficultyFilter) {
        result = result.filter((c) => c.difficulty === this.difficultyFilter)
      }
      return result
    },
    totalPages() {
      return Math.ceil(this.filteredCourses.length / this.perPage)
    },
    paginatedCourses() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredCourses.slice(start, start + this.perPage)
    },
  },
  watch: {
    search() { this.currentPage = 1 },
    categoryFilter() { this.currentPage = 1 },
    difficultyFilter() { this.currentPage = 1 },
  },
  async created() {
    await this.fetchCourses()
  },
  methods: {
    async fetchCourses() {
      this.loading = true
      try {
        const { data } = await api.get('/courses')
        this.courses = data.data || []
      } catch {
        this.courses = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
  .filters-bar {
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1rem;
  }

  .course-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .course-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .course-thumbnail {
    position: relative;
    height: 180px;
    overflow: hidden;
  }

  .course-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .course-difficulty-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    text-transform: capitalize;
  }

  .badge-beginner { background-color: #d4edda; color: #155724; }
  .badge-intermediate { background-color: #fff3cd; color: #856404; }
  .badge-advanced { background-color: #f8d7da; color: #721c24; }

  .course-body {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .course-category {
    font-size: 0.8rem;
    color: var(--color-primary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 0.25rem;
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
    margin-bottom: 0.75rem;
  }

  .course-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: auto;
    margin-bottom: 0.5rem;
  }

  .course-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-primary);
  }
</style>
