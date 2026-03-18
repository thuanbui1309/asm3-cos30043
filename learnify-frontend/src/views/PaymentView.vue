<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">
        <div class="payment-card">
          <h3 class="mb-4">Payment</h3>

          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else-if="paymentStatus === 'completed'" class="text-center">
            <div class="success-icon mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h4>Payment Successful</h4>
            <p class="text-muted">You have been enrolled in the course.</p>
            <router-link :to="`/courses/${courseId}/learn`" class="btn btn-primary">
              {{ $t('courses.enrolled') }}
            </router-link>
          </div>

          <template v-else>
            <div v-if="course" class="mb-4">
              <h5>{{ course.title }}</h5>
              <p class="text-muted mb-1">Amount: <strong>${{ course.price }}</strong></p>
            </div>

            <div v-if="qrUrl" class="qr-section text-center mb-4">
              <p class="text-muted mb-2">Scan QR to pay via bank transfer</p>
              <img :src="qrUrl" alt="Payment QR code" class="qr-image" />
              <p class="text-muted mt-2">
                Transfer content: <code>{{ transferContent }}</code>
              </p>
            </div>

            <div v-if="polling" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              <span class="text-muted">Waiting for payment confirmation...</span>
            </div>

            <button
              v-if="!qrUrl && !polling"
              class="btn btn-primary w-100"
              :disabled="creating"
              @click="createPayment"
            >
              <span v-if="creating" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Generate QR Code
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
      transferContent: null,
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
      try {
        const { data } = await api.post('/payments/create', { courseId: this.courseId })
        this.paymentId = data.data.id
        this.qrUrl = data.data.qr_url
        this.transferContent = data.data.transfer_content
        this.startPolling()
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
  .payment-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 2rem;
  }

  .qr-image {
    max-width: 250px;
    border: 1px solid var(--color-border);
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
