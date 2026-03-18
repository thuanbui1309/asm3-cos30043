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
        <ul class="navbar-nav me-auto">
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
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/settings">{{ $t('nav.settings') }}</router-link>
          </li>
          <template v-if="isAuthenticated">
            <li class="nav-item">
              <router-link class="nav-link" to="/profile">{{ $t('nav.profile') }}</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="handleLogout">{{ $t('nav.logout') }}</a>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/login">{{ $t('nav.login') }}</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link nav-register" to="/register">{{ $t('nav.register') }}</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NavBar',
  computed: {
    isAuthenticated() { return useAuthStore().isAuthenticated },
  },
  methods: {
    handleLogout() {
      useAuthStore().logout()
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
  .navbar {
    padding: 0.65rem 0;
    z-index: 1030;
  }

  .navbar-solid {
    background-color: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  [data-theme="dark"] .navbar-solid {
    background-color: rgba(25, 25, 25, 0.98);
  }

  .navbar-brand {
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--color-text) !important;
  }

  .nav-link {
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--color-text-light) !important;
    padding: 0.5rem 0.75rem !important;
    transition: color 0.15s ease;
    margin: 0 0.15rem;
    text-decoration: none;
  }

  .nav-link:hover,
  .nav-link.router-link-active {
    color: var(--color-primary) !important;
    text-decoration: none;
  }

  .nav-register {
    background-color: var(--color-primary);
    color: #fff !important;
    border-radius: 6px;
    padding: 0.4rem 1rem !important;
    margin-left: 0.25rem;
  }

  .nav-register:hover {
    background-color: var(--color-primary-dark);
    color: #fff !important;
  }
</style>
