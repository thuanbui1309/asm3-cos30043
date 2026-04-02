<template>
  <div class="review-section">
    <h4 class="mb-3">{{ $t('reviews.title') }}</h4>

    <div v-if="loading" class="mb-4">
      <SkeletonLoader type="comment" :count="3" />
    </div>

    <template v-else>
    <div class="review-summary mb-4" v-if="aggregate.total_reviews > 0">
      <div class="summary-left">
        <div class="avg-score">{{ aggregate.avg_rating }}</div>
        <StarRating :rating="aggregate.avg_rating" size="md" />
        <div class="total-label">{{ aggregate.total_reviews }} {{ $t('reviews.reviews') }}</div>
      </div>
      <div class="summary-right">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="dist-row">
          <span class="dist-label">{{ star }}</span>
          <div class="dist-bar-track">
            <div class="dist-bar-fill" :style="{ width: distPercent(star) + '%' }"></div>
          </div>
          <span class="dist-count">{{ aggregate.distribution[star] || 0 }}</span>
        </div>
      </div>
    </div>

    <div v-if="canReview && !userReview" class="review-form mb-4">
      <h6>{{ $t('reviews.writeReview') }}</h6>
      <div class="mb-2">
        <StarRating :rating="form.rating" size="lg" interactive @update:rating="form.rating = $event" />
      </div>
      <textarea
        v-model="form.comment"
        class="form-control mb-2"
        rows="3"
        :placeholder="$t('reviews.commentPlaceholder')"
        @keydown.enter.exact.prevent="submitReview"
      ></textarea>
      <button class="btn btn-primary btn-sm" :disabled="form.rating === 0 || submitting" @click="submitReview">
        <span v-if="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
        {{ $t('reviews.submit') }}
      </button>
    </div>

    <div v-if="userReview && !editing" class="user-review-card mb-4">
      <div class="review-header">
        <strong>{{ $t('reviews.yourReview') }}</strong>
        <div class="review-actions">
          <button class="btn-text" @click="startEdit">{{ $t('common.edit') }}</button>
          <button class="btn-text text-danger" @click="deleteReview">{{ $t('common.delete') }}</button>
        </div>
      </div>
      <StarRating :rating="userReview.rating" size="sm" />
      <p class="review-comment" v-if="userReview.comment">{{ userReview.comment }}</p>
    </div>

    <div v-if="editing" class="review-form mb-4">
      <h6>{{ $t('reviews.editReview') }}</h6>
      <div class="mb-2">
        <StarRating :rating="editForm.rating" size="lg" interactive @update:rating="editForm.rating = $event" />
      </div>
      <textarea v-model="editForm.comment" class="form-control mb-2" rows="3" @keydown.enter.exact.prevent="updateReview"></textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" :disabled="submitting" @click="updateReview">{{ $t('reviews.save') }}</button>
        <button class="btn btn-outline-secondary btn-sm" @click="editing = false">{{ $t('common.cancel') }}</button>
      </div>
    </div>

    <div class="review-list">
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-avatar">{{ (review.username || '?').slice(0, 2).toUpperCase() }}</div>
        <div class="review-body">
          <div class="review-meta">
            <strong>{{ review.username }}</strong>
            <StarRating :rating="review.rating" size="sm" />
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
          <p class="review-comment" v-if="review.comment">{{ review.comment }}</p>
        </div>
      </div>
    </div>

    <div v-if="pagination.page < pagination.pages" class="text-center mt-3">
      <button class="btn btn-outline-primary btn-sm" @click="loadMore">{{ $t('reviews.loadMore') }}</button>
    </div>
    </template>
  </div>
</template>

<script>
import StarRating from './StarRating.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import api from '@/services/api'

