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
              <div class="d-flex gap-3">
                <div class="form-check">
                  <input
                    id="roleStudent"
                    v-model="form.role"
                    type="radio"
                    class="form-check-input"
                    value="student"
                  />
                  <label for="roleStudent" class="form-check-label">{{ $t('auth.student') }}</label>
                </div>
                <div class="form-check">
                  <input
                    id="roleInstructor"
                    v-model="form.role"
                    type="radio"
                    class="form-check-input"
                    value="instructor"
                  />
                  <label for="roleInstructor" class="form-check-label">{{ $t('auth.instructor') }}</label>
                </div>
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

  .auth-footer {
    text-align: center;
    margin-top: 1.5rem;
    margin-bottom: 0;
    font-size: 0.9rem;
    color: var(--color-text-light);
  }
</style>
