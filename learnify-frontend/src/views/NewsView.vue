<template>
  <div class="container py-4">
    <h2 class="mb-4">{{ $t('news.title') }}</h2>

    <div class="row mb-4">
      <div class="col-12 col-md-8">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          :placeholder="$t('news.search')"
          aria-label="Search news"
        />
      </div>
      <div class="col-12 col-md-4 mt-2 mt-md-0">
        <select v-model="selectedCategory" class="form-select" aria-label="Filter by category">
          <option value="">{{ $t('news.all') }}</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div v-if="paginatedNews.length">
      <NewsCard
        v-for="item in paginatedNews"
        :key="item.id"
        :news="item"
      />
      <PaginationBar
        :total-items="filteredNews.length"
        :items-per-page="perPage"
        :current-page="currentPage"
        @page-change="currentPage = $event"
      />
    </div>
    <p v-else class="text-muted">{{ $t('news.noResults') }}</p>
  </div>
</template>

<script>
import newsData from '@/data/news.json'
import NewsCard from '@/components/news/NewsCard.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'

export default {
  name: 'NewsView',
  components: { NewsCard, PaginationBar },
  data() {
    return {
      news: newsData,
      searchQuery: '',
      selectedCategory: '',
      currentPage: 1,
      perPage: 5,
    }
  },
  computed: {
    categories() {
      return [...new Set(this.news.map(n => n.category))]
    },
    filteredNews() {
      const query = this.searchQuery.toLowerCase()
      return this.news.filter(item => {
        const matchesSearch = !query ||
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.date.toLowerCase().includes(query)
        const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory
        return matchesSearch && matchesCategory
      })
    },
    paginatedNews() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredNews.slice(start, start + this.perPage)
    },
  },
  watch: {
    searchQuery() { this.currentPage = 1 },
    selectedCategory() { this.currentPage = 1 },
  },
}
</script>
