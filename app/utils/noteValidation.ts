import type { Note, Todo } from '~/types/notes'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTodo(value: unknown): value is Todo {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.text === 'string'
    && typeof value.completed === 'boolean'
}

export function isNote(value: unknown): value is Note {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && Array.isArray(value.todos)
    && value.todos.every(isTodo)
}
