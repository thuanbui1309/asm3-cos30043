<template>
  <div class="container py-4">
    <h2 class="mb-4">{{ $t('settings.title') }}</h2>

    <div class="row">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card p-4 mb-4">
          <h5 class="mb-3">{{ $t('settings.appearance') }}</h5>

          <div class="mb-4">
            <label class="form-label">{{ $t('settings.theme') }}</label>
            <div class="d-flex gap-2">
              <button
                class="btn"
                :class="isDark ? 'btn-outline-secondary' : 'btn-primary'"
                @click="setTheme('light')"
              >
                {{ $t('settings.light') }}
              </button>
              <button
                class="btn"
                :class="isDark ? 'btn-primary' : 'btn-outline-secondary'"
                @click="setTheme('dark')"
              >
                {{ $t('settings.dark') }}
              </button>
            </div>
          </div>

          <div>
            <label class="form-label">{{ $t('settings.language') }}</label>
            <div class="d-flex gap-2">
              <button
                class="btn"
                :class="currentLocale === 'en' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="setLocale('en')"
              >
                {{ $t('settings.english') }}
              </button>
              <button
                class="btn"
                :class="currentLocale === 'vi' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="setLocale('vi')"
              >
                {{ $t('settings.vietnamese') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsView',
  data() {
    return {
      isDark: document.documentElement.getAttribute('data-theme') === 'dark',
    }
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale
    },
  },
  methods: {
    setTheme(theme) {
      this.isDark = theme === 'dark'
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    },
    setLocale(locale) {
      this.$i18n.locale = locale
      localStorage.setItem('locale', locale)
    },
  },
}
</script>
