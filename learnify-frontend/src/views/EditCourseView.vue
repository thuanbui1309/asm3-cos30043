<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <h2 class="mb-4">{{ $t('courses.editCourse') }}</h2>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="loadingCourse" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <template v-else>
          <CourseForm
            :form="form"
            :submitted="submitted"
            :saving="saving"
            @submit="handleUpdate"
          />

          <hr class="my-4" />
          <button class="btn btn-outline-danger" @click="handleDelete">
            {{ $t('courses.deleteCourse') }}
          </button>
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
        this.form.lessons = lessons.map((l) => ({
          id: l.id,
          title: l.title,
          video_url: l.video_url || '',
          duration: l.duration || 0,
        }))
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
