import type { Note, Todo } from '~/types/notes'

export function cloneTodo(todo: Todo): Todo {
  return { ...todo }
}

export function cloneNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map(cloneTodo)
  }
}

export function cloneNotes(notes: Note[]): Note[] {
  return notes.map(cloneNote)
}
