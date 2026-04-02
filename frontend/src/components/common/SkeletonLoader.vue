<template>
  <div class="skeleton-wrap">
    <div v-for="n in count" :key="n" class="skeleton-item" :class="`skeleton-${type}`">
      <template v-if="type === 'card'">
        <div class="skeleton-thumb shimmer"></div>
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line-sm shimmer"></div>
          <div class="skeleton-line shimmer"></div>
          <div class="skeleton-line skeleton-line-md shimmer"></div>
        </div>
      </template>
      <template v-else-if="type === 'line'">
        <div class="skeleton-line shimmer" :style="{ width: randomWidth() }"></div>
      </template>
      <template v-else-if="type === 'comment'">
        <div class="skeleton-row">
          <div class="skeleton-circle shimmer"></div>
          <div class="skeleton-col">
            <div class="skeleton-line skeleton-line-sm shimmer"></div>
            <div class="skeleton-line shimmer"></div>
          </div>
        </div>
      </template>
      <template v-else-if="type === 'stat'">
        <div class="skeleton-stat-box shimmer"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: { type: String, default: 'line', validator: (v) => ['card', 'line', 'comment', 'stat'].includes(v) },
    count: { type: Number, default: 1 },
  },
  methods: {
    randomWidth() {
      return (60 + Math.random() * 40) + '%'
    },
  },
}
</script>

<style scoped>
  .skeleton-wrap {
    display: contents;
  }

  .shimmer {
    background: linear-gradient(90deg, var(--color-bg-light) 25%, var(--color-bg-hover) 50%, var(--color-bg-light) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .skeleton-card {
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .skeleton-thumb {
    height: 185px;
  }

  .skeleton-body {
    padding: 1.1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .skeleton-line {
    height: 12px;
    border-radius: 6px;
    width: 100%;
  }

  .skeleton-line-sm {
    width: 40%;
  }

  .skeleton-line-md {
    width: 70%;
  }

  .skeleton-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.75rem 0;
  }

  .skeleton-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .skeleton-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .skeleton-comment {
    border-bottom: 1px solid var(--color-border);
  }

  .skeleton-comment:last-child {
    border-bottom: none;
  }

  .skeleton-stat-box {
    height: 90px;
    border-radius: 12px;
  }
</style>
