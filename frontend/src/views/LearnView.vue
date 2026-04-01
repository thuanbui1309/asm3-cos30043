<template>
  <div class="learn-layout">
    <div class="learn-main">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <template v-else>
        <VideoPlayer
          v-if="currentLesson"
          ref="videoPlayer"
          :src="currentLesson.video_url || ''"
          :key="currentLesson.id"
          @timeupdate="onTimeUpdate"
          @ended="onVideoEnded"
        />
        <div class="lesson-header">
          <h4>{{ currentLesson?.title }}</h4>
          <p class="text-muted">{{ course?.title }}</p>
        </div>

        <div class="learn-tabs">
          <button
            v-for="tab in ['about', 'notes', 'discussion']"
            :key="tab"
            class="learn-tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ $t(`${tab === 'about' ? 'courses.course' : tab === 'notes' ? 'notes.title' : 'comments.title'}`) }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'about'" class="tab-pane">
            <p v-if="currentLesson?.description">{{ currentLesson.description }}</p>
            <p v-else class="text-muted">{{ $t('courses.noResults') }}</p>
          </div>
          <div v-if="activeTab === 'notes'" class="tab-pane">
            <LessonNotes
              v-if="currentLesson"
              :lesson-id="currentLesson.id"
              :current-time="currentVideoTime"
              @seek="seekVideo"
            />
          </div>
          <div v-if="activeTab === 'discussion'" class="tab-pane">
            <CommentSection
              v-if="currentLesson"
              :lesson-id="currentLesson.id"
            />
          </div>
        </div>
      </template>
    </div>

    <aside class="learn-sidebar">
      <div class="sidebar-header">
        <h5 class="sidebar-title">{{ $t('courses.lessons') }}</h5>
        <div class="progress-summary" v-if="lessons.length > 0">
          <span class="progress-text">{{ completedCount }} / {{ lessons.length }}</span>
          <div class="progress-bar-mini">
            <div class="progress-bar-fill-mini" :style="{ width: `${progressPercent}%` }"></div>
          </div>
        </div>
      </div>
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
import LessonNotes from '@/components/courses/LessonNotes.vue'
import CommentSection from '@/components/courses/CommentSection.vue'
import api from '@/services/api'

export default {
  name: 'LearnView',
  components: { VideoPlayer, LessonNotes, CommentSection },
  data() {
    return {
      course: null,
      lessons: [],
      currentLesson: null,
      loading: true,
      enrollmentId: null,
      progress: {},
      activeTab: 'about',
      currentVideoTime: 0,
    }
  },
  computed: {
    completedCount() {
      return this.lessons.filter((l) => this.progress[l.id]).length
    },
    progressPercent() {
      if (this.lessons.length === 0) return 0
      return Math.round((this.completedCount / this.lessons.length) * 100)
    },
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
      this.activeTab = 'about'
    },
    onTimeUpdate(time) {
      this.currentVideoTime = time
      if (!this.enrollmentId || !this.currentLesson) return
      if (time > 5 && !this.progress[this.currentLesson.id]) {
        this.progress = { ...this.progress, [this.currentLesson.id]: true }
        api.put(`/enrollments/${this.enrollmentId}/progress`, {
          progress: this.progress,
        }).catch(() => {})
      }
    },
    onVideoEnded() {
      const currentIndex = this.lessons.findIndex((l) => l.id === this.currentLesson?.id)
      if (currentIndex >= 0 && currentIndex < this.lessons.length - 1) {
        this.currentLesson = this.lessons[currentIndex + 1]
      }
    },
    seekVideo(seconds) {
      const video = this.$refs.videoPlayer?.$refs?.video
      if (video) {
        video.currentTime = seconds
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

  .learn-tabs {
    display: flex;
    border-bottom: 2px solid var(--color-border);
    padding: 0 1.5rem;
    gap: 0;
  }

  .learn-tab {
    padding: 0.6rem 1.25rem;
    background: none;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-light);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: color 0.15s, border-color 0.15s;
  }

  .learn-tab:hover {
    color: var(--color-text);
  }

  .learn-tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  .tab-content {
    padding: 1.5rem;
  }

  .learn-sidebar {
    width: 320px;
    border-left: 1px solid var(--color-border);
    background-color: var(--color-bg-light);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .sidebar-header {
    padding: 1rem 1rem 0.5rem;
  }

  .sidebar-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .progress-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-text {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-light);
    white-space: nowrap;
  }

  .progress-bar-mini {
    flex: 1;
    height: 4px;
    background-color: var(--color-bg-hover);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill-mini {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
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
