<template>
  <div class="news-card mb-3 p-3">
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h5 class="news-title mb-1">{{ news.title }}</h5>
        <span class="badge bg-light text-dark me-2">{{ news.category }}</span>
        <small class="text-muted">{{ news.date }}</small>
      </div>
    </div>
    <p class="news-content mt-2 mb-0">{{ news.content }}</p>
  </div>
</template>

<script>
export default {
  name: 'NewsCard',
  props: {
    news: { type: Object, required: true },
  },
}
</script>

<style scoped>
  .news-card {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
  }

  .news-card:hover {
    background-color: var(--color-bg-light);
    box-shadow: var(--shadow-sm);
  }

  .news-title {
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--color-text);
  }

  .news-content {
    font-size: 0.95rem;
    color: var(--color-text-light);
    line-height: 1.6;
  }
</style>
