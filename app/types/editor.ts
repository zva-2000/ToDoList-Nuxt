import type { Note } from './notes'

export interface NoteEditorController {
  readonly note: Note
  readonly titleError: string
  readonly invalidTodoIds: readonly string[]
  readonly restorableDraft: Note | null
  readonly isDirty: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
  updateTitle(value: string): void
  updateTodoText(todoId: string, value: string): void
  finishTextEdit(): void
  addTodo(text: string): void
  removeTodo(todoId: string): void
  toggleTodo(todoId: string): void
  undo(): boolean
  redo(): boolean
  save(): Note | null
  cancel(): void
  restoreDraft(): void
  discardDraft(): void
}
