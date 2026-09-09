export const NEW_TODO_FIELD_ID = 'new-todo'

export type HistoryShortcut = 'undo' | 'redo'

interface HistoryShortcutEvent {
  altKey: boolean
  code: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export function getHistoryShortcut(event: HistoryShortcutEvent): HistoryShortcut | null {
  const isModified = event.ctrlKey || event.metaKey

  if (!isModified || event.altKey || event.code !== 'KeyZ') {
    return null
  }

  return event.shiftKey ? 'redo' : 'undo'
}

export function shouldUseNativeFieldHistory(target: EventTarget | null): boolean {
  return typeof HTMLElement !== 'undefined'
    && target instanceof HTMLElement
    && (target.matches('input, textarea') || target.isContentEditable)
}
