import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isInstructor: (state) => state.user?.role === 'instructor',
    isStudent: (state) => state.user?.role === 'student',
  },

  actions: {
    async register({ username, email, password, role }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/register', { username, email, password, role })
        this.token = data.data.token
        this.user = data.data.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        return data.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Registration failed'
        throw this.error
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.data.token
        this.user = data.data.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        return data.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed'
        throw this.error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.token) return
      try {
        const { data } = await api.get('/auth/me')
        this.user = data.data
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
