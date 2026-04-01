<template>
  <div class="mention-input-wrap">
    <textarea
      ref="textarea"
      v-model="text"
      class="form-control mention-textarea"
      :placeholder="placeholder"
      :rows="rows"
      @input="onInput"
      @keydown="onKeydown"
    ></textarea>
    <div v-if="showDropdown && suggestions.length > 0" class="mention-dropdown">
      <div
        v-for="(user, i) in suggestions"
        :key="user.id"
        class="mention-option"
        :class="{ active: i === selectedIndex }"
        @mousedown.prevent="selectUser(user)"
      >
        <span class="mention-avatar">{{ user.username.slice(0, 2).toUpperCase() }}</span>
        <span>{{ user.username }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

let debounceTimer = null

export default {
  name: 'MentionInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: Number, default: 2 },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      text: this.modelValue,
      suggestions: [],
      showDropdown: false,
      selectedIndex: 0,
      mentionStart: -1,
    }
  },
  watch: {
    modelValue(val) { this.text = val },
    text(val) { this.$emit('update:modelValue', val) },
  },
  methods: {
    onInput() {
      const textarea = this.$refs.textarea
      const pos = textarea.selectionStart
      const before = this.text.slice(0, pos)
      const atMatch = before.match(/@(\w*)$/)

      if (atMatch) {
        this.mentionStart = pos - atMatch[0].length
        const query = atMatch[1]
        if (query.length >= 1) {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => this.searchUsers(query), 300)
        } else {
          this.suggestions = []
          this.showDropdown = false
        }
      } else {
        this.showDropdown = false
      }
    },
    async searchUsers(query) {
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
        this.suggestions = data.data || []
        this.showDropdown = this.suggestions.length > 0
        this.selectedIndex = 0
      } catch {
        this.showDropdown = false
      }
    },
    selectUser(user) {
      const before = this.text.slice(0, this.mentionStart)
      const after = this.text.slice(this.$refs.textarea.selectionStart)
      this.text = `${before}@[${user.username}] ${after}`
      this.showDropdown = false
      this.$nextTick(() => {
        const newPos = before.length + user.username.length + 4
        this.$refs.textarea.setSelectionRange(newPos, newPos)
        this.$refs.textarea.focus()
      })
    },
    onKeydown(e) {
      if (!this.showDropdown) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0)
      } else if (e.key === 'Enter' && this.showDropdown) {
        e.preventDefault()
        this.selectUser(this.suggestions[this.selectedIndex])
      } else if (e.key === 'Escape') {
        this.showDropdown = false
      }
    },
  },
}
</script>

<style scoped>
  .mention-input-wrap {
    position: relative;
  }

  .mention-textarea {
    resize: vertical;
  }

  .mention-dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border: 1.5px solid var(--color-border-strong);
    border-radius: 6px;
    box-shadow: var(--shadow-md);
    z-index: 10;
    max-height: 180px;
    overflow-y: auto;
    margin-bottom: 4px;
  }

  .mention-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    font-size: 0.88rem;
  }

  .mention-option:hover,
  .mention-option.active {
    background-color: var(--color-bg-hover);
  }

  .mention-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--color-bg-light);
    border: 1px solid var(--color-border);
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-light);
  }
</style>
