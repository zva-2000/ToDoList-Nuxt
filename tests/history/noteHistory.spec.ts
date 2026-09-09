import { describe, expect, it } from 'vitest'
import type { NoteOperation } from '../../app/types/history'
import type { Note } from '../../app/types/notes'
import {
  clearNoteHistory,
  createNoteHistoryState,
  recordNoteOperation,
  redoNoteOperation,
  undoNoteOperation
} from '../../app/utils/noteHistory'

function createNote(): Note {
  return {
    id: 'note-1',
    title: '',
    todos: [
      { id: 'todo-1', text: 'Задача', completed: false }
    ]
  }
}

describe('note history', () => {
  it('undoes and redoes a title edit', () => {
    const note = createNote()
    const history = createNoteHistoryState()

    note.title = 'Планы'
    recordNoteOperation(history, {
      type: 'setTitle',
      previous: '',
      next: 'Планы'
    })

    expect(undoNoteOperation(history, note)).toBe(true)
    expect(note.title).toBe('')
    expect(redoNoteOperation(history, note)).toBe(true)
    expect(note.title).toBe('Планы')
  })

  it('undoes todo add, edit, toggle and remove operations', () => {
    const note = createNote()
    const history = createNoteHistoryState()
    const addedTodo = { id: 'todo-2', text: 'Новая', completed: false }

    note.todos.push(addedTodo)
    recordNoteOperation(history, { type: 'addTodo', index: 1, todo: addedTodo })
    note.todos[1]!.text = 'Изменённая'
    recordNoteOperation(history, {
      type: 'setTodoText',
      todoId: 'todo-2',
      previous: 'Новая',
      next: 'Изменённая'
    })
    note.todos[1]!.completed = true
    recordNoteOperation(history, {
      type: 'toggleTodo',
      todoId: 'todo-2',
      previous: false,
      next: true
    })
    const removedTodo = note.todos[0]!
    note.todos.splice(0, 1)
    recordNoteOperation(history, { type: 'removeTodo', index: 0, todo: removedTodo })

    expect(undoNoteOperation(history, note)).toBe(true)
    expect(note.todos.map((todo) => todo.id)).toEqual(['todo-1', 'todo-2'])
    expect(undoNoteOperation(history, note)).toBe(true)
    expect(note.todos[1]?.completed).toBe(false)
    expect(undoNoteOperation(history, note)).toBe(true)
    expect(note.todos[1]?.text).toBe('Новая')
    expect(undoNoteOperation(history, note)).toBe(true)
    expect(note.todos.map((todo) => todo.id)).toEqual(['todo-1'])
  })

  it('clears redo after a new operation', () => {
    const note = createNote()
    const history = createNoteHistoryState()

    note.title = 'Первый вариант'
    recordNoteOperation(history, {
      type: 'setTitle',
      previous: '',
      next: 'Первый вариант'
    })
    undoNoteOperation(history, note)

    note.title = 'Новый вариант'
    recordNoteOperation(history, {
      type: 'setTitle',
      previous: '',
      next: 'Новый вариант'
    })

    expect(history.future).toEqual([])
    expect(redoNoteOperation(history, note)).toBe(false)
  })

  it('keeps no more than 50 operations', () => {
    const history = createNoteHistoryState()

    for (let index = 0; index < 55; index += 1) {
      recordNoteOperation(history, {
        type: 'setTitle',
        previous: String(index),
        next: String(index + 1)
      })
    }

    expect(history.past).toHaveLength(50)
    expect(history.past[0]).toMatchObject({ previous: '5', next: '6' })

    const operations: NoteOperation[] = history.past

    for (const operation of operations) {
      expect('note' in operation).toBe(false)
      expect('todos' in operation).toBe(false)
    }
  })

  it('stores its own todo snapshot and can be cleared', () => {
    const history = createNoteHistoryState()
    const todo = { id: 'todo-2', text: 'Исходный текст', completed: false }

    recordNoteOperation(history, { type: 'addTodo', index: 1, todo })
    todo.text = 'Изменено снаружи'

    expect(history.past[0]).toMatchObject({
      todo: { text: 'Исходный текст' }
    })

    clearNoteHistory(history)
    expect(history).toEqual({ past: [], future: [] })
  })
})
