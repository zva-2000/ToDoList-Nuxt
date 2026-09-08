import { useNotesStore } from '~/stores/notes'
import {
  createNotesWriter,
  NOTES_STORAGE_KEY,
  parseStoredNotes,
  readStoredNotes
} from '~/utils/notesStorage'

export default defineNuxtPlugin(() => {
  const notesStore = useNotesStore()
  const writer = createNotesWriter(window.localStorage)
  let isApplyingExternalChange = false

  notesStore.replaceNotes(readStoredNotes(window.localStorage))

  notesStore.$subscribe((_mutation, state) => {
    if (!isApplyingExternalChange) {
      writer.schedule(state.notes)
    }
  }, {
    detached: true,
    flush: 'sync'
  })

  function onStorage(event: StorageEvent): void {
    const belongsToNotes = event.key === NOTES_STORAGE_KEY
      && (event.storageArea === null || event.storageArea === window.localStorage)

    if (!belongsToNotes) {
      return
    }

    const notes = event.newValue === null ? [] : parseStoredNotes(event.newValue)

    if (notes === null) {
      return
    }

    writer.cancel()
    isApplyingExternalChange = true

    try {
      notesStore.replaceNotes(notes)
    } finally {
      isApplyingExternalChange = false
    }
  }

  function flushWhenHidden(): void {
    if (document.visibilityState === 'hidden') {
      writer.flush()
    }
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('pagehide', writer.flush)
  document.addEventListener('visibilitychange', flushWhenHidden)
})
