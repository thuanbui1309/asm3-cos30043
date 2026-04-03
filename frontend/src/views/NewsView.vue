<template>
  <div class="container py-4">
    <h2 class="mb-4">{{ $t('news.title') }}</h2>

    <div class="row g-2 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <label class="form-label small fw-semibold" for="filter-title">{{ $t('news.filterTitle') }}</label>
        <input
          id="filter-title"
          v-model="filterTitle"
          type="text"
          class="form-control"
          :placeholder="$t('news.filterTitlePlaceholder')"
        />
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <label class="form-label small fw-semibold" for="filter-content">{{ $t('news.filterContent') }}</label>
        <input
          id="filter-content"
          v-model="filterContent"
          type="text"
          class="form-control"
          :placeholder="$t('news.filterContentPlaceholder')"
        />
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <label class="form-label small fw-semibold" for="filter-category">{{ $t('news.filterCategory') }}</label>
        <select id="filter-category" v-model="filterCategory" class="form-select" aria-label="Filter by category">
          <option value="">{{ $t('news.all') }}</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <label class="form-label small fw-semibold" for="filter-date">{{ $t('news.filterDate') }}</label>
        <input
          id="filter-date"
          v-model="filterDate"
          type="date"
          class="form-control"
        />
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
      filterTitle: '',
      filterContent: '',
      filterCategory: '',
      filterDate: '',
      currentPage: 1,
      perPage: 5,
    }
  },
  computed: {
    categories() {
      return [...new Set(this.news.map(n => n.category))]
    },
    filteredNews() {
      const title = this.filterTitle.toLowerCase()
      const content = this.filterContent.toLowerCase()
      return this.news.filter(item => {
        if (title && !item.title.toLowerCase().includes(title)) return false
        if (content && !item.content.toLowerCase().includes(content)) return false
        if (this.filterCategory && item.category !== this.filterCategory) return false
        if (this.filterDate && item.date !== this.filterDate) return false
        return true
      })
    },
    paginatedNews() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredNews.slice(start, start + this.perPage)
    },
  },
  watch: {
    filterTitle() { this.currentPage = 1 },
    filterContent() { this.currentPage = 1 },
    filterCategory() { this.currentPage = 1 },
    filterDate() { this.currentPage = 1 },
  },
}
</script>
