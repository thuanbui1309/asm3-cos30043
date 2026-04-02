<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">{{ $t('notifications.title') }}</h2>
          <button v-if="notifications.some(n => !n.is_read)" class="btn btn-outline-primary btn-sm" @click="markAllRead">
            {{ $t('notifications.markAllRead') }}
          </button>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <template v-else>
          <div v-if="notifications.length === 0" class="empty-state">
            <p class="text-muted">{{ $t('notifications.noNotifications') }}</p>
          </div>

          <div v-else class="notif-list-page">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="notif-row"
              :class="{ unread: !notif.is_read }"
              @click="handleClick(notif)"
            >
              <div class="notif-dot" v-if="!notif.is_read"></div>
              <div class="notif-content">
                <div class="notif-message">{{ notif.message.split('|')[0] }}</div>
                <div class="notif-date">{{ formatDate(notif.created_at) }}</div>
              </div>
              <button
                class="notif-toggle"
                @click.stop="toggleRead(notif)"
                :title="notif.is_read ? 'Mark unread' : 'Mark read'"
              >
                <svg v-if="notif.is_read" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="var(--color-primary)" stroke="none"><circle cx="12" cy="12" r="5"/></svg>
              </button>
            </div>
          </div>

          <div v-if="hasMore" class="text-center mt-3">
            <button class="btn btn-outline-primary btn-sm" @click="loadMore">{{ $t('comments.loadMore') }}</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'NotificationsView',
  data() {
    return {
      notifications: [],
      loading: true,
      page: 1,
      hasMore: false,
    }
  },
  async created() {
    await this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      this.loading = this.page === 1
      try {
        const { data } = await api.get(`/notifications?page=${this.page}&limit=20`)
        const items = data.data || []
        if (this.page === 1) {
          this.notifications = items
        } else {
          this.notifications = [...this.notifications, ...items]
        }
        this.hasMore = items.length === 20
      } catch {
        // ignore
      } finally {
        this.loading = false
      }
    },
    handleClick(notif) {
      if (!notif.is_read) {
        this.markRead(notif)
      }
      const parts = notif.message.split('|')
      const courseId = parts[2] || null
      const commentId = notif.reference_id || null
      if (courseId) {
        this.$router.push(`/courses/${courseId}/learn?tab=discussion${commentId ? '&comment=' + commentId : ''}`)
      }
    },
    async markRead(notif) {
      try {
        await api.put(`/notifications/${notif.id}/read`)
        notif.is_read = true
      } catch {
        // ignore
      }
    },
    async toggleRead(notif) {
      if (notif.is_read) {
        notif.is_read = false
      } else {
        await this.markRead(notif)
      }
    },
    async markAllRead() {
      try {
        await api.put('/notifications/read-all')
        this.notifications.forEach((n) => { n.is_read = true })
      } catch {
        // ignore
      }
    },
    loadMore() {
      this.page++
      this.fetchNotifications()
    },
    formatDate(dateStr) {
      const d = new Date(dateStr)
      const now = new Date()
      const diff = now - d
      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return d.toLocaleDateString()
    },
  },
}
</script>

<style scoped>
  .empty-state {
    text-align: center;
    padding: 4rem 0;
  }

  .notif-list-page {
    border: 1.5px solid var(--color-border-strong);
    border-radius: 12px;
    overflow: hidden;
  }

  .notif-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .notif-row:last-child {
    border-bottom: none;
  }

  .notif-row:hover {
    background-color: var(--color-bg-hover);
  }

  .notif-row.unread {
    background-color: rgba(4, 102, 200, 0.04);
  }

  .notif-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--color-primary);
    flex-shrink: 0;
  }

  .notif-content {
    flex: 1;
    min-width: 0;
  }

  .notif-message {
    font-size: 0.9rem;
    color: var(--color-text);
    line-height: 1.4;
  }

  .notif-date {
    font-size: 0.78rem;
    color: var(--color-text-muted);
    margin-top: 0.15rem;
  }

  .notif-toggle {
    background: none;
    border: none;
    padding: 0.25rem;
    color: var(--color-text-muted);
    cursor: pointer;
    flex-shrink: 0;
  }

  .notif-toggle:hover {
    color: var(--color-primary);
  }
</style>
