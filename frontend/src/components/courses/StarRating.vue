<template>
  <div class="star-rating" :class="`star-${size}`">
    <span
      v-for="star in 5"
      :key="star"
      class="star"
      :class="{ filled: star <= Math.round(rating), interactive }"
      @click="interactive && $emit('update:rating', star)"
    >
      <svg viewBox="0 0 24 24" :fill="star <= Math.round(rating) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </span>
  </div>
</template>

<script>
export default {
  name: 'StarRating',
  props: {
    rating: { type: Number, default: 0 },
    size: { type: String, default: 'sm', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
    interactive: { type: Boolean, default: false },
  },
  emits: ['update:rating'],
}
</script>

<style scoped>
  .star-rating {
    display: inline-flex;
    gap: 2px;
    color: #f5a623;
  }

  .star svg {
    display: block;
  }

  .star.interactive {
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .star.interactive:hover {
    transform: scale(1.2);
  }

  .star-sm svg { width: 14px; height: 14px; }
  .star-md svg { width: 20px; height: 20px; }
  .star-lg svg { width: 28px; height: 28px; }
</style>
