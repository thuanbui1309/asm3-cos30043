<template>
  <div class="course-card-sm" @click="$router.push(`/courses/${course.id}`)">
    <div class="card-thumb">
      <img :src="course.thumbnail_url || 'https://placehold.co/400x225/e8e8e8/999?text=Course'" :alt="course.title" />
      <div v-if="showProgress" class="progress-overlay">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: `${progressPct}%` }"></div>
        </div>
        <span class="progress-label">{{ progressPct }}%</span>
      </div>
      <div class="price-badge">
        {{ course.price > 0 ? Number(course.price).toLocaleString('vi-VN') + '₫' : $t('courses.free') }}
      </div>
    </div>
    <div class="card-body">
      <h6 class="card-title">{{ course.title }}</h6>
      <p class="card-instructor">{{ course.instructor_name }}</p>
      <div class="card-footer" v-if="Number(course.avg_rating) > 0">
        <StarRating :rating="Number(course.avg_rating)" size="sm" />
        <span class="card-rating-text">{{ Number(course.avg_rating).toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from './StarRating.vue'

export default {
  name: 'CourseCardSmall',
  components: { StarRating },
  props: {
    course: { type: Object, required: true },
    showProgress: { type: Boolean, default: false },
  },
  computed: {
    progressPct() {
      if (!this.showProgress || !this.course.progress || !this.course.lesson_ids) return 0
      const ids = Array.isArray(this.course.lesson_ids) ? this.course.lesson_ids : []
      if (ids.length === 0) return 0
      const progress = typeof this.course.progress === 'object' ? this.course.progress : {}
      const done = ids.filter((id) => progress[id]).length
      return Math.round((done / ids.length) * 100)
    },
  },
}
</script>

<style scoped>
  .course-card-sm {
    background-color: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .course-card-sm:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }

  .card-thumb {
    position: relative;
    height: 150px;
    overflow: hidden;
  }

  .card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .price-badge {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    backdrop-filter: blur(4px);
  }

  .progress-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.4rem 0.6rem 0.3rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .progress-bar-track {
    flex: 1;
    height: 3px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: 2px;
  }

  .progress-label {
    font-size: 0.65rem;
    color: #fff;
    font-weight: 600;
  }

  .card-body {
    padding: 0.85rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-weight: 600;
    font-size: 0.88rem;
    margin-bottom: 0.2rem;
    line-height: 1.3;
    color: var(--color-text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-instructor {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    margin-bottom: 0;
    flex: 1;
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }

  .card-rating-text {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-light);
  }
</style>
