<template>
  <nav v-if="totalPages > 1" aria-label="Pagination">
    <ul class="pagination justify-content-center mt-4">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
          {{ $t('common.previous') }}
        </button>
      </li>
      <li
        v-for="page in totalPages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
      >
        <button class="page-link" @click="changePage(page)">{{ page }}</button>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
          {{ $t('common.next') }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'PaginationBar',
  props: {
    totalItems: { type: Number, required: true },
    itemsPerPage: { type: Number, default: 5 },
    currentPage: { type: Number, default: 1 },
  },
  emits: ['page-change'],
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage)
    },
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$emit('page-change', page)
      }
    },
  },
}
</script>

<style scoped>
  .page-link {
    color: var(--color-text);
    border-color: var(--color-border);
    background-color: var(--color-bg);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    outline: none;
    box-shadow: none !important;
  }

  .page-link:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .page-item.active .page-link {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
  }

  .page-item.active .page-link:hover {
    background-color: var(--color-primary-dark);
    border-color: var(--color-primary-dark);
    color: #fff;
  }

  .page-item.disabled .page-link {
    color: var(--color-text-muted);
    background-color: var(--color-bg-light);
    border-color: var(--color-border);
    cursor: not-allowed;
  }
</style>
