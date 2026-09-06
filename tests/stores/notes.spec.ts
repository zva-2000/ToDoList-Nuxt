import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotesStore } from '../../app/stores/notes'
import type { Note } from '../../app/types/notes'

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Планы на выходные',
    todos: [
      {
        id: 'todo-1',
        text: 'Сходить в музей',
        completed: false
      }
    ],
    ...overrides
  }
}

describe('useNotesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a note and finds it by id', () => {
    const store = useNotesStore()
    const note = createNote()

    store.addNote(note)

    expect(store.noteById(note.id)).toMatchObject(note)
  })

  it('does not keep a reference to the added note', () => {
    const store = useNotesStore()
    const note = createNote()

    store.addNote(note)
    note.todos[0]!.text = 'Изменённый текст'

    expect(store.noteById(note.id)!.todos[0]!.text).toBe('Сходить в музей')
  })

  it('does not add a note with a duplicate id', () => {
    const store = useNotesStore()
    store.addNote(createNote())

    expect(() => store.addNote(createNote({ title: 'Другая заметка' }))).toThrow(
      'Заметка с id "note-1" уже существует'
    )
  })

  it('updates an existing note', () => {
    const store = useNotesStore()
    store.addNote(createNote())

    const updated = createNote({
      title: 'Новые планы',
      todos: []
    })

    expect(store.updateNote(updated)).toBe(true)
    expect(store.noteById(updated.id)).toMatchObject(updated)
  })

  it('returns false when updating an unknown note', () => {
    const store = useNotesStore()

    expect(store.updateNote(createNote())).toBe(false)
  })

  it('deletes an existing note', () => {
    const store = useNotesStore()
    const note = createNote()
    store.addNote(note)

    expect(store.deleteNote(note.id)).toBe(true)
    expect(store.noteById(note.id)).toBeUndefined()
  })

  it('returns false when deleting an unknown note', () => {
    const store = useNotesStore()

    expect(store.deleteNote('missing-note')).toBe(false)
  })
})
