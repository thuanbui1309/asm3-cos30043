<template>
  <footer class="site-footer">
    <div class="container text-center">
      <p class="mb-0">Learnify &copy; 2026. {{ $t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterBar',
}
</script>

<style scoped>
  .site-footer {
    background-color: var(--color-bg);
    border-top: 1px solid var(--color-border);
    padding: 2rem 0;
    color: var(--color-text-light);
    font-size: 0.9rem;
  }
</style>
