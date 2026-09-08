import type { Note } from '~/types/notes'
import {
  createNoteDraftWriter,
  type NoteDraftWriter,
  readStoredDraft
} from '~/utils/draftStorage'

export function useNoteDraft(routeKey: string) {
  const restorable = shallowRef<Note | null>(null)
  let writer: NoteDraftWriter | null = null

  function schedule(note: Note): void {
    writer?.schedule({ routeKey, note })
  }

  function flush(): void {
    writer?.flush()
  }

  function clear(): void {
    writer?.clear()
  }

  function forget(): void {
    restorable.value = null
  }

  function flushWhenHidden(): void {
    if (document.visibilityState === 'hidden') {
      flush()
    }
  }

  onMounted(() => {
    writer = createNoteDraftWriter(window.localStorage)

    const stored = readStoredDraft(window.localStorage)

    if (stored && stored.routeKey === routeKey) {
      restorable.value = stored.note
    }

    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flushWhenHidden)
  })

  onBeforeUnmount(() => {
    flush()
    window.removeEventListener('pagehide', flush)
    document.removeEventListener('visibilitychange', flushWhenHidden)
  })

  return { restorable, schedule, flush, clear, forget }
}
