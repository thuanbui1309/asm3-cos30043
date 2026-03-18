<template>
  <div class="container py-4">
    <h2 class="mb-4">{{ $t('about.title') }}</h2>
    <p class="lead mb-5" style="max-width: 700px;">{{ $t('about.description') }}</p>

    <div class="row g-4">
      <div class="col-12 col-md-6">
        <div class="card p-4">
          <div class="mb-3">
            <label for="firstName" class="form-label">{{ $t('about.firstName') }}</label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              class="form-control"
              aria-required="true"
            />
          </div>
          <div class="mb-3">
            <label for="lastName" class="form-label">{{ $t('about.lastName') }}</label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              class="form-control"
              aria-required="true"
            />
          </div>
          <p v-if="fullName" class="welcome-message">
            {{ $t('about.welcome') }}, <strong>{{ fullName }}</strong>!
          </p>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="card p-4">
          <h5 class="mb-3">{{ $t('about.preferredEnvironment') }}</h5>
          <div class="mb-3">
            <div class="form-check">
              <input
                id="mountain"
                v-model="selectedScene"
                class="form-check-input"
                type="radio"
                value="mountain"
              />
              <label class="form-check-label" for="mountain">{{ $t('about.mountain') }}</label>
            </div>
            <div class="form-check">
              <input
                id="ocean"
                v-model="selectedScene"
                class="form-check-input"
                type="radio"
                value="ocean"
              />
              <label class="form-check-label" for="ocean">{{ $t('about.ocean') }}</label>
            </div>
          </div>
          <img
            v-if="selectedScene === 'mountain'"
            :src="mountainImg"
            alt="Mountain landscape"
            class="img-fluid rounded"
          />
          <img
            v-else
            :src="oceanImg"
            alt="Ocean view"
            class="img-fluid rounded"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mountainImg from '@/assets/images/mountain.jpg'
import oceanImg from '@/assets/images/ocean.jpg'

export default {
  name: 'AboutView',
  data() {
    return {
      firstName: '',
      lastName: '',
      selectedScene: 'mountain',
      mountainImg,
      oceanImg,
    }
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`.trim()
    },
  },
}
</script>

<style scoped>
  .welcome-message {
    font-size: 1.1rem;
    color: var(--color-primary);
    margin-top: 0.5rem;
  }
</style>
