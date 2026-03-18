<template>
  <form @submit.prevent="$emit('submit')" novalidate>
    <div class="mb-3">
      <label for="title" class="form-label">{{ $t('courses.courseTitle') }} *</label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': submitted && !form.title }"
        required
      />
      <div class="invalid-feedback">Required</div>
    </div>

    <div class="mb-3">
      <label for="description" class="form-label">{{ $t('courses.courseDescription') }} *</label>
      <textarea
        id="description"
        v-model="form.description"
        class="form-control"
        rows="4"
        :class="{ 'is-invalid': submitted && !form.description }"
        required
      ></textarea>
      <div class="invalid-feedback">Required</div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-md-4">
        <label for="category" class="form-label">{{ $t('courses.courseCategory') }}</label>
        <select id="category" v-model="form.category" class="form-select">
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ $t(`courses.categories.${cat}`) }}
          </option>
        </select>
      </div>
      <div class="col-12 col-md-4">
        <label class="form-label">{{ $t('courses.courseDifficulty') }}</label>
        <div class="d-flex gap-3 mt-1">
          <div v-for="level in ['beginner', 'intermediate', 'advanced']" :key="level" class="form-check">
            <input
              :id="`diff-${level}`"
              v-model="form.difficulty"
              type="radio"
              class="form-check-input"
              :value="level"
            />
            <label :for="`diff-${level}`" class="form-check-label">
              {{ $t(`courses.${level}`) }}
            </label>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <label for="price" class="form-label">{{ $t('courses.coursePrice') }} ($)</label>
        <input
          id="price"
          v-model.number="form.price"
          type="number"
          class="form-control"
          min="0"
          step="0.01"
        />
      </div>
    </div>

    <div class="mb-4">
      <label for="thumbnail" class="form-label">{{ $t('courses.courseThumbnail') }}</label>
      <input
        id="thumbnail"
        v-model="form.thumbnail_url"
        type="url"
        class="form-control"
        placeholder="https://..."
      />
    </div>

    <div class="lessons-section mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">{{ $t('courses.lessons') }}</h5>
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addLesson">
          {{ $t('courses.addLesson') }}
        </button>
      </div>

      <div
        v-for="(lesson, index) in form.lessons"
        :key="index"
        class="lesson-form-item"
      >
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label">{{ $t('courses.lessonTitle') }}</label>
            <input v-model="lesson.title" type="text" class="form-control form-control-sm" required />
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label">{{ $t('courses.lessonVideoUrl') }}</label>
            <input v-model="lesson.video_url" type="url" class="form-control form-control-sm" />
          </div>
          <div class="col-6 col-md-2">
            <label class="form-label">{{ $t('courses.lessonDuration') }}</label>
            <input v-model.number="lesson.duration" type="number" class="form-control form-control-sm" min="0" />
          </div>
          <div class="col-6 col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm w-100" @click="removeLesson(index)">
              {{ $t('courses.removeLesson') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ $t('courses.saveCourse') }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="$router.back()">
        Cancel
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'CourseForm',
  props: {
    form: { type: Object, required: true },
    submitted: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
  },
  emits: ['submit'],
  data() {
    return {
      categories: ['web-dev', 'data-science', 'mobile-dev', 'design', 'devops', 'other'],
    }
  },
  methods: {
    addLesson() {
      this.form.lessons.push({ title: '', video_url: '', duration: 0 })
    },
    removeLesson(index) {
      this.form.lessons.splice(index, 1)
    },
  },
}
</script>

<style scoped>
  .lesson-form-item {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background-color: var(--color-bg-light);
  }
</style>
