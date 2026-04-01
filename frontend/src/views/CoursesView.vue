<template>
  <div class="container py-5">
    <h2 class="mb-4">{{ $t('courses.title') }}</h2>

    <div class="toolbar mb-4">
        <div class="toolbar-left">
          <div class="search-wrap">
            <span class="search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              v-model="search"
              type="text"
              class="search-input"
              :placeholder="$t('courses.search')"
              aria-label="Search courses"
              @focus="showAutocomplete = true"
              @blur="hideAutocomplete"
            />
            <div v-if="showAutocomplete && autocompleteSuggestions.length > 0" class="autocomplete-dropdown">
              <div
                v-for="course in autocompleteSuggestions"
                :key="course.id"
                class="autocomplete-item"
                @mousedown.prevent="$router.push(`/courses/${course.id}`)"
              >
                <img :src="course.thumbnail_url || defaultThumbnail" :alt="course.title" class="autocomplete-thumb" />
                <div class="autocomplete-info">
                  <div class="autocomplete-title">{{ course.title }}</div>
                  <div class="autocomplete-meta">{{ course.instructor_name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="toolbar-right">
          <select v-model="sortBy" class="filter-select" aria-label="Sort by">
            <option value="newest">{{ $t('courses.sortNewest') }}</option>
            <option value="popular">{{ $t('courses.sortPopular') }}</option>
            <option value="rating">{{ $t('courses.sortRating') }}</option>
            <option value="price-asc">{{ $t('courses.sortPriceAsc') }}</option>
            <option value="price-desc">{{ $t('courses.sortPriceDesc') }}</option>
          </select>
          <select v-model="categoryFilter" class="filter-select" aria-label="Filter by category">
            <option value="">{{ $t('courses.all') }} {{ $t('courses.category') }}</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ $t(`courses.categories.${cat}`) }}
            </option>
          </select>
          <select v-model="difficultyFilter" class="filter-select" aria-label="Filter by difficulty">
            <option value="">{{ $t('courses.all') }} {{ $t('courses.difficulty') }}</option>
            <option value="beginner">{{ $t('courses.beginner') }}</option>
            <option value="intermediate">{{ $t('courses.intermediate') }}</option>
            <option value="advanced">{{ $t('courses.advanced') }}</option>
          </select>
          <select v-model="priceFilter" class="filter-select" aria-label="Filter by price">
            <option value="">{{ $t('courses.anyPrice') }}</option>
            <option value="free">{{ $t('courses.free') }}</option>
            <option value="paid">{{ $t('courses.paid') }}</option>
          </select>
        </div>
      </div>

      <div v-if="isAuthenticated" class="quick-filters mb-3">
        <button
          v-if="isInstructor"
          :class="['chip', ownershipFilter === 'all' ? 'chip-active' : '']"
          @click="ownershipFilter = 'all'"
        >{{ $t('courses.allCourses') }}</button>
        <button
          v-if="isInstructor"
          :class="['chip', ownershipFilter === 'mine' ? 'chip-active' : '']"
          @click="ownershipFilter = 'mine'"
        >{{ $t('courses.createdByMe') }}</button>
        <button
          v-if="isStudent"
          :class="['chip', ownershipFilter === 'all' ? 'chip-active' : '']"
          @click="ownershipFilter = 'all'"
        >{{ $t('courses.allCourses') }}</button>
        <button
          v-if="isStudent"
          :class="['chip', ownershipFilter === 'enrolled' ? 'chip-active' : '']"
          @click="ownershipFilter = 'enrolled'"
        >{{ $t('courses.enrolledFilter') }}</button>
      </div>

      <div class="results-meta mb-3">
        <span v-if="!loading" class="results-count">
          {{ $t('courses.showingRange', { from: Math.min(1, filteredCourses.length), to: visibleCourses.length, total: filteredCourses.length }) }}
        </span>
        <button
          v-if="search || categoryFilter || difficultyFilter || priceFilter || ownershipFilter !== 'all'"
          class="btn-clear"
          @click="search = ''; categoryFilter = ''; difficultyFilter = ''; priceFilter = ''; ownershipFilter = 'all'"
        >{{ $t('courses.clearFilters') }}</button>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="filteredCourses.length === 0" class="empty-state">
        <p class="text-muted mb-0">{{ ownershipFilter !== 'all' || search || categoryFilter || difficultyFilter || priceFilter ? $t('courses.noFilterMatch') : $t('courses.noResults') }}</p>
      </div>

      <template v-else>
        <div class="row g-4">
          <div
            v-for="course in visibleCourses"
            :key="course.id"
            class="col-12 col-sm-6 col-lg-4"
          >
            <div class="course-card" @click="$router.push(`/courses/${course.id}`)">
              <div class="course-thumbnail">
                <img :src="course.thumbnail_url || defaultThumbnail" :alt="course.title" />
                <span class="difficulty-badge" :class="`badge-${course.difficulty}`">
                  {{ $t(`courses.${course.difficulty}`) }}
                </span>
                <div class="price-badge">
                  {{ course.price > 0 ? Number(course.price).toLocaleString('vi-VN') + '₫' : $t('courses.free') }}
                </div>
              </div>
              <div class="course-body">
                <span class="course-category">{{ $t(`courses.categories.${course.category}`) }}</span>
                <h5 class="course-title">{{ course.title }}</h5>
                <p class="course-instructor">{{ $t('courses.byInstructor') }} {{ course.instructor_name }}</p>
                <div class="course-footer">
                  <span class="meta-item rating-item" v-if="Number(course.avg_rating) > 0">
                    <StarRating :rating="Number(course.avg_rating)" size="sm" />
                    <span>{{ Number(course.avg_rating).toFixed(1) }} ({{ course.review_count }})</span>
                  </span>
                  <span class="meta-sep" v-if="Number(course.avg_rating) > 0">·</span>
                  <span class="meta-item">{{ course.lesson_count || 0 }} {{ $t('courses.lessons') }}</span>
                  <span class="meta-sep">·</span>
                  <span class="meta-item">{{ course.enrollment_count || 0 }} {{ $t('courses.students') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="visibleCount < filteredCourses.length" class="text-center mt-4">
          <button class="btn-load-more" @click="visibleCount += 10">
            {{ $t('courses.loadMore') }}
          </button>
        </div>
      </template>
  </div>
</template>

<script>
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import StarRating from '@/components/courses/StarRating.vue'

export default {
  name: 'CoursesView',
  components: { StarRating },
  data() {
    return {
      courses: [],
      enrolledCourseIds: [],
      loading: true,
      search: '',
      categoryFilter: '',
      difficultyFilter: '',
      priceFilter: '',
      sortBy: 'newest',
      ownershipFilter: 'all',
      visibleCount: 15,
      categories: ['web-dev', 'data-science', 'mobile-dev', 'design', 'devops', 'other'],
      defaultThumbnail: 'https://placehold.co/400x225/e8e8e8/999?text=Course',
      showAutocomplete: false,
    }
  },
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
    isInstructor() { return useAuthStore().isInstructor },
    isStudent() { return useAuthStore().isStudent },
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
      if (this.priceFilter === 'free') {
        result = result.filter((c) => Number(c.price) === 0)
      } else if (this.priceFilter === 'paid') {
        result = result.filter((c) => Number(c.price) > 0)
      }
      if (this.ownershipFilter === 'mine') {
        const userId = useAuthStore().user?.id
        result = result.filter((c) => c.instructor_id === userId)
      } else if (this.ownershipFilter === 'enrolled') {
        result = result.filter((c) => this.enrolledCourseIds.includes(c.id))
      }
      return result
    },
    autocompleteSuggestions() {
      if (!this.search || this.search.length < 2) return []
      const q = this.search.toLowerCase()
      return this.courses
        .filter((c) => c.title.toLowerCase().includes(q))
        .slice(0, 5)
    },
    visibleCourses() {
      return this.filteredCourses.slice(0, this.visibleCount)
    },
  },
  watch: {
    search() { this.visibleCount = 15 },
    categoryFilter() { this.visibleCount = 15 },
    difficultyFilter() { this.visibleCount = 15 },
    priceFilter() { this.visibleCount = 15 },
    ownershipFilter() { this.visibleCount = 15 },
    sortBy() { this.visibleCount = 15; this.fetchCourses() },
  },
  async created() {
    await this.fetchCourses()
    if (this.isStudent) {
      await this.fetchEnrolledIds()
    }
  },
  methods: {
    hideAutocomplete() {
      setTimeout(() => { this.showAutocomplete = false }, 200)
    },
    async fetchCourses() {
      this.loading = true
      try {
        const { data } = await api.get(`/courses?limit=1000&sort=${this.sortBy}`)
        this.courses = data.data.courses || []
      } catch {
        this.courses = []
      } finally {
        this.loading = false
      }
    },
    async fetchEnrolledIds() {
      try {
        const { data } = await api.get('/enrollments')
        this.enrolledCourseIds = (data.data || []).map((e) => e.course_id)
      } catch {
        this.enrolledCourseIds = []
      }
    },
  },
}
</script>

