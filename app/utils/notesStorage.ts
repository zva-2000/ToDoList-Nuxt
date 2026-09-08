import type { Note } from '~/types/notes'
import type { NotesStoragePayload } from '~/types/persistence'
import { NOTES_SCHEMA_VERSION } from '~/types/persistence'
import { createDebouncedWriter, type DebouncedWriter } from '~/utils/debouncedWriter'
import { cloneNotes } from '~/utils/noteClone'
import { isNote, isRecord } from '~/utils/noteValidation'
import { readItem, type StorageLike, writeItem } from '~/utils/storage'

export const NOTES_STORAGE_KEY = 'nuxt-notes:data'

function isNotesPayload(value: unknown): value is NotesStoragePayload {
  return isRecord(value)
    && value.schemaVersion === NOTES_SCHEMA_VERSION
    && Array.isArray(value.notes)
    && value.notes.every(isNote)
}

export function parseStoredNotes(serialized: string | null): Note[] | null {
  if (serialized === null) {
    return null
  }

  try {
    const payload: unknown = JSON.parse(serialized)
    return isNotesPayload(payload) ? cloneNotes(payload.notes) : null
  } catch {
    return null
  }
}

export function readStoredNotes(storage: StorageLike): Note[] {
  return parseStoredNotes(readItem(storage, NOTES_STORAGE_KEY)) ?? []
}

export function writeStoredNotes(storage: StorageLike, notes: Note[]): void {
  const payload: NotesStoragePayload = {
    schemaVersion: NOTES_SCHEMA_VERSION,
    notes
  }

  writeItem(storage, NOTES_STORAGE_KEY, JSON.stringify(payload))
}

export function createNotesWriter(storage: StorageLike, delay?: number): DebouncedWriter<Note[]> {
  return createDebouncedWriter<Note[]>({
    write: (notes) => writeStoredNotes(storage, notes),
    snapshot: cloneNotes,
    delay
  })
}
