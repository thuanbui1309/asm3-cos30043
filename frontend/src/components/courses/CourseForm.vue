<template>
  <form @submit.prevent="$emit('submit')" novalidate>
    <div class="form-section">
      <div class="form-section-header">
        <span class="form-section-number">1</span>
        <div>
          <h5 class="form-section-title">{{ $t('courses.courseTitle') }}</h5>
          <p class="form-section-desc">{{ $t('courseForm.titleDesc') }}</p>
        </div>
      </div>
      <div class="form-section-body">
        <div class="mb-3">
          <label for="title" class="form-label">{{ $t('courses.courseTitle') }} <span class="text-danger">*</span></label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': fieldErrors.title }"
            :placeholder="$t('courseForm.titlePlaceholder')"
            required
          />
          <small v-if="fieldErrors.title" class="text-danger error-text">{{ fieldErrors.title }}</small>
        </div>
        <div class="mb-0">
          <label for="description" class="form-label">{{ $t('courses.courseDescription') }} <span class="text-danger">*</span></label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-control"
            rows="4"
            :class="{ 'is-invalid': fieldErrors.description }"
            :placeholder="$t('courseForm.descriptionPlaceholder')"
            required
          ></textarea>
          <small v-if="fieldErrors.description" class="text-danger error-text">{{ fieldErrors.description }}</small>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-header">
        <span class="form-section-number">2</span>
        <div>
          <h5 class="form-section-title">{{ $t('courseForm.detailsTitle') }}</h5>
          <p class="form-section-desc">{{ $t('courseForm.detailsDesc') }}</p>
        </div>
      </div>
      <div class="form-section-body">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label for="category" class="form-label">{{ $t('courses.courseCategory') }}</label>
            <select
              id="category"
              v-model="form.category"
              class="form-select"
              :class="{ 'is-invalid': fieldErrors.category }"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ $t(`courses.categories.${cat}`) }}
              </option>
            </select>
            <small v-if="fieldErrors.category" class="text-danger error-text">{{ fieldErrors.category }}</small>
          </div>
          <div class="col-12">
            <label class="form-label">{{ $t('courses.coursePrice') }}</label>
            <div class="price-type-toggle mb-3" :class="{ 'price-locked': priceLocked }">
              <label class="price-type-option" :class="{ active: form.price === 0 }">
                <input v-model.number="form.price" type="radio" :value="0" class="visually-hidden" :disabled="priceLocked" />
                {{ $t('courses.free') }}
              </label>
              <label class="price-type-option" :class="{ active: form.price > 0 }">
                <input
                  type="radio"
                  class="visually-hidden"
                  :checked="form.price > 0"
                  :disabled="priceLocked"
                  @change="form.price = 299000"
                />
                {{ $t('courses.paid') }}
              </label>
            </div>
            <div v-if="form.price > 0" class="price-input-wrap">
              <input
                ref="priceInput"
                :value="priceDisplay"
                type="text"
                class="form-control price-input"
                inputmode="numeric"
                :placeholder="$t('courseForm.pricePlaceholder')"
                :disabled="priceLocked"
                @focus="onPriceFocus"
                @blur="onPriceBlur"
                @input="onPriceInput"
              />
              <span class="price-suffix">₫</span>
            </div>
            <small v-if="fieldErrors.price" class="text-danger error-text">{{ fieldErrors.price }}</small>
            <p v-if="priceLocked" class="price-lock-notice">
              {{ $t('courses.priceLocked') }}
            </p>
          </div>
          <div class="col-12">
            <label class="form-label">{{ $t('courses.courseDifficulty') }}</label>
            <div class="difficulty-picker">
              <label
                v-for="level in ['beginner', 'intermediate', 'advanced']"
                :key="level"
                class="difficulty-option"
                :class="{ active: form.difficulty === level }"
              >
                <input
                  v-model="form.difficulty"
                  type="radio"
                  :value="level"
                  class="visually-hidden"
                />
                <span class="difficulty-dot" :class="`dot-${level}`"></span>
                {{ $t(`courses.${level}`) }}
              </label>
            </div>
            <small v-if="fieldErrors.difficulty" class="text-danger error-text">{{ fieldErrors.difficulty }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-header">
        <span class="form-section-number">3</span>
        <div>
          <h5 class="form-section-title">{{ $t('courses.courseThumbnail') }}</h5>
          <p class="form-section-desc">{{ $t('courseForm.thumbnailDesc') }}</p>
        </div>
      </div>
      <div class="form-section-body">
        <div class="row g-3 align-items-start">
          <div class="col-12 col-md-7">
            <label for="thumbnail" class="form-label">{{ $t('courseForm.imageFile') }}</label>
            <input
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="form-control"
              :disabled="uploading.thumbnail"
              @change="onThumbnailChange"
            />
            <div v-if="uploading.thumbnail" class="upload-status mt-2">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('courseForm.uploading') }}
            </div>
            <div v-else-if="uploadErrors.thumbnail" class="upload-status mt-2 text-danger">
              {{ uploadErrors.thumbnail }}
            </div>
            <div v-else-if="form.thumbnail_url" class="upload-status mt-2 text-success">
              {{ $t('courseForm.uploaded') }}
            </div>
            <div class="form-text">{{ $t('courseForm.thumbnailHint') }}</div>
          </div>
          <div class="col-12 col-md-5">
            <div class="thumbnail-preview">
              <img v-if="form.thumbnail_url" :src="form.thumbnail_url" alt="Thumbnail preview" />
              <div v-else class="thumbnail-placeholder">
                <span>{{ $t('courseForm.noImage') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-header">
        <span class="form-section-number">4</span>
        <div>
          <h5 class="form-section-title">{{ $t('courses.lessons') }}</h5>
          <p class="form-section-desc">{{ $t('courseForm.lessonsDesc') }}</p>
        </div>
      </div>
      <div class="form-section-body">
        <div v-if="form.lessons.length === 0" class="lessons-empty">
          <p class="text-muted mb-3">{{ $t('courseForm.noLessons') }}</p>
        </div>

        <div
          v-for="(lesson, index) in form.lessons"
          :key="lesson.id || lesson._key"
          class="lesson-item"
        >
          <div class="lesson-item-header">
            <span class="lesson-index">{{ $t('courseForm.lessonIndex', { n: index + 1 }) }}</span>
            <button type="button" class="btn-remove-lesson" @click="removeLesson(index)">
              {{ $t('courses.removeLesson') }}
            </button>
          </div>
          <div class="row g-3">
            <div class="col-12 col-md-5">
              <label class="form-label">{{ $t('courses.lessonTitle') }}</label>
              <input
                v-model="lesson.title"
                type="text"
                class="form-control"
                :placeholder="$t('courseForm.lessonTitlePlaceholder')"
              />
            </div>
            <div class="col-12 col-md-7">
              <label class="form-label">{{ $t('courses.lessonVideo') }}</label>
              <input
                type="file"
                accept="video/mp4,video/mov,video/quicktime"
                class="form-control"
                :disabled="uploading.lessons[index]"
                @change="onVideoChange($event, index)"
              />
              <div v-if="uploading.lessons[index]" class="upload-status mt-1">
                <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                {{ $t('courseForm.uploading') }}
              </div>
              <div v-else-if="uploadErrors.lessons[index]" class="upload-status mt-1 text-danger">
                {{ uploadErrors.lessons[index] }}
              </div>
              <div v-else-if="lesson.video_url" class="upload-status mt-1 text-success">
                {{ $t('courseForm.videoUploaded') }}
              </div>
            </div>
            <div class="col-12">
              <label class="form-label">{{ $t('courses.lessonDescription') }}</label>
              <textarea
                v-model="lesson.description"
                class="form-control"
                rows="2"
                :placeholder="$t('courseForm.lessonDescPlaceholder')"
              ></textarea>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-outline-primary btn-add-lesson" @click="addLesson">
          + {{ $t('courses.addLesson') }}
        </button>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary btn-submit" :disabled="saving || isUploading">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ $t('courses.saveCourse') }}
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="$router.back()">
        {{ $t('common.cancel') }}
      </button>
    </div>
  </form>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'CourseForm',
  props: {
    form: { type: Object, required: true },
    submitted: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    priceLocked: { type: Boolean, default: false },
  },
  emits: ['submit'],
  data() {
    return {
      categories: ['web-dev', 'data-science', 'mobile-dev', 'design', 'devops', 'other'],
      priceFocused: false,
      uploading: { thumbnail: false, lessons: {} },
      uploadErrors: { thumbnail: '', lessons: {} },
    }
  },
  computed: {
    fieldErrors() {
      if (!this.submitted) return {}
      const errors = {}
      if (!this.form.title) errors.title = this.$t('validation.required')
      if (!this.form.description) errors.description = this.$t('validation.required')
      if (!this.form.category) errors.category = this.$t('validation.required')
      if (!this.form.difficulty) errors.difficulty = this.$t('validation.required')
      if (this.form.price !== 0 && (!this.form.price || this.form.price <= 0)) {
        errors.price = this.$t('validation.pricePositive')
      }
      return errors
    },
    isUploading() {
      return this.uploading.thumbnail || Object.values(this.uploading.lessons).some(Boolean)
    },
    priceDisplay() {
      if (this.priceFocused) return this.form.price || ''
      return this.form.price ? this.form.price.toLocaleString('vi-VN') : ''
    },
  },
  methods: {
    onPriceFocus() {
      this.priceFocused = true
      this.$nextTick(() => {
        const el = this.$refs.priceInput
        if (el) { el.value = this.form.price || ''; el.select() }
      })
    },
    onPriceBlur(e) {
      this.priceFocused = false
      const raw = parseInt(e.target.value.replace(/\D/g, ''), 10)
      this.form.price = isNaN(raw) ? this.form.price : raw
    },
    onPriceInput(e) {
      const raw = parseInt(e.target.value.replace(/\D/g, ''), 10)
      if (!isNaN(raw)) this.form.price = raw
    },
    addLesson() {
      this.form.lessons.push({ id: null, _key: Date.now(), title: '', video_url: '', description: '' })
    },
    removeLesson(index) {
      this.form.lessons.splice(index, 1)
      const reindex = (obj) => {
        const updated = {}
        Object.keys(obj).forEach((k) => {
          const n = parseInt(k)
          if (n < index) updated[n] = obj[k]
          if (n > index) updated[n - 1] = obj[k]
        })
        return updated
      }
      this.uploading.lessons = reindex(this.uploading.lessons)
      this.uploadErrors.lessons = reindex(this.uploadErrors.lessons)
    },
    async onThumbnailChange(event) {
      const file = event.target.files[0]
      if (!file) return
      this.uploading.thumbnail = true
      this.uploadErrors.thumbnail = ''
      try {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        this.form.thumbnail_url = data.data.url
      } catch (err) {
        this.uploadErrors.thumbnail = err.response?.data?.error || 'Upload failed. Please try again.'
      } finally {
        this.uploading.thumbnail = false
      }
    },
    async onVideoChange(event, index) {
      const file = event.target.files[0]
      if (!file) return
      this.uploading.lessons = { ...this.uploading.lessons, [index]: true }
      this.uploadErrors.lessons = { ...this.uploadErrors.lessons, [index]: '' }
      try {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        this.form.lessons[index].video_url = data.data.url
      } catch (err) {
        this.uploadErrors.lessons = { ...this.uploadErrors.lessons, [index]: err.response?.data?.error || 'Upload failed. Please try again.' }
      } finally {
        this.uploading.lessons = { ...this.uploading.lessons, [index]: false }
      }
    },
  },
}
</script>

<style scoped>
  .form-section {
    background-color: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 12px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .form-section-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-bg-light);
  }

  .form-section-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .form-section-title {
    font-weight: 600;
    margin-bottom: 0.15rem;
    font-size: 1rem;
  }

  .form-section-desc {
    font-size: 0.85rem;
    color: var(--color-text-light);
    margin-bottom: 0;
  }

  .form-section-body {
    padding: 1.5rem;
  }

  .price-type-toggle {
    display: flex;
    gap: 0;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
  }

  .price-type-option {
    padding: 0.45rem 1.4rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
    user-select: none;
    color: var(--color-text-light);
  }

  .price-type-option + .price-type-option {
    border-left: 2px solid var(--color-border);
  }

  .price-type-option.active {
    background-color: var(--color-primary);
    color: #fff;
  }

  .price-locked {
    opacity: 0.55;
    pointer-events: none;
  }

  .price-lock-notice {
    font-size: 0.8rem;
    color: var(--color-text-light);
    margin-top: 0.4rem;
    margin-bottom: 0;
  }

  .price-input-wrap {
    position: relative;
    max-width: 260px;
  }

  .price-input {
    padding-right: 2rem;
  }

  .price-suffix {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-light);
    font-weight: 600;
    pointer-events: none;
  }

  .difficulty-picker {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .difficulty-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: border-color 0.15s, background-color 0.15s;
    user-select: none;
  }

  .difficulty-option.active {
    border-color: var(--color-primary);
    background-color: rgba(99, 102, 241, 0.06);
    color: var(--color-primary);
  }

  .difficulty-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot-beginner { background-color: #28a745; }
  .dot-intermediate { background-color: #ffc107; }
  .dot-advanced { background-color: #dc3545; }

  .thumbnail-preview {
    height: 130px;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumbnail-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  .upload-status {
    font-size: 0.82rem;
    display: flex;
    align-items: center;
  }

  .lessons-empty {
    text-align: center;
    padding: 1.5rem 0 0.5rem;
  }

  .lesson-item {
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    background-color: var(--color-bg-light);
  }

  .lesson-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .lesson-index {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .btn-remove-lesson {
    background: none;
    border: none;
    color: #dc3545;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
  }

  .btn-remove-lesson:hover {
    text-decoration: underline;
  }

  .btn-add-lesson {
    width: 100%;
    margin-top: 0.5rem;
    font-weight: 600;
    border-style: dashed;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .btn-submit {
    font-weight: 700;
    border: 2px solid var(--color-primary);
    border-radius: 4px;
    letter-spacing: 0.02em;
    padding: 0.5rem 2rem;
  }

  .error-text {
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
  }
</style>
