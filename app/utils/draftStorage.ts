import type { Note } from '~/types/notes'
import type { NoteDraftStoragePayload } from '~/types/persistence'
import { NOTES_SCHEMA_VERSION } from '~/types/persistence'
import { createDebouncedWriter } from '~/utils/debouncedWriter'
import { cloneNote } from '~/utils/noteClone'
import { isNote, isRecord } from '~/utils/noteValidation'
import { readItem, removeItem, type StorageLike, writeItem } from '~/utils/storage'

export const NOTE_DRAFT_STORAGE_KEY = 'nuxt-notes:draft'

export interface NoteDraft {
  routeKey: string
  note: Note
}

export interface NoteDraftWriter {
  schedule(draft: NoteDraft): void
  flush(): void
  clear(): void
}

function cloneDraft(draft: NoteDraft): NoteDraft {
  return {
    routeKey: draft.routeKey,
    note: cloneNote(draft.note)
  }
}

function isDraftPayload(value: unknown): value is NoteDraftStoragePayload {
  return isRecord(value)
    && value.schemaVersion === NOTES_SCHEMA_VERSION
    && typeof value.routeKey === 'string'
    && isNote(value.note)
}

export function parseStoredDraft(serialized: string | null): NoteDraft | null {
  if (serialized === null) {
    return null
  }

  try {
    const payload: unknown = JSON.parse(serialized)
    return isDraftPayload(payload) ? cloneDraft(payload) : null
  } catch {
    return null
  }
}

export function readStoredDraft(storage: StorageLike): NoteDraft | null {
  return parseStoredDraft(readItem(storage, NOTE_DRAFT_STORAGE_KEY))
}

export function writeStoredDraft(storage: StorageLike, draft: NoteDraft): void {
  const payload: NoteDraftStoragePayload = {
    schemaVersion: NOTES_SCHEMA_VERSION,
    routeKey: draft.routeKey,
    note: draft.note
  }

  writeItem(storage, NOTE_DRAFT_STORAGE_KEY, JSON.stringify(payload))
}

export function createNoteDraftWriter(storage: StorageLike, delay?: number): NoteDraftWriter {
  const writer = createDebouncedWriter<NoteDraft>({
    write: (draft) => writeStoredDraft(storage, draft),
    snapshot: cloneDraft,
    delay
  })

  return {
    schedule: writer.schedule,
    flush: writer.flush,
    clear(): void {
      writer.cancel()
      removeItem(storage, NOTE_DRAFT_STORAGE_KEY)
    }
  }
}
