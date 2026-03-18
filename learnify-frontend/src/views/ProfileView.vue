<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <h2 class="mb-4">{{ $t('profile.title') }}</h2>

        <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
        <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

        <div class="profile-card mb-4">
          <div class="profile-header">
            <div class="profile-avatar">{{ avatarInitial }}</div>
            <div>
              <h5 class="mb-0">{{ user?.username }}</h5>
              <span class="badge" :class="user?.role === 'instructor' ? 'bg-primary' : 'bg-success'">
                {{ user?.role }}
              </span>
            </div>
          </div>
        </div>

        <div class="profile-card">
          <h5 class="mb-3">{{ $t('profile.editInfo') }}</h5>
          <form @submit.prevent="handleUpdate" novalidate>
            <div class="mb-3">
              <label for="username" class="form-label">{{ $t('auth.username') }}</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': submitted && !form.username }"
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
                required
              />
              <div class="invalid-feedback">{{ $t('auth.emailRequired') }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('profile.memberSince') }}</label>
              <p class="text-muted mb-0">{{ formatDate(user?.created_at) }}</p>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('profile.save') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export default {
  name: 'ProfileView',
  data() {
    return {
      form: { username: '', email: '' },
      submitted: false,
      saving: false,
      successMsg: '',
      errorMsg: '',
    }
  },
  computed: {
    user() { return useAuthStore().user },
    avatarInitial() {
      return this.user?.username?.charAt(0).toUpperCase() || '?'
    },
  },
  created() {
    if (this.user) {
      this.form.username = this.user.username
      this.form.email = this.user.email
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString()
    },
    async handleUpdate() {
      this.submitted = true
      this.successMsg = ''
      this.errorMsg = ''
      if (!this.form.username || !this.form.email) return

      this.saving = true
      try {
        await api.put('/auth/me', this.form)
        const authStore = useAuthStore()
        authStore.user = { ...authStore.user, ...this.form }
        localStorage.setItem('user', JSON.stringify(authStore.user))
        this.successMsg = this.$t('profile.updated')
      } catch (err) {
        this.errorMsg = err.response?.data?.error || 'Update failed'
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
  .profile-card {
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
