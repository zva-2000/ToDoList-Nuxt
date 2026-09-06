import { defineStore } from 'pinia'
import type { Note, Todo } from '~/types/notes'

interface NotesState {
  notes: Note[]
}

function cloneTodo(todo: Todo): Todo {
  return { ...todo }
}

function cloneNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map(cloneTodo)
  }
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: []
  }),

  getters: {
    noteById: (state) => (id: string): Note | undefined => {
      return state.notes.find((note) => note.id === id)
    }
  },

  actions: {
    addNote(note: Note): void {
      if (this.noteById(note.id)) {
        throw new Error(`Заметка с id "${note.id}" уже существует`)
      }

      this.notes.push(cloneNote(note))
    },

    updateNote(note: Note): boolean {
      const index = this.notes.findIndex((currentNote) => currentNote.id === note.id)

      if (index === -1) {
        return false
      }

      this.notes.splice(index, 1, cloneNote(note))
      return true
    },

    deleteNote(id: string): boolean {
      const index = this.notes.findIndex((note) => note.id === id)

      if (index === -1) {
        return false
      }

      this.notes.splice(index, 1)
      return true
    }
  }
})
