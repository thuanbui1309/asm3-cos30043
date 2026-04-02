<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="page-header mb-4">
          <button class="btn-back" @click="$router.back()">
            &larr; {{ $t('common.back') }}
          </button>
          <h2 class="mt-2 mb-0">{{ $t('courses.editCourse') }}</h2>
          <p class="text-muted mt-1 mb-0">{{ $t('courses.editSubtitle') }}</p>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="loadingCourse" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <template v-else>
          <CourseForm
            :form="form"
            :submitted="submitted"
            :saving="saving"
            :price-locked="enrollmentCount > 0"
            @submit="handleUpdate"
          />

          <div class="danger-zone mt-4">
            <h6 class="danger-zone-title">{{ $t('courses.dangerZone') }}</h6>
            <div class="danger-zone-body">
              <div>
                <p class="mb-0 fw-semibold">{{ $t('courses.deleteThisCourse') }}</p>
                <p class="text-muted mb-0" style="font-size: 0.85rem;">{{ $t('courses.deleteWarning') }}</p>
              </div>
              <button class="btn btn-outline-danger btn-sm" @click="handleDelete">
                {{ $t('courses.deleteCourse') }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import CourseForm from '@/components/courses/CourseForm.vue'
import api from '@/services/api'

export default {
  name: 'EditCourseView',
  components: { CourseForm },
  data() {
    return {
      form: {
        title: '',
        description: '',
        category: 'web-dev',
        difficulty: 'beginner',
        price: 0,
        thumbnail_url: '',
        lessons: [],
      },
      loadingCourse: true,
      submitted: false,
      saving: false,
      error: null,
      originalLessonIds: [],
      enrollmentCount: 0,
    }
  },
  async created() {
    await this.fetchCourse()
  },
  methods: {
    async fetchCourse() {
      try {
        const { data } = await api.get(`/courses/${this.$route.params.id}`)
        const course = data.data.course || data.data
        const lessons = data.data.lessons || []
        this.form.title = course.title
        this.form.description = course.description
        this.form.category = course.category
        this.form.difficulty = course.difficulty
        this.form.price = course.price
        this.form.thumbnail_url = course.thumbnail_url || ''
        this.enrollmentCount = course.enrollment_count || 0
        this.form.lessons = lessons.map((l) => ({
          id: l.id,
          title: l.title,
          video_url: l.video_url || '',
          description: l.description || '',
        }))
        this.originalLessonIds = lessons.map((l) => l.id)
      } catch {
        this.$router.push('/courses')
      } finally {
        this.loadingCourse = false
      }
    },
    async handleUpdate() {
      this.submitted = true
      if (!this.form.title || !this.form.description) return

      this.saving = true
      this.error = null
      try {
        const courseId = this.$route.params.id
        await api.put(`/courses/${courseId}`, {
          title: this.form.title,
          description: this.form.description,
          category: this.form.category,
          difficulty: this.form.difficulty,
          price: this.form.price,
          thumbnail_url: this.form.thumbnail_url,
        })

        const currentIds = this.form.lessons.filter((l) => l.id).map((l) => l.id)
        const removedIds = this.originalLessonIds.filter((id) => !currentIds.includes(id))
        await Promise.all(removedIds.map((id) => api.delete(`/lessons/${id}`)))

        for (let i = 0; i < this.form.lessons.length; i++) {
          const lesson = this.form.lessons[i]
          if (!lesson.title) continue
          if (lesson.id) {
            await api.put(`/lessons/${lesson.id}`, {
              title: lesson.title,
              video_url: lesson.video_url || null,
              description: lesson.description || null,
              order_index: i + 1,
            })
          } else {
            await api.post(`/courses/${courseId}/lessons`, {
              title: lesson.title,
              video_url: lesson.video_url || null,
              description: lesson.description || null,
              order_index: i + 1,
            })
          }
        }

        this.$router.push(`/courses/${courseId}`)
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to update course'
      } finally {
        this.saving = false
      }
    },
    async handleDelete() {
      if (!confirm(this.$t('courses.confirmDelete'))) return
      try {
        await api.delete(`/courses/${this.$route.params.id}`)
        this.$router.push('/courses')
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to delete course'
      }
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

  .danger-zone {
    border: 1.5px solid #f5c6cb;
    border-radius: 12px;
    overflow: hidden;
  }

  .danger-zone-title {
    padding: 0.75rem 1.25rem;
    background-color: #fff5f5;
    border-bottom: 1.5px solid #f5c6cb;
    color: #dc3545;
    font-weight: 600;
    margin-bottom: 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .danger-zone-body {
    padding: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background-color: var(--color-bg);
  }
</style>
