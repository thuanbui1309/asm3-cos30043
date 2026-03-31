<template>
  <div>
    <section class="about-hero">
      <div class="container">
        <h1 class="about-hero-title">{{ $t('about.title') }}</h1>
        <p class="about-hero-desc">{{ $t('about.description') }}</p>
      </div>
    </section>

    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div v-for="value in values" :key="value.key" class="col-12 col-md-6 col-lg-3">
            <div class="value-card">
              <div class="value-number">{{ value.stat }}</div>
              <h5>{{ $t(`about.values.${value.key}.title`) }}</h5>
              <p>{{ $t(`about.values.${value.key}.desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="about-interactive py-5">
      <div class="container">
        <div class="row g-5 align-items-start">
          <div class="col-12 col-md-5">
            <h2 class="mb-4">{{ $t('about.tryTitle') }}</h2>
            <div class="mb-4">
              <label for="visitorName" class="form-label">{{ $t('about.yourName') }}</label>
              <input
                id="visitorName"
                v-model="visitorName"
                type="text"
                class="form-control"
                :placeholder="$t('about.namePlaceholder')"
                aria-label="Your name"
              />
              <p v-if="visitorName" class="welcome-msg mt-2">
                {{ $t('about.welcome') }}, <strong>{{ visitorName }}</strong>! {{ $t('about.welcomeDesc') }}
              </p>
            </div>
            <div>
              <p class="form-label mb-2">{{ $t('about.interestLabel') }}</p>
              <div v-for="track in tracks" :key="track.key" class="form-check mb-2">
                <input
                  :id="`track-${track.key}`"
                  v-model="selectedTrack"
                  class="form-check-input"
                  type="radio"
                  :value="track.key"
                  :aria-label="$t(`about.tracks.${track.key}.label`)"
                />
                <label class="form-check-label" :for="`track-${track.key}`">
                  {{ $t(`about.tracks.${track.key}.label`) }}
                </label>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="track-card">
              <div class="track-tag">{{ $t(`about.tracks.${selectedTrack}.label`) }}</div>
              <h3>{{ $t(`about.tracks.${selectedTrack}.title`) }}</h3>
              <p>{{ $t(`about.tracks.${selectedTrack}.desc`) }}</p>
              <ul class="track-list">
                <li v-for="item in $tm(`about.tracks.${selectedTrack}.items`)" :key="item">{{ item }}</li>
              </ul>
              <router-link to="/courses" class="btn btn-primary mt-3">
                {{ $t('about.exploreCourses') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      visitorName: '',
      selectedTrack: 'web',
      values: [
        { key: 'mission', stat: '10K+' },
        { key: 'courses', stat: '150+' },
        { key: 'instructors', stat: '50+' },
        { key: 'satisfaction', stat: '98%' },
      ],
      tracks: [
        { key: 'web' },
        { key: 'data' },
        { key: 'design' },
        { key: 'devops' },
      ],
    }
  },
}
</script>

<style scoped>
  .about-hero {
    background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
    border-bottom: 1px solid var(--color-border);
    padding: 4rem 0 3rem;
    margin-top: 56px;
  }

  .about-hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .about-hero-desc {
    font-size: 1.1rem;
    color: var(--color-text-light);
    max-width: 650px;
    line-height: 1.7;
  }

  .value-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    padding: 1.75rem 1.5rem;
    height: 100%;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .value-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .value-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .value-card h5 {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  .value-card p {
    font-size: 0.88rem;
    color: var(--color-text-light);
    margin-bottom: 0;
    line-height: 1.5;
  }

  .about-interactive {
    background-color: var(--color-bg-light);
  }

  .welcome-msg {
    font-size: 0.95rem;
    color: var(--color-primary);
  }

  .track-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    padding: 2rem;
    border-left: 4px solid var(--color-primary);
  }

  .track-tag {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-primary);
    background: var(--color-bg-secondary);
    padding: 0.2rem 0.7rem;
    border-radius: 20px;
    margin-bottom: 0.75rem;
  }

  .track-card h3 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .track-card p {
    color: var(--color-text-light);
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  .track-list {
    list-style: none;
    padding: 0;
    margin-bottom: 0;
  }

  .track-list li {
    padding: 0.35rem 0 0.35rem 1.25rem;
    position: relative;
    font-size: 0.92rem;
    color: var(--color-text);
  }

  .track-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-primary);
  }
</style>
