<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">

        <router-link :to="`/courses/${courseId}`" class="back-link mb-4 d-inline-block">
          &larr; {{ $t('payment.back') }}
        </router-link>

        <div class="payment-card">
          <h3 class="mb-4">{{ $t('payment.title') }}</h3>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else-if="paymentStatus === 'completed'" class="text-center">
            <div class="success-icon mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h4>{{ $t('payment.successTitle') }}</h4>
            <p class="text-muted">{{ $t('payment.successDesc') }}</p>
            <router-link :to="`/courses/${courseId}/learn`" class="btn btn-primary">
              {{ $t('courses.enrolled') }}
            </router-link>
          </div>

          <template v-else>
            <div v-if="course" class="course-summary mb-4">
              <img
                :src="course.thumbnail_url || 'https://placehold.co/400x225/e8e8e8/999?text=Course'"
                :alt="course.title"
                class="course-thumb"
              />
              <div>
                <h5 class="mb-1">{{ course.title }}</h5>
                <p class="price-tag mb-0">{{ Number(course.price).toLocaleString('vi-VN') }}₫</p>
              </div>
            </div>

            <div v-if="qrUrl" class="qr-section text-center mb-4">
              <p class="text-muted mb-2">{{ $t('payment.scanQr') }}</p>
              <img
                :src="qrUrl"
                alt="Payment QR code"
                class="qr-image"
                @error="qrLoadFailed = true"
              />
              <div v-if="qrLoadFailed" class="alert alert-warning py-2 mt-2" style="font-size: 0.85rem;">
                {{ $t('payment.qrLoadFailed') }}
              </div>
            </div>

            <div v-else-if="showNoQrWarning" class="alert alert-warning py-2 mb-4" style="font-size: 0.85rem;">
              {{ $t('payment.noQrConfig') }}
            </div>

            <div v-if="polling" class="text-center mb-3">
              <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              <span class="text-muted">{{ $t('payment.waiting') }}</span>
            </div>

            <button
              v-if="!paymentId"
              class="btn btn-primary w-100"
              :disabled="creating"
              @click="createPayment"
            >
              <span v-if="creating" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('payment.generateQr') }}
            </button>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'PaymentView',
  data() {
    return {
      course: null,
      loading: true,
      creating: false,
      polling: false,
      paymentId: null,
      paymentStatus: null,
      qrUrl: null,
      qrLoadFailed: false,
      showNoQrWarning: false,
      pollInterval: null,
    }
  },
  computed: {
    courseId() { return this.$route.params.courseId },
  },
  async created() {
    try {
      const { data } = await api.get(`/courses/${this.courseId}`)
      this.course = data.data.course || data.data
    } catch {
      this.$router.push('/courses')
    } finally {
      this.loading = false
    }
  },
  beforeUnmount() {
    clearInterval(this.pollInterval)
  },
  methods: {
    async createPayment() {
      this.creating = true
      this.showNoQrWarning = false
      try {
        const { data } = await api.post('/payments/create', { course_id: this.courseId })
        this.paymentId = data.data.payment.id
        const rawQr = data.data.qr_url
        this.qrUrl = rawQr ? `${api.defaults.baseURL}/payments/qr-proxy?url=${encodeURIComponent(rawQr)}` : null
        if (this.qrUrl) {
          this.startPolling()
        } else {
          this.showNoQrWarning = true
        }
      } catch {
        // ignore
      } finally {
        this.creating = false
      }
    },
    startPolling() {
      this.polling = true
      this.pollInterval = setInterval(async () => {
        try {
          const { data } = await api.get(`/payments/${this.paymentId}/status`)
          if (data.data.status === 'completed') {
            clearInterval(this.pollInterval)
            this.paymentStatus = 'completed'
            this.polling = false
          }
        } catch {
          // ignore
        }
      }, 5000)
    },
  },
}
</script>

<style scoped>
  .back-link {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-primary);
    text-decoration: none;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .payment-card {
    background-color: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 12px;
    padding: 2rem;
  }

  .course-summary {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background-color: var(--color-bg-light);
    border-radius: 8px;
    border: 1.5px solid var(--color-border-strong);
  }

  .course-thumb {
    width: 80px;
    height: 50px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .price-tag {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .qr-section {
    background-color: var(--color-bg-light);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .qr-image {
    max-width: 240px;
    border-radius: 8px;
  }

  .success-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--color-bg-secondary);
  }
</style>
