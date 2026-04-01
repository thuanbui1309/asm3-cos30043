<template>
  <div>
    <section class="hero-section" :style="{ backgroundImage: `url(${heroBg})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content text-center">
        <h1 class="hero-title">{{ $t('home.title') }}</h1>
        <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
        <router-link to="/courses" class="btn btn-primary btn-lg hero-btn">
          {{ $t('home.explore') }}
        </router-link>
      </div>
    </section>

    <section class="py-5">
      <div class="container">
        <h2 class="section-heading">{{ $t('home.whyUs') }}</h2>
        <p class="section-subheading">{{ $t('home.whyUsSubtitle') }}</p>
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="reason-card">
              <div class="reason-image">
                <img :src="instructorsImg" alt="Expert instructors" />
              </div>
              <div class="reason-content">
                <h5>{{ $t('home.expertInstructors') }}</h5>
                <p>{{ $t('home.expertInstructorsDesc') }}</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="reason-card">
              <div class="reason-image">
                <img :src="flexibleImg" alt="Flexible learning" />
              </div>
              <div class="reason-content">
                <h5>{{ $t('home.flexibleLearning') }}</h5>
                <p>{{ $t('home.flexibleLearningDesc') }}</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="reason-card">
              <div class="reason-image">
                <img :src="certificateImg" alt="Certificates" />
              </div>
              <div class="reason-content">
                <h5>{{ $t('home.certificate') }}</h5>
                <p>{{ $t('home.certificateDesc') }}</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <div class="reason-card">
              <div class="reason-image">
                <img :src="communityImg" alt="Community" />
              </div>
              <div class="reason-content">
                <h5>{{ $t('home.community') }}</h5>
                <p>{{ $t('home.communityDesc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="recentlyViewed.length > 0" class="py-5">
      <div class="container">
        <h2 class="section-heading text-start">{{ $t('home.recentlyViewed') }}</h2>
        <div class="row g-4 mt-2">
          <div v-for="course in recentlyViewed" :key="course.id" class="col-6 col-md-3">
            <CourseCardSmall :course="course" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="isAuthenticated && continueCourses.length > 0" class="py-5">
      <div class="container">
        <h2 class="section-heading text-start">{{ $t('home.continueLearning') }}</h2>
        <div class="row g-4 mt-2">
          <div v-for="course in continueCourses" :key="course.id" class="col-6 col-md-3">
            <CourseCardSmall :course="course" :show-progress="true" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="featured.popular.length > 0" class="py-5">
      <div class="container">
        <h2 class="section-heading text-start">{{ $t('home.popularCourses') }}</h2>
        <div class="row g-4 mt-2">
          <div v-for="course in featured.popular" :key="course.id" class="col-6 col-md-3">
            <CourseCardSmall :course="course" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="featured.top_rated.length > 0" class="py-5" style="background-color: var(--color-bg-light);">
      <div class="container">
        <h2 class="section-heading text-start">{{ $t('home.topRated') }}</h2>
        <div class="row g-4 mt-2">
          <div v-for="course in featured.top_rated" :key="course.id" class="col-6 col-md-3">
            <CourseCardSmall :course="course" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="featured.newest.length > 0" class="py-5">
      <div class="container">
        <h2 class="section-heading text-start">{{ $t('home.newCourses') }}</h2>
        <div class="row g-4 mt-2">
          <div v-for="course in featured.newest" :key="course.id" class="col-6 col-md-3">
            <CourseCardSmall :course="course" />
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section py-5">
      <div class="container">
        <h2 class="section-heading">{{ $t('home.stats') }}</h2>
        <div class="row text-center g-4 mt-3">
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon-ring">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div class="stat-number">{{ stats.course_count || 0 }}</div>
              <div class="stat-label">{{ $t('home.courses') }}</div>
              <div class="stat-bar"><div class="stat-bar-fill" style="width: 75%"></div></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon-ring">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="stat-number">{{ stats.student_count || 0 }}</div>
              <div class="stat-label">{{ $t('home.students') }}</div>
              <div class="stat-bar"><div class="stat-bar-fill" style="width: 90%"></div></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon-ring">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="stat-number">{{ stats.instructor_count || 0 }}</div>
              <div class="stat-label">{{ $t('home.instructors') }}</div>
              <div class="stat-bar"><div class="stat-bar-fill" style="width: 50%"></div></div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon-ring">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="stat-number">98%</div>
              <div class="stat-label">{{ $t('home.satisfaction') }}</div>
              <div class="stat-bar"><div class="stat-bar-fill" style="width: 98%"></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5">
      <div class="container">
        <h2 class="section-heading">{{ $t('home.howItWorks') }}</h2>
        <p class="section-subheading">{{ $t('home.howItWorksSubtitle') }}</p>
        <div class="timeline mt-5">
          <div v-for="step in 4" :key="step" class="timeline-item">
            <div class="timeline-left">
              <div class="timeline-dot">{{ step }}</div>
              <div class="timeline-connector" v-if="step < 4"></div>
            </div>
            <div class="timeline-content">
              <h5>{{ $t(`home.step${step}Title`) }}</h5>
              <p>{{ $t(`home.step${step}Desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-section py-5">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-12 col-md-6">
            <img :src="studyImg" alt="Study" class="img-fluid rounded featured-img" />
          </div>
          <div class="col-12 col-md-6">
            <h2 class="mb-3">{{ $t('home.featured') }}</h2>
            <p class="text-muted mb-4">{{ $t('home.whyUsSubtitle') }}</p>
            <ul class="feature-list">
              <li>{{ $t('home.expertInstructorsDesc') }}</li>
              <li>{{ $t('home.flexibleLearningDesc') }}</li>
              <li>{{ $t('home.certificateDesc') }}</li>
            </ul>
            <router-link to="/courses" class="btn btn-primary mt-3">
              {{ $t('home.viewAll') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials-section py-5">
      <div class="container">
        <h2 class="section-heading">{{ $t('home.testimonials') }}</h2>
        <p class="section-subheading">{{ $t('home.testimonialsSubtitle') }}</p>
        <div class="row g-4 mt-2">
          <div v-for="i in 3" :key="i" class="col-12 col-md-4">
            <div class="testimonial-card">
              <p class="testimonial-text">"{{ $t(`home.testimonial${i}`) }}"</p>
              <div class="testimonial-author">
                <strong>{{ $t(`home.testimonial${i}Author`) }}</strong>
                <span>{{ $t(`home.testimonial${i}Role`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container text-center">
        <h2 class="text-white mb-3">{{ $t('home.getStarted') }}</h2>
        <p class="cta-desc mb-4">
          {{ $t('home.getStartedDesc') }}
        </p>
        <router-link to="/register" class="btn btn-light btn-lg hero-btn">
          {{ $t('home.signUpFree') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import heroBg from '@/assets/images/hero-bg.jpg'
import instructorsImg from '@/assets/images/instructors.jpg'
import flexibleImg from '@/assets/images/flexible.jpg'
import certificateImg from '@/assets/images/certificate.jpg'
import communityImg from '@/assets/images/community.jpg'
import studyImg from '@/assets/images/study.jpg'
import CourseCardSmall from '@/components/courses/CourseCardSmall.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HomeView',
  components: { CourseCardSmall },
  data() {
    return {
      heroBg,
      instructorsImg,
      flexibleImg,
      certificateImg,
      communityImg,
      studyImg,
      featured: { popular: [], top_rated: [], newest: [] },
      continueCourses: [],
      recentlyViewed: [],
      stats: { course_count: 0, student_count: 0, instructor_count: 0 },
    }
  },
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
  },
  async created() {
    try {
      const [featuredRes, statsRes] = await Promise.all([
        api.get('/courses/featured'),
        api.get('/courses/stats'),
      ])
      this.featured = featuredRes.data.data
      this.stats = statsRes.data.data
    } catch {
      // ignore
    }
    try {
      this.recentlyViewed = JSON.parse(localStorage.getItem('learnify_recently_viewed') || '[]').slice(0, 4)
    } catch {
      // ignore
    }
    if (this.isAuthenticated) {
      try {
        const { data } = await api.get('/courses/continue')
        this.continueCourses = data.data || []
      } catch {
        // ignore
      }
    }
  },
}
</script>

<style scoped>
  .hero-section {
    position: relative;
    min-height: 100vh;
    margin-top: -70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.65) 50%, rgba(0, 0, 0, 0.85) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    padding: 6rem 1rem 3rem;
    max-width: 800px;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1rem;
    letter-spacing: -0.03em;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
  }

  .hero-btn {
    padding: 0.7rem 2rem;
    font-weight: 700;
    border-radius: 4px;
    font-size: 1rem;
    border-width: 2px;
    letter-spacing: 0.02em;
  }


  .section-heading {
    text-align: center;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .section-subheading {
    text-align: center;
    color: var(--color-text-light);
    margin-bottom: 2rem;
  }

  .reason-card {
    background-color: var(--color-bg);
    border-radius: 8px;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .reason-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .reason-image {
    height: 180px;
    overflow: hidden;
  }

  .reason-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .reason-content {
    padding: 1.25rem;
    flex: 1;
  }

  .reason-content h5 {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  .reason-content p {
    font-size: 0.9rem;
    color: var(--color-text-light);
    line-height: 1.5;
    margin-bottom: 0;
  }

  .stats-section {
    background-color: var(--color-bg-light);
  }

  .stat-card {
    padding: 1.5rem 1rem;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .stat-icon-ring {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: var(--color-bg-secondary);
    color: var(--color-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  .stat-number {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--color-text-light);
    font-weight: 500;
    margin-bottom: 0.75rem;
  }

  .stat-bar {
    height: 4px;
    background-color: var(--color-bg-light);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.25rem;
  }

  .stat-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    border-radius: 2px;
    transition: width 0.6s ease;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 600px;
    margin: 0 auto;
  }

  .timeline-item {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .timeline-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .timeline-dot {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(4, 102, 200, 0.25);
    flex-shrink: 0;
    z-index: 1;
  }

  .timeline-connector {
    width: 2px;
    flex: 1;
    min-height: 2.5rem;
    background: linear-gradient(180deg, var(--color-primary), var(--color-primary-light));
    opacity: 0.3;
    margin: 4px 0;
  }

  .timeline-content {
    padding-bottom: 2rem;
  }

  .timeline-content h5 {
    font-weight: 600;
    margin-bottom: 0.35rem;
    margin-top: 0.6rem;
  }

  .timeline-content p {
    font-size: 0.92rem;
    color: var(--color-text-light);
    line-height: 1.6;
    margin-bottom: 0;
  }

  .featured-img {
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .feature-list {
    list-style: none;
    padding: 0;
  }

  .feature-list li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    color: var(--color-text-light);
    font-size: 0.95rem;
  }

  .feature-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--color-primary);
  }

  .testimonials-section {
    background-color: var(--color-bg-light);
  }

  .testimonial-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .testimonial-text {
    font-style: italic;
    color: var(--color-text);
    line-height: 1.6;
    flex: 1;
    margin-bottom: 1.5rem;
  }

  .testimonial-author {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .testimonial-author strong {
    font-size: 0.95rem;
  }

  .testimonial-author span {
    font-size: 0.85rem;
    color: var(--color-text-light);
  }

  .cta-section {
    display: flex;
    align-items: center;
    padding: 5rem 0;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .cta-desc {
    color: rgba(255, 255, 255, 0.8);
    max-width: 500px;
    margin: 0 auto;
  }

  @media (max-width: 767.98px) {
    .hero-title {
      font-size: 2.2rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .stat-number {
      font-size: 1.8rem;
    }

    .cta-section {
      padding: 3.5rem 0;
    }
  }
</style>
