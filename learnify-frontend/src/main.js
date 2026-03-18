import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'

import { vFocus, vTooltip } from './directives'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/styles/main.css'

import en from './locales/en.json'
import vi from './locales/vi.json'

const savedLocale = localStorage.getItem('locale') || 'en'
const savedTheme = localStorage.getItem('theme') || (
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
)

document.documentElement.setAttribute('data-theme', savedTheme)

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, vi },
})

const app = createApp(App)
app.directive('focus', vFocus)
app.directive('tooltip', vTooltip)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
