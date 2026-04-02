<template>
  <div class="container py-4">
    <h2 class="mb-4">{{ $t('settings.title') }}</h2>

    <div class="row">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card p-4 mb-4">
          <h5 class="mb-3">{{ $t('settings.language') }}</h5>

          <div>
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
  computed: {
    currentLocale() {
      return this.$i18n.locale
    },
  },
  methods: {
    setLocale(locale) {
      this.$i18n.locale = locale
      localStorage.setItem('locale', locale)
    },
  },
}
</script>
