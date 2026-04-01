<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-5">
        <div class="auth-card">
          <h2 class="auth-title">{{ $t('auth.registerTitle') }}</h2>
          <p class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</p>

          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <form @submit.prevent="handleRegister" novalidate>
            <div class="mb-3">
              <label for="username" class="form-label">{{ $t('auth.username') }}</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': submitted && !form.username }"
                :placeholder="$t('auth.usernamePlaceholder')"
                autocomplete="username"
                required
              />
              <div class="invalid-feedback">{{ $t('auth.usernameRequired') }}</div>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">{{ $t('auth.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': submitted && !form.email }"
                :placeholder="$t('auth.emailPlaceholder')"
                autocomplete="email"
                required
              />
              <div class="invalid-feedback">{{ $t('auth.emailRequired') }}</div>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">{{ $t('auth.password') }}</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': submitted && passwordError }"
                :placeholder="$t('auth.passwordPlaceholder')"
                autocomplete="new-password"
                required
              />
              <div class="invalid-feedback">{{ passwordError }}</div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': submitted && confirmError }"
                :placeholder="$t('auth.confirmPasswordPlaceholder')"
                autocomplete="new-password"
                required
              />
              <div class="invalid-feedback">{{ confirmError }}</div>
            </div>

            <div class="mb-4">
              <label class="form-label">{{ $t('auth.role') }}</label>
              <div class="role-selector">
                <button
                  type="button"
                  class="role-option"
                  :class="{ active: form.role === 'student' }"
                  @click="form.role = 'student'"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>{{ $t('auth.student') }}</span>
                </button>
                <button
                  type="button"
                  class="role-option"
                  :class="{ active: form.role === 'instructor' }"
                  @click="form.role = 'instructor'"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>{{ $t('auth.instructor') }}</span>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('auth.register') }}
            </button>
          </form>

          <p class="auth-footer">
            {{ $t('auth.hasAccount') }}
            <router-link to="/login">{{ $t('auth.loginLink') }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
      },
      submitted: false,
    }
  },
  created() {
    useAuthStore().error = null
  },
  computed: {
    loading() { return useAuthStore().loading },
    error() { return useAuthStore().error },
    passwordError() {
      if (!this.form.password) return this.$t('auth.passwordRequired')
      if (this.form.password.length < 6) return this.$t('auth.passwordMin')
      return null
    },
    confirmError() {
      if (!this.form.confirmPassword) return this.$t('auth.confirmRequired')
      if (this.form.password !== this.form.confirmPassword) return this.$t('auth.passwordMismatch')
      return null
    },
  },
  methods: {
    async handleRegister() {
      this.submitted = true
      if (!this.form.username || !this.form.email || this.passwordError || this.confirmError) return

      try {
        await useAuthStore().register({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password,
          role: this.form.role,
        })
        this.$router.push('/')
      } catch {
        // error is handled in store
      }
    },
  },
}
</script>

<style scoped>
  .auth-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: var(--shadow-sm);
    margin-top: 28px;
  }

  .auth-title {
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .auth-subtitle {
    color: var(--color-text-light);
    margin-bottom: 1.75rem;
    font-size: 0.95rem;
  }

  .btn-primary {
    font-weight: 700;
    font-size: 0.95rem;
    border: 2px solid var(--color-primary);
    border-radius: 4px;
    letter-spacing: 0.02em;
    padding: 0.5rem 1rem;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .btn-primary:disabled {
    opacity: 0.65;
    border-color: var(--color-primary);
  }

  .role-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .role-option {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border: 2px solid var(--color-border-input);
    border-radius: 8px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s, color 0.15s;
  }

  .role-option:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .role-option.active {
    border-color: var(--color-primary);
    background-color: var(--color-primary);
    color: #fff;
  }

  .auth-footer {
    text-align: center;
    margin-top: 1.5rem;
    margin-bottom: 0;
    font-size: 0.9rem;
    color: var(--color-text-light);
  }
</style>
