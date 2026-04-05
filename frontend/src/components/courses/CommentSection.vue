<template>
  <div class="comment-section">
    <div v-if="isAuthenticated" class="comment-form mb-3">
      <MentionInput
        v-model="newComment"
        :placeholder="$t('comments.writeComment')"
        :rows="2"
        :course-id="courseId"
        :disabled="submitting"
        @submit="postComment()"
      />
      <button class="btn btn-primary btn-sm mt-2" :disabled="!newComment.trim() || submitting" @click="postComment()">
        <span v-if="submitting && !submittingReplyTo" class="spinner-border spinner-border-sm me-1" role="status"></span>
        {{ (submitting && !submittingReplyTo) ? $t('comments.posting') : $t('comments.submit') }}
      </button>
    </div>

    <div v-if="commentNotFound" class="comment-not-found mb-3">
      {{ $t('comments.commentDeleted') }}
    </div>

    <div v-if="loading">
      <SkeletonLoader type="comment" :count="3" />
    </div>

    <div v-else-if="comments.length === 0" class="text-muted text-center py-3">
      {{ $t('comments.noComments') }}
    </div>

    <TransitionGroup name="comment-anim" tag="div">
    <div v-for="comment in comments" :key="comment.id" :id="`comment-${comment.id}`" class="comment-item" :class="{ 'comment-highlight': comment.id === scrollToComment, 'new-realtime': isNewComment(comment.id) } " @animationend="clearNewFlag(comment.id)"  >
      <div class="comment-top">
        <div class="comment-avatar">{{ (comment.username || '?').slice(0, 2).toUpperCase() }}</div>
        <div class="comment-body">
          <div class="comment-meta">
            <strong>{{ comment.username }}</strong>
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div v-if="editingId !== comment.id" class="comment-text" v-mention-highlight>{{ comment.content }}</div>
          <div v-else>
            <MentionInput v-model="editContent" :rows="2" :course-id="courseId" @submit="updateComment(comment.id)" />
            <div class="d-flex gap-2 mt-1">
              <button class="btn btn-primary btn-sm" @click="updateComment(comment.id)">{{ $t('common.save') }}</button>
              <button class="btn btn-outline-secondary btn-sm" @click="editingId = null">{{ $t('common.cancel') }}</button>
            </div>
          </div>
          <div class="comment-actions" v-if="editingId !== comment.id">
            <button v-if="isAuthenticated" class="btn-text" @click="startReply(comment)">{{ $t('comments.reply') }}</button>
            <button v-if="comment.user_id === currentUserId" class="btn-text" @click="startEdit(comment)">{{ $t('common.edit') }}</button>
            <button v-if="comment.user_id === currentUserId" class="btn-text text-danger" @click="deleteComment(comment.id)">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>

      <div v-if="comment.replies && comment.replies.length > 0" class="replies">
        <button
          v-if="comment.replies.length > 2 && !expandedThreads[comment.id]"
          class="btn-text show-more-btn"
          @click="expandedThreads[comment.id] = true"
        >{{ $t('comments.showReplies', { count: comment.replies.length }) }}</button>
        <div
          v-for="(reply, ri) in visibleReplies(comment)"
          :key="reply.id"
          :id="`comment-${reply.id}`"
          class="comment-item reply-item"
          :class="{ 'comment-highlight': reply.id === scrollToComment, 'new-realtime': isNewComment(reply.id) }"
          @animationend="clearNewFlag(reply.id)"
        >
          <div class="comment-top">
            <div class="comment-avatar sm">{{ (reply.username || '?').slice(0, 2).toUpperCase() }}</div>
            <div class="comment-body">
              <div class="comment-meta">
                <strong>{{ reply.username }}</strong>
                <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
              </div>
              <div v-if="editingId !== reply.id" class="comment-text" v-mention-highlight>{{ reply.content }}</div>
              <div v-else>
                <MentionInput v-model="editContent" :rows="2" :course-id="courseId" @submit="updateComment(reply.id)" />
                <div class="d-flex gap-2 mt-1">
                  <button class="btn btn-primary btn-sm" @click="updateComment(reply.id)">{{ $t('common.save') }}</button>
                  <button class="btn btn-outline-secondary btn-sm" @click="editingId = null">{{ $t('common.cancel') }}</button>
                </div>
              </div>
              <div class="comment-actions" v-if="editingId !== reply.id">
                <button v-if="isAuthenticated" class="btn-text" @click="startReplyToThread(comment.id, reply)">{{ $t('comments.reply') }}</button>
                <button v-if="reply.user_id === currentUserId" class="btn-text" @click="startEdit(reply)">{{ $t('common.edit') }}</button>
                <button v-if="reply.user_id === currentUserId" class="btn-text text-danger" @click="deleteComment(reply.id)">{{ $t('common.delete') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="replyingTo === comment.id" class="reply-form">
        <MentionInput v-model="replyContent" :placeholder="$t('comments.writeComment')" :rows="2" :course-id="courseId" :disabled="submitting" @submit="postComment(comment.id)" />
        <div class="d-flex gap-2 mt-1">
          <button class="btn btn-primary btn-sm" :disabled="!replyContent.trim() || submitting" @click="postComment(comment.id)">
            <span v-if="submittingReplyTo === comment.id" class="spinner-border spinner-border-sm me-1" role="status"></span>
            {{ submittingReplyTo === comment.id ? $t('comments.posting') : $t('comments.submit') }}
          </button>
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
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useRealtimeComments } from '@/composables/useRealtimeComments'
import { ref, toRef } from 'vue'

export default {
  name: 'CommentSection',
  components: { MentionInput, SkeletonLoader },
  props: {
    lessonId: { type: String, required: true },
    courseId: { type: String, default: '' },
    instructorId: { type: String, default: '' },
    instructorName: { type: String, default: '' },
    scrollToComment: { type: String, default: '' },
  },
  setup(props) {
    const lessonIdRef = toRef(props, 'lessonId')
    const fetchRef = ref(null)

    const { realtimeEnabled, isNewComment, clearNewFlag } = useRealtimeComments(
      lessonIdRef,
      () => { if (fetchRef.value) fetchRef.value() }
    )

    return { realtimeEnabled, isNewComment, clearNewFlag, fetchRef }
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
      submittingReplyTo: null,
      busy: false,
      commentNotFound: false,
      expandedThreads: {},
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
    if (this.scrollToComment) {
      this.$nextTick(() => {
        const el = document.getElementById(`comment-${this.scrollToComment}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          this.commentNotFound = true
        }
      })
    }
  },
  methods: {
    async fetchComments(page = 1) {
      if (this.comments.length === 0) this.loading = true
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
      const content = parentId ? this.replyContent : this.newComment
      if (!content.trim() || this.submitting || this.busy) return
      this.submitting = true
      this.submittingReplyTo = parentId
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
        this.submittingReplyTo = null
      }
    },
    visibleReplies(comment) {
      if (!comment.replies) return []
      if (comment.replies.length <= 2 || this.expandedThreads[comment.id]) return comment.replies
      return comment.replies.slice(-2)
    },
    startReplyToThread(parentCommentId, reply) {
      this.replyingTo = parentCommentId
      if (reply.user_id !== this.currentUserId) {
        this.replyContent = `@[${reply.username}] `
      } else {
        this.replyContent = ''
      }
    },
    startReply(comment) {
      this.replyingTo = comment.id
      if (comment.user_id !== this.currentUserId) {
        this.replyContent = `@[${comment.username}] `
      } else {
        this.replyContent = ''
      }
    },
    startEdit(comment) {
      this.editingId = comment.id
      this.editContent = comment.content
    },
    async updateComment(id) {
      if (this.busy) return
      this.busy = true
      try {
        await api.put(`/comments/${id}`, { content: this.editContent })
        this.editingId = null
        await this.fetchComments()
      } catch {
        // ignore
      } finally {
        this.busy = false
      }
    },
    async deleteComment(id) {
      if (this.busy) return
      this.busy = true
      try {
        await api.delete(`/comments/${id}`)
        await this.fetchComments()
      } catch {
        // ignore
      } finally {
        this.busy = false
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

  .show-more-btn {
    font-size: 0.8rem;
    color: var(--color-primary);
    padding: 0.4rem 0;
    display: block;
  }

  .reply-form {
    margin-left: 2.5rem;
    margin-top: 0.5rem;
  }

  .comment-not-found {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    text-align: center;
  }

  .comment-highlight {
    background-color: rgba(4, 102, 200, 0.08);
    border-left: 3px solid var(--color-primary);
    animation: highlight-fade 3s ease forwards;
  }

  @keyframes highlight-fade {
    0%, 70% { background-color: rgba(4, 102, 200, 0.08); }
    100% { background-color: transparent; }
  }

  .new-realtime {
    border-left: 3px solid #28a745;
    background-color: rgba(40, 167, 69, 0.08);
    animation: realtime-fade 3s ease forwards;
  }

  @keyframes realtime-fade {
    0%, 60% { background-color: rgba(40, 167, 69, 0.08); }
    100% { background-color: transparent; border-left-color: transparent; }
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