<style scoped>
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

  .toolbar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    padding: 1rem 1.25rem;
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
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    font-size: 0.9rem;
    background-color: var(--color-bg);
    color: var(--color-text);
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    border-color: var(--color-primary);
  }

  .autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    z-index: 20;
    margin-top: 4px;
    overflow: hidden;
  }

  .autocomplete-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.85rem;
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .autocomplete-item:hover {
    background-color: var(--color-bg-hover);
  }

  .autocomplete-thumb {
    width: 48px;
    height: 30px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
    background-color: var(--color-bg-light);
  }

  .autocomplete-info {
    flex: 1;
    min-width: 0;
  }

  .autocomplete-title {
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .autocomplete-meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .filter-select {
    padding: 0.55rem 2rem 0.55rem 0.85rem;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
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

  .results-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--color-text-light);
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .results-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn-clear {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.85rem;
    color: var(--color-primary);
    cursor: pointer;
    font-weight: 500;
  }

  .btn-clear:hover {
    text-decoration: underline;
  }

  .btn-load-more {
    padding: 0.55rem 2rem;
    border: 1.5px solid var(--color-primary);
    border-radius: 8px;
    background: var(--color-bg);
    color: var(--color-primary);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
  }

  .btn-load-more:hover {
    background-color: var(--color-primary);
    color: #fff;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 0;
  }

  .course-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }

  .course-thumbnail {
    position: relative;
    height: 185px;
    overflow: hidden;
  }

  .course-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .course-card:hover .course-thumbnail img {
    transform: scale(1.04);
  }

  .difficulty-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .badge-beginner { background-color: #d4edda; color: #155724; }
  .badge-intermediate { background-color: #fff3cd; color: #856404; }
  .badge-advanced { background-color: #f8d7da; color: #721c24; }

  .price-badge {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    backdrop-filter: blur(4px);
  }

  .course-body {
    padding: 1.1rem 1.25rem 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .course-category {
    font-size: 0.75rem;
    color: var(--color-primary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.3rem;
  }

  .course-title {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
    line-height: 1.35;
    color: var(--color-text);
  }

  .course-instructor {
    font-size: 0.82rem;
    color: var(--color-text-light);
    text-decoration: none;
    margin-bottom: 0;
    flex: 1;
  }

  .course-footer {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px solid var(--color-border);
  }

  .meta-item {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .meta-sep {
    color: var(--color-border);
    font-size: 0.75rem;
  }

  .rating-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
</style>
