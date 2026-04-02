<template>
  <div class="mention-input-wrap">
    <div class="mention-editor">
      <div class="mention-highlight-layer" v-html="highlightedText" aria-hidden="true"></div>
      <textarea
        ref="textarea"
        v-model="text"
        class="form-control mention-textarea"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        @input="onInput"
        @keydown="onKeydown"
        @scroll="syncScroll"
      ></textarea>
    </div>
    <div v-if="showDropdown" class="mention-dropdown">
      <div v-if="noResults" class="mention-no-results">No user found</div>
      <div
        v-for="(user, i) in suggestions"
        :key="user.id"
        class="mention-option"
        :class="{ active: i === selectedIndex }"
        @mousedown.prevent="selectUser(user)"
      >
        <span class="mention-avatar">{{ user.username.slice(0, 2).toUpperCase() }}</span>
        <span class="mention-username">{{ user.username }}</span>
        <span v-if="user.role === 'instructor'" class="mention-role-badge">Instructor</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

let debounceTimer = null

function toDisplay(val) {
  return (val || '').replace(/@\[([^\]]+)\]/g, '@$1')
}

function extractMentions(val) {
  const matches = (val || '').matchAll(/@\[([^\]]+)\]/g)
  return [...matches].map((m) => m[1])
}

function toWire(val, mentionedUsers) {
  let result = val || ''
  for (const name of mentionedUsers) {
    result = result.replace(
      new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\w)`, 'g'),
      `@[${name}]`
    )
  }
  return result
}

export default {
  name: 'MentionInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: Number, default: 2 },
    courseId: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      text: toDisplay(this.modelValue),
      mentionedUsers: extractMentions(this.modelValue),
      suggestions: [],
      showDropdown: false,
      selectedIndex: 0,
      mentionStart: -1,
      noResults: false,
    }
  },
  computed: {
    highlightedText() {
      if (!this.text) return ''
      const escaped = this.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      let result = escaped
      for (const name of this.mentionedUsers) {
        result = result.replace(
          new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\w)`, 'g'),
          `<span class="mention-tag">@${name}</span>`
        )
      }
      return result + '\n'
    },
  },
  watch: {
    modelValue(val) {
      this.text = toDisplay(val)
      const newMentions = extractMentions(val)
      for (const m of newMentions) {
        if (!this.mentionedUsers.includes(m)) this.mentionedUsers.push(m)
      }
    },
    text(val) { this.$emit('update:modelValue', toWire(val, this.mentionedUsers)) },
  },
  beforeUnmount() {
    clearTimeout(debounceTimer)
  },
  methods: {
    syncScroll() {
      const layer = this.$el.querySelector('.mention-highlight-layer')
      if (layer) {
        layer.scrollTop = this.$refs.textarea.scrollTop
      }
    },
    onInput() {
      const textarea = this.$refs.textarea
      const pos = textarea.selectionStart
      const before = this.text.slice(0, pos)
      const atMatch = before.match(/@(\w*)$/)

      if (atMatch) {
        this.mentionStart = pos - atMatch[0].length
        const query = atMatch[1]
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => this.searchUsers(query), query.length >= 1 ? 300 : 0)
      } else {
        this.showDropdown = false
      }
    },
    async searchUsers(query) {
      try {
        const params = new URLSearchParams()
        if (query) params.append('q', query)
        if (this.courseId) params.append('course_id', this.courseId)
        const { data } = await api.get(`/users/search?${params}`)
        this.suggestions = data.data || []
        this.noResults = query.length >= 1 && this.suggestions.length === 0
        this.showDropdown = this.suggestions.length > 0 || this.noResults
        this.selectedIndex = 0
      } catch {
        this.showDropdown = false
      }
    },
    selectUser(user) {
      const before = this.text.slice(0, this.mentionStart)
      const after = this.text.slice(this.$refs.textarea.selectionStart)
      this.text = `${before}@${user.username} ${after}`
      if (!this.mentionedUsers.includes(user.username)) {
        this.mentionedUsers.push(user.username)
      }
      this.showDropdown = false
      this.$nextTick(() => {
        const newPos = before.length + user.username.length + 2
        this.$refs.textarea.setSelectionRange(newPos, newPos)
        this.$refs.textarea.focus()
      })
    },
    onKeydown(e) {
      if (this.showDropdown) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (this.suggestions[this.selectedIndex]) this.selectUser(this.suggestions[this.selectedIndex])
        } else if (e.key === 'Escape') {
          this.showDropdown = false
        }
        return
      }
      if (e.key === 'Enter' && !e.shiftKey && !this.disabled) {
        e.preventDefault()
        this.$emit('submit')
      }
    },
  },
}
</script>

<style scoped>
  .mention-input-wrap {
    position: relative;
  }

  .mention-editor {
    position: relative;
  }

  .mention-highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.6rem 0.8rem;
    font-size: 0.95rem;
    line-height: 1.5;
    font-family: inherit;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
    pointer-events: none;
    color: transparent;
    border: 1.5px solid transparent;
  }

  .mention-highlight-layer :deep(.mention-tag) {
    color: transparent;
    background-color: rgba(4, 102, 200, 0.12);
    border-radius: 3px;
    padding: 0 1px;
  }

  .mention-textarea {
    resize: vertical;
    background: transparent;
    position: relative;
    z-index: 1;
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

  .mention-no-results {
    padding: 0.5rem 0.75rem;
    font-size: 0.82rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  .mention-username {
    flex: 1;
  }

  .mention-role-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-primary);
    background-color: var(--color-bg-secondary);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
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
