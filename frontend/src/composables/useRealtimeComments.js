import { ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '@/services/supabase'

export function useRealtimeComments(lessonId, fetchCommentsFn) {
  const realtimeEnabled = ref(!!supabase)
  const onlineUsers = ref(0)
  const newCommentIds = ref(new Set())

  let channel = null

  function subscribe(id) {
    if (!supabase || !id) return

    unsubscribe()

    channel = supabase.channel(`lesson-${id}`, {
      config: { presence: { key: id } },
    })

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `lesson_id=eq.${id}`,
      }, (payload) => {
        newCommentIds.value.add(payload.new.id)
        fetchCommentsFn()
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `lesson_id=eq.${id}`,
      }, () => {
        fetchCommentsFn()
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        onlineUsers.value = Object.keys(state).length
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ joined_at: new Date().toISOString() })
        }
      })
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  function isNewComment(id) {
    return newCommentIds.value.has(id)
  }

  function clearNewFlag(id) {
    newCommentIds.value.delete(id)
  }

  onMounted(() => {
    subscribe(lessonId.value || lessonId)
  })

  onUnmounted(() => {
    unsubscribe()
  })

  if (typeof lessonId === 'object' && lessonId.value !== undefined) {
    watch(lessonId, (newId) => {
      subscribe(newId)
    })
  }

  return {
    realtimeEnabled,
    onlineUsers,
    isNewComment,
    clearNewFlag,
    unsubscribe,
  }
}
