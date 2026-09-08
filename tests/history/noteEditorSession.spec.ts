import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createEmptyNote,
  createNoteEditorSession,
  TEXT_EDIT_DELAY,
  TITLE_REQUIRED_ERROR
} from '../../app/utils/noteEditorSession'
import type { Note } from '../../app/types/notes'

function createNote(): Note {
  return {
    id: 'note-1',
    title: 'Планы',
    todos: [
      { id: 'todo-1', text: 'Купить продукты', completed: false }
    ]
  }
}

describe('note editor session history', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('undoes and redoes adding, toggling and removing a todo', () => {
    const session = createNoteEditorSession(createNote())

    expect(session.addTodo('Позвонить врачу')).toBe(true)
    const addedId = session.getNote().todos[1]?.id
    expect(session.getNote().todos).toHaveLength(2)

    session.toggleTodo(addedId!)
    expect(session.getNote().todos[1]?.completed).toBe(true)

    session.removeTodo(addedId!)
    expect(session.getNote().todos).toHaveLength(1)

    expect(session.undo()).toBe(true)
    expect(session.getNote().todos.map((todo) => todo.id)).toEqual(['todo-1', addedId])
    expect(session.getNote().todos[1]?.completed).toBe(true)

    expect(session.undo()).toBe(true)
    expect(session.getNote().todos[1]?.completed).toBe(false)

    expect(session.undo()).toBe(true)
    expect(session.getNote().todos).toHaveLength(1)

    expect(session.redo()).toBe(true)
    expect(session.getNote().todos).toHaveLength(2)
  })

  it('collects continuous todo typing into one undo step', () => {
    const session = createNoteEditorSession(createNote())

    session.updateTodoText('todo-1', 'К')
    session.updateTodoText('todo-1', 'Ку')
    session.updateTodoText('todo-1', 'Купить хлеб')
    vi.advanceTimersByTime(TEXT_EDIT_DELAY)

    expect(session.getNote().todos[0]?.text).toBe('Купить хлеб')
    expect(session.undo()).toBe(true)
    expect(session.getNote().todos[0]?.text).toBe('Купить продукты')
    expect(session.redo()).toBe(true)
    expect(session.getNote().todos[0]?.text).toBe('Купить хлеб')
  })

  it('commits a pending todo edit when another action happens', () => {
    const session = createNoteEditorSession(createNote())

    session.updateTodoText('todo-1', 'Другой текст')
    session.addTodo('Вторая задача')

    expect(session.undo()).toBe(true)
    expect(session.getNote().todos).toHaveLength(1)
    expect(session.getNote().todos[0]?.text).toBe('Другой текст')

    expect(session.undo()).toBe(true)
    expect(session.getNote().todos[0]?.text).toBe('Купить продукты')
  })

  it('clears redo after a new todo change following undo', () => {
    const session = createNoteEditorSession(createNote())

    session.addTodo('Первая')
    session.undo()
    session.addTodo('Вторая')

    expect(session.canRedo()).toBe(false)
    expect(session.redo()).toBe(false)
    expect(session.getNote().todos[1]?.text).toBe('Вторая')
  })

  it('resets todo history after save and cancel', () => {
    const session = createNoteEditorSession(createNote())

    session.addTodo('Ещё задача')
    expect(session.canUndo()).toBe(true)
    expect(session.save()).not.toBeNull()
    expect(session.canUndo()).toBe(false)

    session.addTodo('После сохранения')
    session.cancel()
    expect(session.canUndo()).toBe(false)
    expect(session.canRedo()).toBe(false)
  })

  it('keeps an empty title from being saved', () => {
    const session = createNoteEditorSession(createEmptyNote())

    session.updateTitle('   ')
    session.finishTextEdit()

    expect(session.save()).toBeNull()
    expect(session.getTitleError()).toBe(TITLE_REQUIRED_ERROR)
  })
})
