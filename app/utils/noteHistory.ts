import type { Note, Todo } from '~/types/notes'
import type { NoteHistoryState, NoteOperation } from '~/types/history'
import { cloneTodo } from '~/utils/noteClone'

export const NOTE_HISTORY_LIMIT = 50

export function createNoteHistoryState(): NoteHistoryState {
  return {
    past: [],
    future: []
  }
}

function cloneOperation(operation: NoteOperation): NoteOperation {
  if (operation.type === 'addTodo' || operation.type === 'removeTodo') {
    return { ...operation, todo: cloneTodo(operation.todo) }
  }

  return { ...operation }
}

function insertTodo(note: Note, index: number, todo: Todo): void {
  note.todos.splice(Math.min(index, note.todos.length), 0, cloneTodo(todo))
}

function removeTodo(note: Note, todoId: string): boolean {
  const index = note.todos.findIndex((todo) => todo.id === todoId)

  if (index === -1) {
    return false
  }

  note.todos.splice(index, 1)
  return true
}

function patchTodo(note: Note, todoId: string, patch: Partial<Todo>): boolean {
  const todo = note.todos.find((item) => item.id === todoId)

  if (!todo) {
    return false
  }

  Object.assign(todo, patch)
  return true
}

function applyForward(note: Note, operation: NoteOperation): boolean {
  switch (operation.type) {
    case 'setTitle':
      note.title = operation.next
      return true
    case 'addTodo':
      insertTodo(note, operation.index, operation.todo)
      return true
    case 'removeTodo':
      return removeTodo(note, operation.todo.id)
    case 'setTodoText':
      return patchTodo(note, operation.todoId, { text: operation.next })
    case 'toggleTodo':
      return patchTodo(note, operation.todoId, { completed: operation.next })
  }
}

function applyBackward(note: Note, operation: NoteOperation): boolean {
  switch (operation.type) {
    case 'setTitle':
      note.title = operation.previous
      return true
    case 'addTodo':
      return removeTodo(note, operation.todo.id)
    case 'removeTodo':
      insertTodo(note, operation.index, operation.todo)
      return true
    case 'setTodoText':
      return patchTodo(note, operation.todoId, { text: operation.previous })
    case 'toggleTodo':
      return patchTodo(note, operation.todoId, { completed: operation.previous })
  }
}

export function recordNoteOperation(history: NoteHistoryState, operation: NoteOperation): void {
  history.past.push(cloneOperation(operation))
  history.future.splice(0)

  const overflow = history.past.length - NOTE_HISTORY_LIMIT

  if (overflow > 0) {
    history.past.splice(0, overflow)
  }
}

export function undoNoteOperation(history: NoteHistoryState, note: Note): boolean {
  const operation = history.past.at(-1)

  if (!operation || !applyBackward(note, operation)) {
    return false
  }

  history.past.pop()
  history.future.push(operation)
  return true
}

export function redoNoteOperation(history: NoteHistoryState, note: Note): boolean {
  const operation = history.future.at(-1)

  if (!operation || !applyForward(note, operation)) {
    return false
  }

  history.future.pop()
  history.past.push(operation)
  return true
}

export function clearNoteHistory(history: NoteHistoryState): void {
  history.past.splice(0)
  history.future.splice(0)
}
