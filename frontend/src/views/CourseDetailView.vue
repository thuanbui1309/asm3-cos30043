<template>
  <div class="container py-5">
    <button class="btn-back mb-4" @click="$router.back()">
      &larr; {{ $t('common.back') }}
    </button>

    <div v-if="loading" class="row g-5">
      <div class="col-12 col-lg-8">
        <SkeletonLoader type="line" :count="4" />
      </div>
      <div class="col-12 col-lg-4">
        <SkeletonLoader type="card" />
      </div>
    </div>

    <template v-else-if="course">
      <div class="row g-5">
        <div class="col-12 col-lg-8">
          <span class="course-category">
            {{ $t(`courses.categories.${course.category}`) }}
          </span>
          <h1 class="course-title">{{ course.title }}</h1>
          <p class="course-instructor-line">
            {{ $t('courses.byInstructor') }}
            <strong>{{ course.instructor_name }}</strong>
          </p>

          <div class="course-meta-bar mb-4">
            <span class="meta-item" :class="`badge-${course.difficulty}`">
              {{ course.difficulty }}
            </span>
            <span class="meta-item">{{ lessons.length }} {{ $t('courses.lessons') }}</span>
            <span class="meta-item">{{ course.enrollment_count || 0 }} {{ $t('courses.students') }}</span>
            <span class="meta-item rating-meta" v-if="Number(course.avg_rating) > 0">
              <StarRating :rating="Number(course.avg_rating)" size="sm" />
              {{ Number(course.avg_rating).toFixed(1) }} ({{ course.review_count }})
            </span>
          </div>

          <div class="course-description mb-4">
            <p>{{ course.description }}</p>
          </div>

          <div class="lessons-section">
            <h4 class="mb-3">{{ $t('courses.lessons') }}</h4>
            <div v-if="lessons.length === 0" class="text-muted">No lessons yet.</div>
            <div
              v-for="(lesson, index) in lessons"
              :key="lesson.id"
              class="lesson-item"
            >
              <div class="lesson-number">{{ index + 1 }}</div>
              <div class="lesson-info">
                <h6 class="mb-0">{{ lesson.title }}</h6>
                <small class="text-muted" v-if="lesson.duration">
                  {{ lesson.duration }} min
                </small>
              </div>
              <span v-if="isEnrolled || isOwner" class="lesson-play" @click="goToLearn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
            </div>
          </div>

          <ReviewSection
            :course-id="course.id"
            :is-enrolled="isEnrolled"
            :is-authenticated="isAuthenticated"
            class="mt-5"
          />
        </div>

        <div class="col-12 col-lg-4">
          <div class="course-sidebar">
            <div class="course-thumbnail mb-3">
              <img
                :src="course.thumbnail_url || 'https://placehold.co/400x225/e8e8e8/999?text=Course'"
                :alt="course.title"
                class="img-fluid rounded"
              />
            </div>

            <div class="course-price-box mb-3">
              <span class="price">
                {{ course.price > 0 ? Number(course.price).toLocaleString('vi-VN') + '₫' : $t('courses.free') }}
              </span>
            </div>

            <div class="d-grid gap-2">
              <button
                v-if="isEnrolled"
                class="btn btn-primary btn-lg"
                @click="goToLearn"
              >
                {{ $t('courses.enrolled') }}
              </button>
              <button
                v-else-if="isAuthenticated && isStudent"
                class="btn btn-primary btn-lg"
                @click="handleEnroll"
              >
                {{ $t('courses.enroll') }}
              </button>
              <router-link v-else-if="!isAuthenticated" to="/login" class="btn btn-primary btn-lg">
                {{ $t('courses.loginToEnroll') }}
              </router-link>

              <button
                v-if="isAuthenticated"
                class="btn btn-outline-secondary"
                :class="{ 'btn-liked': course.user_liked }"
                @click="toggleLike"
              >
                {{ course.user_liked ? $t('courses.liked') : $t('courses.like') }}
                ({{ course.like_count || 0 }})
              </button>

              <button
                v-if="isAuthenticated"
                class="btn btn-outline-secondary"
                :class="{ 'btn-bookmarked': course.user_bookmarked }"
                v-bookmark-pulse
                @click="toggleBookmark"
              >
                {{ course.user_bookmarked ? $t('bookmarks.bookmarked') : $t('bookmarks.bookmark') }}
              </button>

              <button
                v-if="isOwner"
                class="btn btn-primary btn-lg"
                @click="goToLearn"
              >
                {{ $t('courses.viewLessons') }}
              </button>

              <router-link
                v-if="isOwner"
                :to="`/courses/${course.id}/edit`"
                class="btn btn-outline-primary"
              >
                {{ $t('courses.editCourse') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import StarRating from '@/components/courses/StarRating.vue'
import ReviewSection from '@/components/courses/ReviewSection.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

export default {
  name: 'CourseDetailView',
  components: { StarRating, ReviewSection, SkeletonLoader },
  data() {
    return {
      course: null,
      lessons: [],
      loading: true,
      isEnrolled: false,
      actionLoading: false,
    }
  },
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
    isStudent() { return useAuthStore().isStudent },
    isOwner() {
      const user = useAuthStore().user
      return user && this.course && user.id === this.course.instructor_id
    },
  },
  async created() {
    await this.fetchCourse()
  },
  methods: {
    async fetchCourse() {
      this.loading = true
      try {
        const { data } = await api.get(`/courses/${this.$route.params.id}`)
        this.course = data.data.course || data.data
        this.lessons = data.data.lessons || []
        this.isEnrolled = data.data.is_enrolled || false
      } catch {
        this.$router.push('/courses')
      } finally {
        this.loading = false
      }
    },
    async toggleLike() {
      if (this.actionLoading) return
      this.actionLoading = true
      try {
        const { data } = await api.post(`/courses/${this.course.id}/like`)
        this.course.user_liked = data.data.liked
        this.course.like_count = data.data.like_count
      } catch {
        // ignore
      } finally {
        this.actionLoading = false
      }
    },
    handleEnroll() {
      if (this.actionLoading) return
      if (this.course.price > 0) {
        this.$router.push(`/payment/${this.course.id}`)
      } else {
        this.enrollFree()
      }
    },
    async enrollFree() {
      this.actionLoading = true
      try {
        await api.post('/enrollments', { course_id: this.course.id })
        this.isEnrolled = true
      } catch {
        // ignore
      } finally {
        this.actionLoading = false
      }
    },
    async toggleBookmark() {
      if (this.actionLoading) return
      this.actionLoading = true
      try {
        const { data } = await api.post(`/courses/${this.course.id}/bookmark`)
        this.course.user_bookmarked = data.data.bookmarked
      } catch {
        // ignore
      } finally {
        this.actionLoading = false
      }
    },
    goToLearn() {
      this.$router.push(`/courses/${this.course.id}/learn`)
    },
  },
}
</script>

<style scoped>
  .btn-back {
    padding: 0.4rem 1rem;
    border: 1.5px solid var(--color-primary);
    border-radius: 8px;
    background: var(--color-bg);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    transition: background-color 0.15s, color 0.15s;
  }

  .btn-back:hover {
    background-color: var(--color-primary);
    color: #fff;
  }

  .course-category {
    font-size: 0.8rem;
    color: var(--color-primary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .course-title {
    font-size: 2rem;
    font-weight: 700;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .course-instructor-line {
    color: var(--color-text-light);
    margin-bottom: 1rem;
  }

  .course-meta-bar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .meta-item {
    font-size: 0.85rem;
    padding: 0.3rem 0.8rem;
    border-radius: 6px;
    background-color: var(--color-bg-light);
    border: 1.5px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    text-transform: capitalize;
  }

  .badge-beginner { background-color: #d4edda; color: #155724; }
  .badge-intermediate { background-color: #fff3cd; color: #856404; }
  .badge-advanced { background-color: #f8d7da; color: #721c24; }

  .lesson-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 0.5rem;
    background-color: var(--color-bg);
  }

  .lesson-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--color-bg-light);
    font-weight: 600;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .lesson-info { flex: 1; }

  .lesson-play {
    color: var(--color-primary);
    cursor: pointer;
    padding: 0.25rem;
  }

  .course-sidebar {
    position: sticky;
    top: 90px;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    padding: 1.5rem;
  }

  .price {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .rating-meta {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .btn-liked {
    background-color: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }

  .btn-bookmarked {
    background-color: #f5a623;
    color: #fff;
    border-color: #f5a623;
  }
</style>
