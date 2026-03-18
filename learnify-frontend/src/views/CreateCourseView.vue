<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <h2 class="mb-4">{{ $t('courses.createCourse') }}</h2>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <CourseForm
          :form="form"
          :submitted="submitted"
          :saving="saving"
          @submit="handleCreate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CourseForm from '@/components/courses/CourseForm.vue'
import api from '@/services/api'

export default {
  name: 'CreateCourseView',
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
      submitted: false,
      saving: false,
      error: null,
    }
  },
  methods: {
    async handleCreate() {
      this.submitted = true
      if (!this.form.title || !this.form.description) return

      this.saving = true
      this.error = null
      try {
        const { data } = await api.post('/courses', {
          title: this.form.title,
          description: this.form.description,
          category: this.form.category,
          difficulty: this.form.difficulty,
          price: this.form.price,
          thumbnail_url: this.form.thumbnail_url,
        })
        const courseId = data.data.id

        for (let i = 0; i < this.form.lessons.length; i++) {
          const lesson = this.form.lessons[i]
          if (lesson.title) {
            await api.post(`/courses/${courseId}/lessons`, {
              title: lesson.title,
              video_url: lesson.video_url,
              duration: lesson.duration,
              order_index: i + 1,
            })
          }
        }

        this.$router.push(`/courses/${courseId}`)
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to create course'
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
