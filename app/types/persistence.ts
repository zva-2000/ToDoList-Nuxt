import type { Note } from './notes'

export const NOTES_SCHEMA_VERSION = 1

export interface NotesStoragePayload {
  schemaVersion: typeof NOTES_SCHEMA_VERSION
  notes: Note[]
}

export interface NoteDraftStoragePayload {
  schemaVersion: typeof NOTES_SCHEMA_VERSION
  routeKey: string
  note: Note
}
