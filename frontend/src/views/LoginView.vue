<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-5">
        <div class="auth-card">
          <h2 class="auth-title">{{ $t('auth.loginTitle') }}</h2>
          <p class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</p>

          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin" novalidate>
            <div class="mb-3">
              <label for="email" class="form-label">{{ $t('auth.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                :placeholder="$t('auth.emailPlaceholder')"
                autocomplete="email"
                required
                v-focus
                @blur="validateField('email')"
              />
              <small v-if="errors.email" class="text-danger error-text">{{ errors.email }}</small>
            </div>

            <div class="mb-4">
              <label for="password" class="form-label">{{ $t('auth.password') }}</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                :placeholder="$t('auth.passwordPlaceholder')"
                autocomplete="current-password"
                required
                @blur="validateField('password')"
              />
              <small v-if="errors.password" class="text-danger error-text">{{ errors.password }}</small>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="loading || hasErrors">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('auth.login') }}
            </button>
          </form>

          <p class="auth-footer">
            {{ $t('auth.noAccount') }}
            <router-link to="/register">{{ $t('auth.registerLink') }}</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      form: { email: '', password: '' },
      errors: {},
      submitted: false,
    }
  },
  computed: {
    loading() { return useAuthStore().loading },
    error() { return useAuthStore().error },
    hasErrors() {
      return this.submitted && Object.values(this.errors).some(Boolean)
    },
  },
  created() {
    useAuthStore().error = null
  },
  methods: {
    validateField(field) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const val = this.form[field]
      let err = ''

      if (field === 'email') {
        if (!val) err = this.$t('validation.required')
        else if (!emailRegex.test(val)) err = this.$t('validation.emailInvalid')
      } else if (field === 'password') {
        if (!val) err = this.$t('validation.required')
      }

      this.errors = { ...this.errors, [field]: err }
    },
    validateAll() {
      for (const field of ['email', 'password']) {
        this.validateField(field)
      }
      return !Object.values(this.errors).some(Boolean)
    },
    async handleLogin() {
      this.submitted = true
      if (!this.validateAll()) return

      try {
        await useAuthStore().login(this.form)
        const redirect = this.$route.query.redirect || '/'
        this.$router.push(redirect)
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

  .error-text {
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
  }
</style>
