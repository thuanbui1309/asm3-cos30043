<template>
  <div class="app-wrapper">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <FooterBar v-if="!isLearnPage" />
  </div>
</template>

<script>
import NavBar from '@/components/layout/NavBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'

export default {
  name: 'App',
  components: { NavBar, FooterBar },
  computed: {
    isLearnPage() {
      return this.$route.name === 'course-learn'
    },
  },
}
</script>

<style scoped>
  .app-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding-top: 56px;
  }
</style>
