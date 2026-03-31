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
        :class="{ active: lesson.id === currentLesson?.id, done: progress[lesson.id] }"
        @click="selectLesson(lesson)"
      >
        <span class="lesson-idx" :class="{ 'lesson-idx-done': progress[lesson.id] }">
          <svg v-if="progress[lesson.id]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <div class="lesson-detail">
          <span class="lesson-name">{{ lesson.title }}</span>
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
      progress: {},
    }
  },
  async created() {
    try {
      const courseId = this.$route.params.id
      const { data } = await api.get(`/courses/${courseId}`)
      this.course = data.data.course || data.data
      this.lessons = data.data.lessons || []
      if (this.lessons.length > 0) {
        this.currentLesson = this.lessons[0]
      }
      const enrollResp = await api.get('/enrollments')
      const enrollment = (enrollResp.data.data || []).find((e) => e.course_id === courseId)
      if (enrollment) {
        this.enrollmentId = enrollment.id
        this.progress = (enrollment.progress && typeof enrollment.progress === 'object')
          ? enrollment.progress
          : {}
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
      if (!this.enrollmentId || !this.currentLesson) return
      if (time > 5 && !this.progress[this.currentLesson.id]) {
        this.progress = { ...this.progress, [this.currentLesson.id]: true }
        api.put(`/enrollments/${this.enrollmentId}/progress`, {
          progress: this.progress,
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
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;
  }

  .lesson-idx-done {
    background-color: #d4edda;
    border-color: #28a745;
    color: #155724;
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
