<template>
  <div class="video-player">
    <video
      ref="video"
      :src="currentSrc"
      class="video-element"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @ended="$emit('ended')"
    ></video>

    <div class="video-controls">
      <button class="ctrl-btn" @click="togglePlay" :aria-label="playing ? 'Pause' : 'Play'">
        <svg v-if="!playing" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      </button>

      <div class="progress-bar" @click="seek">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

      <select v-model="playbackRate" class="speed-select" @change="changeSpeed" aria-label="Playback speed">
        <option v-for="rate in [0.5, 1, 1.5, 2]" :key="rate" :value="rate">{{ rate }}x</option>
      </select>

      <select v-if="qualities.length > 1" v-model="currentQuality" class="speed-select" @change="changeQuality" aria-label="Quality">
        <option v-for="q in qualities" :key="q.label" :value="q.label">{{ q.label }}</option>
      </select>

      <button class="ctrl-btn" @click="toggleFullscreen" aria-label="Fullscreen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    src: { type: String, required: true },
    cloudinaryId: { type: String, default: '' },
  },
  emits: ['timeupdate', 'ended'],
  data() {
    return {
      playing: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
      playbackRate: 1,
      currentQuality: '720p',
      qualities: [],
    }
  },
  computed: {
    currentSrc() {
      if (!this.cloudinaryId) return this.src
      const q = this.qualities.find((q) => q.label === this.currentQuality)
      return q ? q.url : this.src
    },
  },
  created() {
    if (this.cloudinaryId) {
      const base = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`
      this.qualities = [
        { label: '360p', url: `${base}/q_auto,h_360/${this.cloudinaryId}` },
        { label: '720p', url: `${base}/q_auto,h_720/${this.cloudinaryId}` },
        { label: '1080p', url: `${base}/q_auto,h_1080/${this.cloudinaryId}` },
      ]
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    togglePlay() {
      const video = this.$refs.video
      if (video.paused) {
        video.play()
        this.playing = true
      } else {
        video.pause()
        this.playing = false
      }
    },
    onTimeUpdate() {
      const video = this.$refs.video
      this.currentTime = video.currentTime
      this.progress = (video.currentTime / video.duration) * 100
      this.$emit('timeupdate', video.currentTime)
    },
    onLoaded() {
      this.duration = this.$refs.video.duration
    },
    seek(e) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      this.$refs.video.currentTime = pct * this.duration
    },
    changeSpeed() {
      this.$refs.video.playbackRate = this.playbackRate
    },
    changeQuality() {
      const time = this.$refs.video.currentTime
      const wasPlaying = this.playing
      this.$nextTick(() => {
        this.$refs.video.currentTime = time
        if (wasPlaying) this.$refs.video.play()
      })
    },
    toggleFullscreen() {
      const el = this.$el
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        el.requestFullscreen()
      }
    },
    handleKeydown(e) {
      const video = this.$refs.video
      if (!video) return
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay() }
      if (e.code === 'ArrowRight') { video.currentTime += 10 }
      if (e.code === 'ArrowLeft') { video.currentTime -= 10 }
    },
    formatTime(seconds) {
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },
  },
}
</script>

<style scoped>
  .video-player {
    position: relative;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  }

  .video-element {
    width: 100%;
    display: block;
    aspect-ratio: 16/9;
    object-fit: contain;
    background: #000;
  }

  .video-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.85);
  }

  .ctrl-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
  }

  .progress-bar {
    flex: 1;
    cursor: pointer;
    padding: 0.25rem 0;
  }

  .progress-track {
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-primary, #0466c8);
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  .time-display {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .speed-select {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.15rem 0.3rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .speed-select option {
    background: #222;
    color: #fff;
  }
</style>