export default {
  name: 'ReviewSection',
  components: { StarRating, SkeletonLoader },
  props: {
    courseId: { type: String, required: true },
    isEnrolled: { type: Boolean, default: false },
    isAuthenticated: { type: Boolean, default: false },
  },
  data() {
    return {
      reviews: [],
      userReview: null,
      aggregate: { avg_rating: 0, total_reviews: 0, distribution: {} },
      pagination: { page: 1, pages: 1 },
      form: { rating: 0, comment: '' },
      editForm: { rating: 0, comment: '' },
      editing: false,
      submitting: false,
      loading: true,
    }
  },
  computed: {
    canReview() {
      return this.isAuthenticated && this.isEnrolled
    },
  },
  async created() {
    await this.fetchReviews()
  },
  methods: {
    async fetchReviews(page = 1) {
      if (page === 1 && this.reviews.length === 0 && !this.userReview) this.loading = true
      try {
        const { data } = await api.get(`/courses/${this.courseId}/reviews?page=${page}&limit=5`)
        const d = data.data
        if (page === 1) {
          this.reviews = d.reviews.filter((r) => r.id !== d.user_review?.id)
        } else {
          const newReviews = d.reviews.filter((r) => r.id !== d.user_review?.id)
          this.reviews = [...this.reviews, ...newReviews]
        }
        this.userReview = d.user_review
        this.aggregate = d.aggregate
        this.pagination = d.pagination
      } catch {
        // ignore
      } finally {
        this.loading = false
      }
    },
    distPercent(star) {
      if (this.aggregate.total_reviews === 0) return 0
      return ((this.aggregate.distribution[star] || 0) / this.aggregate.total_reviews) * 100
    },
    async submitReview() {
      if (this.form.rating === 0 || this.submitting) return
      this.submitting = true
      try {
        await api.post(`/courses/${this.courseId}/reviews`, {
          rating: this.form.rating,
          comment: this.form.comment || null,
        })
        this.form = { rating: 0, comment: '' }
        await this.fetchReviews()
        this.$emit('review-changed')
      } catch {
        // ignore
      } finally {
        this.submitting = false
      }
    },
    startEdit() {
      if (!this.userReview) return
      this.editForm = { rating: this.userReview.rating, comment: this.userReview.comment || '' }
      this.editing = true
    },
    async updateReview() {
      if (this.submitting) return
      this.submitting = true
      try {
        await api.put(`/reviews/${this.userReview.id}`, {
          rating: this.editForm.rating,
          comment: this.editForm.comment || null,
        })
        this.editing = false
        await this.fetchReviews()
        this.$emit('review-changed')
      } catch {
        // ignore
      } finally {
        this.submitting = false
      }
    },
    async deleteReview() {
      try {
        await api.delete(`/reviews/${this.userReview.id}`)
        this.userReview = null
        await this.fetchReviews()
        this.$emit('review-changed')
      } catch {
        // ignore
      }
    },
    loadMore() {
      this.fetchReviews(this.pagination.page + 1)
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
  },
}
</script>

<style scoped>
  .review-summary {
    display: flex;
    gap: 2rem;
    padding: 1.25rem;
    background-color: var(--color-bg-light);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
  }

  .summary-left {
    text-align: center;
    min-width: 100px;
  }

  .avg-score {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .total-label {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .summary-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    justify-content: center;
  }

  .dist-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dist-label {
    font-size: 0.8rem;
    font-weight: 600;
    width: 16px;
    text-align: right;
    color: var(--color-text-light);
  }

  .dist-bar-track {
    flex: 1;
    height: 6px;
    background-color: var(--color-bg-hover);
    border-radius: 3px;
    overflow: hidden;
  }

  .dist-bar-fill {
    height: 100%;
    background-color: #f5a623;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .dist-count {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    width: 24px;
  }

  .review-form {
    padding: 1.25rem;
    background-color: var(--color-bg-light);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
  }

  .user-review-card {
    padding: 1rem 1.25rem;
    border: 1.5px solid var(--color-primary);
    border-radius: 8px;
    background-color: rgba(4, 102, 200, 0.03);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .review-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-text {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-primary);
    cursor: pointer;
  }

  .btn-text:hover {
    text-decoration: underline;
  }

  .review-item {
    display: flex;
    gap: 0.85rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .review-item:last-child {
    border-bottom: none;
  }

  .review-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-light);
  }

  .review-body {
    flex: 1;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
  }

  .review-date {
    font-size: 0.78rem;
    color: var(--color-text-muted);
  }

  .review-comment {
    font-size: 0.9rem;
    color: var(--color-text-light);
    margin: 0.35rem 0 0;
    line-height: 1.5;
  }

  @media (max-width: 575.98px) {
    .review-summary {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
