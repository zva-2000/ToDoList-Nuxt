import type { Todo } from './notes'

export type NoteOperation =
  | { type: 'setTitle', previous: string, next: string }
  | { type: 'addTodo', index: number, todo: Todo }
  | { type: 'removeTodo', index: number, todo: Todo }
  | { type: 'setTodoText', todoId: string, previous: string, next: string }
  | { type: 'toggleTodo', todoId: string, previous: boolean, next: boolean }

export interface NoteHistoryState {
  past: NoteOperation[]
  future: NoteOperation[]
}
