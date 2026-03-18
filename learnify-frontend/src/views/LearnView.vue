<template>
  <div class="learn-layout">
    <div class="learn-main">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <template v-else>
        <VideoPlayer
          v-if="currentLesson"
          :src="currentLesson.video_url || ''"
          :key="currentLesson.id"
          @timeupdate="onTimeUpdate"
        />
        <div class="lesson-header">
          <h4>{{ currentLesson?.title }}</h4>
          <p class="text-muted">{{ course?.title }}</p>
        </div>
      </template>
    </div>

    <aside class="learn-sidebar">
      <h5 class="sidebar-title">{{ $t('courses.lessons') }}</h5>
      <div
        v-for="(lesson, index) in lessons"
        :key="lesson.id"
        class="sidebar-lesson"
        :class="{ active: lesson.id === currentLesson?.id }"
        @click="selectLesson(lesson)"
      >
        <span class="lesson-idx">{{ index + 1 }}</span>
        <div class="lesson-detail">
          <span class="lesson-name">{{ lesson.title }}</span>
          <small v-if="lesson.duration" class="text-muted">{{ lesson.duration }} min</small>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
import VideoPlayer from '@/components/courses/VideoPlayer.vue'
import api from '@/services/api'

export default {
  name: 'LearnView',
  components: { VideoPlayer },
  data() {
    return {
      course: null,
      lessons: [],
      currentLesson: null,
      loading: true,
      enrollmentId: null,
    }
  },
  async created() {
    try {
      const { data } = await api.get(`/courses/${this.$route.params.id}`)
      this.course = data.data.course || data.data
      this.lessons = data.data.lessons || []
      if (this.lessons.length > 0) {
        this.currentLesson = this.lessons[0]
      }
    } catch {
      this.$router.push('/courses')
    } finally {
      this.loading = false
    }
  },
  methods: {
    selectLesson(lesson) {
      this.currentLesson = lesson
    },
    onTimeUpdate(time) {
      if (!this.enrollmentId) return
      if (Math.floor(time) % 30 === 0 && time > 0) {
        api.put(`/enrollments/${this.enrollmentId}/progress`, {
          lessonId: this.currentLesson.id,
          time,
        }).catch(() => {})
      }
    },
  },
}
</script>

<style scoped>
  .learn-layout {
    display: flex;
    min-height: calc(100vh - 70px);
  }

  .learn-main {
    flex: 1;
    padding: 0;
  }

  .lesson-header {
    padding: 1.5rem;
  }

  .learn-sidebar {
    width: 320px;
    border-left: 1px solid var(--color-border);
    background-color: var(--color-bg-light);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .sidebar-title {
    padding: 1rem 1rem 0.5rem;
    font-weight: 600;
  }

  .sidebar-lesson {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.15s ease;
  }

  .sidebar-lesson:hover {
    background-color: var(--color-bg-hover);
  }

  .sidebar-lesson.active {
    background-color: var(--color-bg-secondary);
    border-left: 3px solid var(--color-primary);
  }

  .lesson-idx {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .lesson-detail {
    display: flex;
    flex-direction: column;
  }

  .lesson-name {
    font-size: 0.9rem;
    font-weight: 500;
  }

  @media (max-width: 767.98px) {
    .learn-layout {
      flex-direction: column;
    }

    .learn-sidebar {
      width: 100%;
      border-left: none;
      border-top: 1px solid var(--color-border);
    }
  }
</style>
