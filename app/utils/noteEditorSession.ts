import type { Note, Todo } from '~/types/notes'
import type { NoteHistoryState } from '~/types/history'
import { createId } from '~/utils/ids'
import { cloneNote, cloneTodo } from '~/utils/noteClone'
import {
  clearNoteHistory,
  createNoteHistoryState,
  recordNoteOperation,
  redoNoteOperation,
  undoNoteOperation
} from '~/utils/noteHistory'
import { createTextEditBuffer } from '~/utils/textEditBuffer'

export const TEXT_EDIT_DELAY = 500
export const TITLE_REQUIRED_ERROR = 'Введите название заметки.'

export function createEmptyNote(): Note {
  return {
    id: createId(),
    title: '',
    todos: []
  }
}

function haveSameContent(first: Note, second: Note): boolean {
  return first.title === second.title
    && first.todos.length === second.todos.length
    && first.todos.every((todo, index) => {
      const other = second.todos[index]

      return other !== undefined
        && other.id === todo.id
        && other.text === todo.text
        && other.completed === todo.completed
    })
}

export interface NoteEditorSession {
  getNote(): Note
  getTitleError(): string
  getInvalidTodoIds(): readonly string[]
  isDirty(): boolean
  canUndo(): boolean
  canRedo(): boolean
  updateTitle(value: string): void
  updateTodoText(todoId: string, value: string): void
  finishTextEdit(): void
  addTodo(text: string): boolean
  removeTodo(todoId: string): void
  toggleTodo(todoId: string): void
  undo(): boolean
  redo(): boolean
  save(): Note | null
  cancel(): void
  replaceNote(note: Note): void
  dispose(): void
}

export function createNoteEditorSession(initialNote?: Note): NoteEditorSession {
  let savedNote = cloneNote(initialNote ?? createEmptyNote())
  let note = cloneNote(savedNote)
  let titleError = ''
  let invalidTodoIds: string[] = []
  const history: NoteHistoryState = createNoteHistoryState()
  const textEdits = createTextEditBuffer(TEXT_EDIT_DELAY)
  let hasPendingTextEdit = false

  function commitTextEdits(): void {
    textEdits.commit()
    hasPendingTextEdit = false
  }

  function findTodo(todoId: string): Todo | undefined {
    return note.todos.find((todo) => todo.id === todoId)
  }

  function clearTodoError(todoId: string): void {
    invalidTodoIds = invalidTodoIds.filter((id) => id !== todoId)
  }

  function updateTitle(value: string): void {
    textEdits.track('title', note.title, value, (previous, next) => {
      recordNoteOperation(history, { type: 'setTitle', previous, next })
    })

    note.title = value
    titleError = ''
    hasPendingTextEdit = true
  }

  function updateTodoText(todoId: string, value: string): void {
    const todo = findTodo(todoId)

    if (!todo) {
      return
    }

    textEdits.track(`todo:${todoId}`, todo.text, value, (previous, next) => {
      recordNoteOperation(history, { type: 'setTodoText', todoId, previous, next })
    })

    todo.text = value
    clearTodoError(todoId)
    hasPendingTextEdit = true
  }

  function addTodo(text: string): boolean {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return false
    }

    commitTextEdits()
    const todo: Todo = { id: createId(), text: trimmedText, completed: false }
    const index = note.todos.length

    note.todos.push(cloneTodo(todo))
    recordNoteOperation(history, { type: 'addTodo', index, todo })
    return true
  }

  function removeTodo(todoId: string): void {
    commitTextEdits()
    const index = note.todos.findIndex((todo) => todo.id === todoId)
    const todo = note.todos[index]

    if (!todo) {
      return
    }

    const removedTodo = cloneTodo(todo)
    note.todos.splice(index, 1)
    recordNoteOperation(history, { type: 'removeTodo', index, todo: removedTodo })
    clearTodoError(todoId)
  }

  function toggleTodo(todoId: string): void {
    commitTextEdits()
    const todo = findTodo(todoId)

    if (!todo) {
      return
    }

    const previous = todo.completed
    todo.completed = !previous
    recordNoteOperation(history, { type: 'toggleTodo', todoId, previous, next: todo.completed })
  }

  function stepHistory(step: (history: NoteHistoryState, note: Note) => boolean): boolean {
    commitTextEdits()

    if (!step(history, note)) {
      return false
    }

    titleError = ''
    invalidTodoIds = []
    return true
  }

  function validate(): boolean {
    titleError = note.title.trim() ? '' : TITLE_REQUIRED_ERROR
    invalidTodoIds = note.todos
      .filter((todo) => !todo.text.trim())
      .map((todo) => todo.id)

    return titleError === '' && invalidTodoIds.length === 0
  }

  function forgetPendingEdits(): void {
    textEdits.discard()
    hasPendingTextEdit = false
    clearNoteHistory(history)
  }

  function save(): Note | null {
    textEdits.discard()
    hasPendingTextEdit = false

    if (!validate()) {
      return null
    }

    note.title = note.title.trim()
    note.todos.forEach((todo) => {
      todo.text = todo.text.trim()
    })

    const result = cloneNote(note)
    savedNote = cloneNote(result)
    forgetPendingEdits()
    return result
  }

  function replaceNote(nextNote: Note): void {
    textEdits.discard()
    hasPendingTextEdit = false
    note = cloneNote(nextNote)
    titleError = ''
    invalidTodoIds = []
    clearNoteHistory(history)
  }

  return {
    getNote: () => note,
    getTitleError: () => titleError,
    getInvalidTodoIds: () => invalidTodoIds,
    isDirty: () => !haveSameContent(note, savedNote),
    canUndo: () => history.past.length > 0 || hasPendingTextEdit,
    canRedo: () => history.future.length > 0,
    updateTitle,
    updateTodoText,
    finishTextEdit: commitTextEdits,
    addTodo,
    removeTodo,
    toggleTodo,
    undo: () => stepHistory(undoNoteOperation),
    redo: () => stepHistory(redoNoteOperation),
    save,
    cancel: forgetPendingEdits,
    replaceNote,
    dispose: () => {
      textEdits.discard()
      hasPendingTextEdit = false
    }
  }
}
