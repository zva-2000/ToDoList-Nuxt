import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Note } from '../../app/types/notes'
import {
  createNoteDraftWriter,
  NOTE_DRAFT_STORAGE_KEY,
  parseStoredDraft,
  readStoredDraft
} from '../../app/utils/draftStorage'
import { createMemoryStorage } from '../support/memoryStorage'

function createNote(): Note {
  return {
    id: 'draft-note',
    title: 'Черновик',
    todos: [
      { id: 'todo-1', text: 'Несохранённая задача', completed: false }
    ]
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('draft storage', () => {
  it('writes a restorable draft after the delay', () => {
    vi.useFakeTimers()
    const storage = createMemoryStorage()
    const writer = createNoteDraftWriter(storage, 400)

    writer.schedule({ routeKey: 'new', note: createNote() })
    vi.advanceTimersByTime(399)
    expect(readStoredDraft(storage)).toBeNull()

    vi.advanceTimersByTime(1)
    expect(readStoredDraft(storage)).toEqual({
      routeKey: 'new',
      note: createNote()
    })
  })

  it('clears pending and stored drafts', () => {
    vi.useFakeTimers()
    const storage = createMemoryStorage()
    const writer = createNoteDraftWriter(storage, 400)

    writer.schedule({ routeKey: 'new', note: createNote() })
    writer.flush()
    writer.schedule({ routeKey: 'new', note: createNote() })
    writer.clear()
    vi.runAllTimers()

    expect(storage.getItem(NOTE_DRAFT_STORAGE_KEY)).toBeNull()
  })

  it('rejects invalid and unsupported payloads', () => {
    expect(parseStoredDraft('{invalid')).toBeNull()
    expect(parseStoredDraft(JSON.stringify({
      schemaVersion: 2,
      routeKey: 'new',
      note: createNote()
    }))).toBeNull()
    expect(parseStoredDraft(JSON.stringify({
      schemaVersion: 1,
      note: createNote()
    }))).toBeNull()
  })
})
