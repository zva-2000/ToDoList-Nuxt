import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Note } from '../../app/types/notes'
import {
  createNotesWriter,
  NOTES_STORAGE_KEY,
  parseStoredNotes,
  readStoredNotes,
  writeStoredNotes
} from '../../app/utils/notesStorage'
import { createMemoryStorage } from '../support/memoryStorage'

function createNote(title = 'Планы'): Note {
  return {
    id: 'note-1',
    title,
    todos: [
      { id: 'todo-1', text: 'Купить продукты', completed: false }
    ]
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('notes storage', () => {
  it('writes and reads a versioned payload', () => {
    const storage = createMemoryStorage()
    const notes = [createNote()]

    writeStoredNotes(storage, notes)

    expect(readStoredNotes(storage)).toEqual(notes)
  })

  it('returns an empty list when storage is empty or invalid', () => {
    expect(readStoredNotes(createMemoryStorage())).toEqual([])
    expect(readStoredNotes(createMemoryStorage({ [NOTES_STORAGE_KEY]: '{invalid json' }))).toEqual([])
  })

  it('rejects an unsupported schema version', () => {
    const serialized = JSON.stringify({
      schemaVersion: 2,
      notes: [createNote()]
    })

    expect(parseStoredNotes(serialized)).toBeNull()
  })

  it('rejects notes with an invalid shape', () => {
    const serialized = JSON.stringify({
      schemaVersion: 1,
      notes: [{ id: 'note-1', title: 'Планы', todos: [{ id: 'todo-1' }] }]
    })

    expect(parseStoredNotes(serialized)).toBeNull()
  })

  it('survives a storage that refuses to answer', () => {
    const storage = createMemoryStorage()
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('access denied')
    })

    expect(readStoredNotes(storage)).toEqual([])
  })

  it('persists the notes scheduled through the debounced writer', () => {
    vi.useFakeTimers()
    const storage = createMemoryStorage()
    const writer = createNotesWriter(storage, 400)

    writer.schedule([createNote('Первый вариант')])
    writer.schedule([createNote('Последний вариант')])
    vi.runAllTimers()

    expect(readStoredNotes(storage)[0]?.title).toBe('Последний вариант')
  })
})
