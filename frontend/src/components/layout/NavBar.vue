<template>
  <nav class="navbar navbar-expand-md fixed-top navbar-solid">
    <div class="container">
      <router-link class="navbar-brand" to="/">Learnify</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto nav-left" ref="navLeft">
          <li class="nav-item">
            <router-link class="nav-link" to="/">{{ $t('nav.home') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/courses">{{ $t('nav.courses') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/news">{{ $t('nav.news') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">{{ $t('nav.about') }}</router-link>
          </li>
          <span class="nav-indicator" :style="indicatorStyle"></span>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <template v-if="isAuthenticated">
            <NotificationBell />
            <button class="btn-lang" @click="showLangModal = true" :aria-label="$t('nav.language')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
              </svg>
            </button>
            <div class="dropdown">
              <button class="avatar-btn" data-bs-toggle="dropdown" aria-expanded="false" :aria-label="$t('nav.account')">
                {{ userInitials }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li class="dropdown-header">{{ userName }}</li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <router-link class="dropdown-item" to="/my-courses">{{ $t('nav.myCourses') }}</router-link>
                </li>
                <li v-if="isInstructor">
                  <router-link class="dropdown-item" to="/courses/create">{{ $t('courses.createCourse') }}</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/notifications">{{ $t('notifications.title') }}</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/profile">{{ $t('nav.profile') }}</router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">{{ $t('nav.logout') }}</a>
                </li>
              </ul>
            </div>
          </template>

          <template v-else>
            <router-link class="btn-login" to="/login">{{ $t('nav.login') }}</router-link>
            <router-link class="btn-register" to="/register">{{ $t('nav.register') }}</router-link>
            <button class="btn-lang" @click="showLangModal = true" :aria-label="$t('nav.language')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
              </svg>
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <div v-if="showLangModal" class="lang-modal-backdrop" @click.self="showLangModal = false">
      <div class="lang-modal" role="dialog" aria-modal="true" :aria-label="$t('nav.language')">
        <div class="lang-modal-header">
          <span class="lang-modal-title">{{ $t('settings.language') }}</span>
          <button class="lang-modal-close" @click="showLangModal = false" aria-label="Close">&times;</button>
        </div>
        <div class="lang-modal-body">
          <button
            class="lang-option"
            :class="{ active: currentLocale === 'en' }"
            @click="setLocale('en')"
          >
            {{ $t('settings.english') }}
          </button>
          <button
            class="lang-option"
            :class="{ active: currentLocale === 'vi' }"
            @click="setLocale('vi')"
          >
            {{ $t('settings.vietnamese') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/common/NotificationBell.vue'

export default {
  name: 'NavBar',
  components: { NotificationBell },
  data() {
    return {
      showLangModal: false,
      indicatorStyle: { left: '0px', width: '0px', opacity: 0 },
    }
  },
  watch: {
    $route() {
      this.$nextTick(() => this.updateIndicator())
    },
  },
  mounted() {
    this.$nextTick(() => this.updateIndicator())
  },
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
    isInstructor() { return useAuthStore().isInstructor },
    userName() { return useAuthStore().user?.username || '' },
    userInitials() {
      const name = useAuthStore().user?.username || ''
      return name.slice(0, 2).toUpperCase()
    },
    currentLocale() { return this.$i18n.locale },
  },
  methods: {
    handleLogout() {
      useAuthStore().logout()
      this.$router.push('/')
    },
    setLocale(locale) {
      this.$i18n.locale = locale
      localStorage.setItem('locale', locale)
      this.showLangModal = false
    },
    updateIndicator() {
      const nav = this.$refs.navLeft
      if (!nav) return
      const active = nav.querySelector('.router-link-active')
      if (!active) {
        this.indicatorStyle = { ...this.indicatorStyle, opacity: 0 }
        return
      }
      const navRect = nav.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      this.indicatorStyle = {
        left: `${activeRect.left - navRect.left}px`,
        width: `${activeRect.width}px`,
        opacity: 1,
      }
    },
  },
}
</script>

<style scoped>
  .navbar {
    padding: 0;
    height: 56px;
    z-index: 1030;
  }

  .navbar-solid {
    background-color: #fff;
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .navbar-brand {
    font-weight: 700;
    font-size: 1.3rem;
    color: var(--color-text) !important;
    text-decoration: none !important;
  }

  .navbar-brand:hover {
    text-decoration: none !important;
    color: var(--color-text) !important;
  }

  .nav-link {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text) !important;
    padding: 0.375rem 0.75rem !important;
    transition: color 0.15s ease;
    text-decoration: none;
    letter-spacing: 0.01em;
  }

  .nav-link:hover {
    color: var(--color-primary) !important;
  }

  .nav-link.router-link-active {
    color: var(--color-primary) !important;
  }

  .nav-left {
    position: relative;
  }

  .nav-indicator {
    position: absolute;
    bottom: 0;
    height: 2px;
    background-color: var(--color-primary);
    border-radius: 1px;
    pointer-events: none;
    transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
  }

  .btn-login {
    display: inline-block;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-primary);
    background: transparent;
    border: 2px solid var(--color-primary);
    border-radius: 4px;
    padding: 0.35rem 1rem;
    text-decoration: none;
    line-height: 1.5;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .btn-login:hover {
    background-color: rgba(4, 102, 200, 0.06);
    color: var(--color-primary);
  }

  .btn-register {
    display: inline-block;
    font-weight: 700;
    font-size: 0.9rem;
    background-color: var(--color-primary);
    color: #fff;
    border: 2px solid var(--color-primary);
    border-radius: 4px;
    padding: 0.35rem 1rem;
    text-decoration: none;
    line-height: 1.5;
    transition: background-color 0.15s ease;
  }

  .btn-register:hover {
    background-color: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: #fff;
  }

  .btn-lang {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: var(--color-text-light);
    background: transparent;
    border: 2px solid var(--color-text-light);
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .btn-lang:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  .avatar-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: opacity 0.15s ease;
  }

  .avatar-btn:hover {
    opacity: 0.88;
  }

  .dropdown-menu {
    min-width: 180px;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    border-radius: 6px;
    padding: 4px 0;
  }

  .dropdown-header {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    padding: 6px 16px;
  }

  .dropdown-item {
    font-size: 0.9rem;
    color: var(--color-text);
    padding: 8px 16px;
    text-decoration: none;
  }

  .dropdown-item:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text);
  }

  .dropdown-item.text-danger:hover {
    background-color: #fff5f5;
    color: #dc3545;
  }

  /* Language Modal */
  .lang-modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lang-modal {
    background: #fff;
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    width: 280px;
    overflow: hidden;
  }

  .lang-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .lang-modal-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text);
  }

  .lang-modal-close {
    border: none;
    background: transparent;
    font-size: 1.3rem;
    line-height: 1;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0 4px;
  }

  .lang-modal-close:hover {
    color: var(--color-text);
  }

  .lang-modal-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .lang-option {
    width: 100%;
    text-align: center;
    padding: 0.45rem 1rem;
    border: 2px solid var(--color-border-input);
    border-radius: 4px;
    background: transparent;
    color: var(--color-text);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .lang-option:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background-color: rgba(4, 102, 200, 0.04);
  }

  .lang-option.active {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    color: #fff;
  }

  .lang-option.active:hover {
    background-color: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
  }
</style>
