<template>
  <div class="comment-section">
    <div v-if="realtimeEnabled" class="realtime-bar mb-3">
      <span class="realtime-dot"></span>
      <span class="realtime-text">Live</span>
      <span v-if="onlineUsers > 0" class="realtime-users">{{ onlineUsers }} viewing</span>
    </div>

    <div v-if="isAuthenticated" class="comment-form mb-3">
      <MentionInput
        v-model="newComment"
        :placeholder="$t('comments.writeComment')"
        :rows="2"
      />
      <button class="btn btn-primary btn-sm mt-2" :disabled="!newComment.trim() || submitting" @click="postComment()">
        {{ $t('comments.submit') }}
      </button>
    </div>

    <div v-if="comments.length === 0 && !loading" class="text-muted text-center py-3">
      {{ $t('comments.noComments') }}
    </div>

    <TransitionGroup name="comment-anim" tag="div">
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <div class="comment-top">
        <div class="comment-avatar">{{ (comment.username || '?').slice(0, 2).toUpperCase() }}</div>
        <div class="comment-body">
          <div class="comment-meta">
            <strong>{{ comment.username }}</strong>
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div v-if="editingId !== comment.id" class="comment-text" v-mention-highlight>{{ comment.content }}</div>
          <div v-else>
            <MentionInput v-model="editContent" :rows="2" />
            <div class="d-flex gap-2 mt-1">
              <button class="btn btn-primary btn-sm" @click="updateComment(comment.id)">{{ $t('common.save') }}</button>
              <button class="btn btn-outline-secondary btn-sm" @click="editingId = null">{{ $t('common.cancel') }}</button>
            </div>
          </div>
          <div class="comment-actions" v-if="editingId !== comment.id">
            <button v-if="isAuthenticated" class="btn-text" @click="startReply(comment.id)">{{ $t('comments.reply') }}</button>
            <button v-if="comment.user_id === currentUserId" class="btn-text" @click="startEdit(comment)">{{ $t('common.edit') }}</button>
            <button v-if="comment.user_id === currentUserId" class="btn-text text-danger" @click="deleteComment(comment.id)">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>

      <div v-if="comment.replies && comment.replies.length > 0" class="replies">
        <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply-item">
          <div class="comment-top">
            <div class="comment-avatar sm">{{ (reply.username || '?').slice(0, 2).toUpperCase() }}</div>
            <div class="comment-body">
              <div class="comment-meta">
                <strong>{{ reply.username }}</strong>
                <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
              </div>
              <div class="comment-text" v-mention-highlight>{{ reply.content }}</div>
              <div class="comment-actions">
                <button v-if="reply.user_id === currentUserId" class="btn-text" @click="startEdit(reply)">{{ $t('common.edit') }}</button>
                <button v-if="reply.user_id === currentUserId" class="btn-text text-danger" @click="deleteComment(reply.id)">{{ $t('common.delete') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="replyingTo === comment.id" class="reply-form">
        <MentionInput v-model="replyContent" :placeholder="$t('comments.writeComment')" :rows="2" />
        <div class="d-flex gap-2 mt-1">
          <button class="btn btn-primary btn-sm" :disabled="!replyContent.trim()" @click="postComment(comment.id)">{{ $t('comments.submit') }}</button>
          <button class="btn btn-outline-secondary btn-sm" @click="replyingTo = null">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    </TransitionGroup>

    <div v-if="pagination.page < pagination.pages" class="text-center mt-3">
      <button class="btn btn-outline-primary btn-sm" @click="loadMore">{{ $t('comments.loadMore') }}</button>
    </div>
  </div>
</template>

<script>
import MentionInput from '@/components/common/MentionInput.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useRealtimeComments } from '@/composables/useRealtimeComments'
import { ref, toRef } from 'vue'

export default {
  name: 'CommentSection',
  components: { MentionInput },
  props: {
    lessonId: { type: String, required: true },
  },
  setup(props) {
    const lessonIdRef = toRef(props, 'lessonId')
    const fetchRef = ref(null)
    const { realtimeEnabled, onlineUsers, isNewComment, clearNewFlag } = useRealtimeComments(
      lessonIdRef,
      () => { if (fetchRef.value) fetchRef.value() }
    )
    return { realtimeEnabled, onlineUsers, isNewComment, clearNewFlag, fetchRef }
  },
  data() {
    return {
      comments: [],
      pagination: { page: 1, pages: 1 },
      newComment: '',
      replyingTo: null,
      replyContent: '',
      editingId: null,
      editContent: '',
      submitting: false,
      loading: false,
    }
  },
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
    currentUserId() { return useAuthStore().user?.id },
  },
  watch: {
    lessonId() { this.fetchComments() },
  },
  async created() {
    this.fetchRef = () => this.fetchComments()
    await this.fetchComments()
  },
  methods: {
    async fetchComments(page = 1) {
      this.loading = true
      try {
        const { data } = await api.get(`/lessons/${this.lessonId}/comments?page=${page}`)
        if (page === 1) {
          this.comments = data.data.comments
        } else {
          this.comments = [...this.comments, ...data.data.comments]
        }
        this.pagination = data.data.pagination
      } catch {
        // ignore
      } finally {
        this.loading = false
      }
    },
    async postComment(parentId = null) {
      this.submitting = true
      const content = parentId ? this.replyContent : this.newComment
      try {
        await api.post(`/lessons/${this.lessonId}/comments`, {
          content,
          parent_id: parentId,
        })
        if (parentId) {
          this.replyContent = ''
          this.replyingTo = null
        } else {
          this.newComment = ''
        }
        await this.fetchComments()
      } catch {
        // ignore
      } finally {
        this.submitting = false
      }
    },
    startReply(commentId) {
      this.replyingTo = commentId
      this.replyContent = ''
    },
    startEdit(comment) {
      this.editingId = comment.id
      this.editContent = comment.content
    },
    async updateComment(id) {
      try {
        await api.put(`/comments/${id}`, { content: this.editContent })
        this.editingId = null
        await this.fetchComments()
      } catch {
        // ignore
      }
    },
    async deleteComment(id) {
      try {
        await api.delete(`/comments/${id}`)
        await this.fetchComments()
      } catch {
        // ignore
      }
    },
    loadMore() {
      this.fetchComments(this.pagination.page + 1)
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
  },
}
</script>

<style scoped>
  .comment-form {
    padding: 1rem;
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .comment-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .comment-item:last-child {
    border-bottom: none;
  }

  .comment-top {
    display: flex;
    gap: 0.75rem;
  }

  .comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-light);
  }

  .comment-avatar.sm {
    width: 26px;
    height: 26px;
    font-size: 0.6rem;
  }

  .comment-body {
    flex: 1;
    min-width: 0;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .comment-meta strong {
    font-size: 0.85rem;
  }

  .comment-date {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .comment-text {
    font-size: 0.88rem;
    color: var(--color-text);
    line-height: 1.5;
    word-break: break-word;
  }

  .comment-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.3rem;
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

  .replies {
    margin-left: 2.5rem;
    border-left: 2px solid var(--color-border);
    padding-left: 0.75rem;
  }

  .reply-item {
    border-bottom: none;
    padding: 0.5rem 0;
  }

  .reply-form {
    margin-left: 2.5rem;
    margin-top: 0.5rem;
  }

  .realtime-bar {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: var(--color-text-muted);
  }

  .realtime-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #28a745;
    animation: pulse-dot 2s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .realtime-text {
    font-weight: 600;
    color: #28a745;
  }

  .realtime-users {
    color: var(--color-text-muted);
  }

  .comment-anim-enter-active {
    transition: all 0.3s ease;
  }

  .comment-anim-leave-active {
    transition: all 0.2s ease;
  }

  .comment-anim-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .comment-anim-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }

  .comment-anim-move {
    transition: transform 0.3s ease;
  }
</style>
