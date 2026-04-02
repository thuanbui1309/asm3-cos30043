<template>
  <div class="lesson-notes">
    <div class="note-form mb-3">
      <textarea
        v-model="newContent"
        class="form-control mb-2"
        :placeholder="$t('notes.placeholder')"
        rows="2"
        :disabled="saving"
        @keydown.enter.exact.prevent="addNote"
      ></textarea>
      <div class="d-flex justify-content-between align-items-center">
        <span class="timestamp-badge" v-if="currentTime > 0">
          {{ $t('notes.atTimestamp') }} {{ formatTime(currentTime) }}
        </span>
        <button class="btn btn-primary btn-sm" :disabled="!newContent.trim() || saving" @click="addNote">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ $t('notes.addNote') }}
        </button>
      </div>
    </div>

    <div v-if="loadingNotes">
      <SkeletonLoader type="line" :count="3" />
    </div>

    <div v-else-if="notes.length === 0" class="text-muted text-center py-3">
      {{ $t('notes.noNotes') }}
    </div>

    <div v-for="note in notes" :key="note.id" class="note-card">
      <div class="note-header">
        <button class="timestamp-link" @click="$emit('seek', note.timestamp_sec)">
          {{ formatTime(note.timestamp_sec) }}
        </button>
        <div class="note-actions">
          <button class="btn-text" @click="startEdit(note)">{{ $t('common.edit') }}</button>
          <button class="btn-text text-danger" @click="deleteNote(note.id)">{{ $t('common.delete') }}</button>
        </div>
      </div>
      <div v-if="editingId !== note.id" class="note-content">{{ note.content }}</div>
      <div v-else>
        <textarea v-model="editContent" class="form-control mb-2" rows="2"></textarea>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" @click="updateNote(note.id)">{{ $t('notes.save') }}</button>
          <button class="btn btn-outline-secondary btn-sm" @click="editingId = null">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

export default {
  name: 'LessonNotes',
  components: { SkeletonLoader },
  props: {
    lessonId: { type: String, required: true },
    currentTime: { type: Number, default: 0 },
  },
  emits: ['seek'],
  data() {
    return {
      notes: [],
      newContent: '',
      editingId: null,
      editContent: '',
      saving: false,
      loadingNotes: true,
    }
  },
  watch: {
    lessonId() { this.fetchNotes() },
  },
  async created() {
    await this.fetchNotes()
  },
  methods: {
    async fetchNotes() {
      if (this.notes.length === 0) this.loadingNotes = true
      try {
        const { data } = await api.get(`/lessons/${this.lessonId}/notes`)
        this.notes = data.data || []
      } catch {
        this.notes = []
      } finally {
        this.loadingNotes = false
      }
    },
    async addNote() {
      if (!this.newContent.trim() || this.saving) return
      this.saving = true
      try {
        await api.post(`/lessons/${this.lessonId}/notes`, {
          content: this.newContent.trim(),
          timestamp_sec: Math.floor(this.currentTime),
        })
        this.newContent = ''
        await this.fetchNotes()
      } catch {
        // ignore
      } finally {
        this.saving = false
      }
    },
    startEdit(note) {
      this.editingId = note.id
      this.editContent = note.content
    },
    async updateNote(id) {
      try {
        await api.put(`/notes/${id}`, { content: this.editContent.trim() })
        this.editingId = null
        await this.fetchNotes()
      } catch {
        // ignore
      }
    },
    async deleteNote(id) {
      try {
        await api.delete(`/notes/${id}`)
        await this.fetchNotes()
      } catch {
        // ignore
      }
    },
    formatTime(seconds) {
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },
  },
}
</script>

<style scoped>
  .note-form {
    padding: 1rem;
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .timestamp-badge {
    font-size: 0.78rem;
    color: var(--color-primary);
    font-weight: 600;
  }

  .note-card {
    padding: 0.85rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    background-color: var(--color-bg);
  }

  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;
  }

  .timestamp-link {
    background: none;
    border: none;
    padding: 0.15rem 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-primary);
    background-color: var(--color-bg-secondary);
    border-radius: 4px;
    cursor: pointer;
  }

  .timestamp-link:hover {
    text-decoration: underline;
  }

  .note-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-text {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
  }

  .btn-text:hover {
    color: var(--color-primary);
  }

  .note-content {
    font-size: 0.88rem;
    color: var(--color-text);
    line-height: 1.5;
  }
</style>
