<template>
  <div class="notif-wrap" v-if="isAuthenticated">
    <button class="notif-btn" @click="toggleDropdown" :aria-label="$t('notifications.title')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <div v-if="showDropdown" class="notif-dropdown">
      <div class="notif-header">
        <span class="notif-title">{{ $t('notifications.title') }}</span>
      </div>
      <div class="notif-list">
        <div v-if="loadingList" class="notif-loading">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
        <div v-else-if="notifications.length === 0" class="notif-empty">
          {{ $t('notifications.noNotifications') }}
        </div>
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notif-item"
          :class="{ unread: !notif.is_read }"
          @click="handleClick(notif)"
        >
          <div class="notif-message">{{ notif.message.split('|')[0] }}</div>
          <div class="notif-date">{{ formatDate(notif.created_at) }}</div>
        </div>
      </div>
      <div class="notif-footer">
        <router-link to="/notifications" class="notif-see-all" @click="showDropdown = false">
          {{ $t('notifications.seeAll') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NotificationBell',
  data() {
    return {
      unreadCount: 0,
      notifications: [],
      showDropdown: false,
      pollInterval: null,
      loadingList: false,
    }
  },
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
  },
  watch: {
    isAuthenticated(val) {
      if (val) this.startPolling()
      else this.stopPolling()
    },
  },
  mounted() {
    if (this.isAuthenticated) this.startPolling()
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    this.stopPolling()
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    startPolling() {
      this.fetchUnreadCount()
      this.pollInterval = setInterval(() => this.fetchUnreadCount(), 30000)
    },
    stopPolling() {
      if (this.pollInterval) clearInterval(this.pollInterval)
    },
    async fetchUnreadCount() {
      try {
        const { data } = await api.get('/notifications/unread-count')
        this.unreadCount = data.data.count
      } catch {
        // ignore
      }
    },
    async fetchNotifications() {
      this.loadingList = true
      try {
        const { data } = await api.get('/notifications?limit=5')
        this.notifications = data.data || []
      } catch {
        // ignore
      } finally {
        this.loadingList = false
      }
    },
    async toggleDropdown() {
      this.showDropdown = !this.showDropdown
      if (this.showDropdown) {
        await this.fetchNotifications()
      }
    },
    handleClick(notif) {
      if (!notif.is_read) {
        api.put(`/notifications/${notif.id}/read`).catch(() => {})
        notif.is_read = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
      this.showDropdown = false
      const parts = notif.message.split('|')
      const courseId = parts[2] || null
      const commentId = notif.reference_id || null
      if (courseId) {
        this.$router.push(`/courses/${courseId}/learn?tab=discussion${commentId ? '&comment=' + commentId : ''}`)
      }
    },
    handleOutsideClick(e) {
      if (!this.$el.contains(e.target)) {
        this.showDropdown = false
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
  },
}
</script>

<style scoped>
  .notif-wrap {
    position: relative;
  }

  .notif-btn {
    position: relative;
    background: none;
    border: none;
    color: var(--color-text-light);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
  }

  .notif-btn:hover {
    color: var(--color-text);
  }

  .notif-badge {
    position: absolute;
    top: -4px;
    right: -6px;
    background: #dc3545;
    color: #fff;
    font-size: 0.6rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }

  .notif-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 320px;
    background: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    z-index: 1040;
    margin-top: 8px;
    overflow: hidden;
  }

  .notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .notif-title {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .btn-text {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--color-primary);
    cursor: pointer;
  }

  .notif-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .notif-loading {
    padding: 2rem 1rem;
    text-align: center;
  }

  .notif-empty {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.88rem;
  }

  .notif-item {
    padding: 0.65rem 1rem;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .notif-item:last-child {
    border-bottom: none;
  }

  .notif-item:hover {
    background-color: var(--color-bg-hover);
  }

  .notif-item.unread {
    background-color: rgba(4, 102, 200, 0.04);
  }

  .notif-message {
    font-size: 0.85rem;
    color: var(--color-text);
    line-height: 1.4;
  }

  .notif-date {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    margin-top: 0.15rem;
  }

  .notif-footer {
    padding: 0.6rem 1rem;
    border-top: 1px solid var(--color-border);
    text-align: center;
  }

  .notif-see-all {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;
  }

  .notif-see-all:hover {
    text-decoration: underline;
  }
</style>
