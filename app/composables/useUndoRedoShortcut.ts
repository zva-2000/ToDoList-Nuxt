interface UndoRedoActions {
  undo(): boolean
  redo(): boolean
}

function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    && (target.matches('input, textarea') || target.isContentEditable)
}

export function useUndoRedoShortcut(actions: UndoRedoActions): void {
  function onKeydown(event: KeyboardEvent): void {
    const isHistoryShortcut = event.key.toLowerCase() === 'z'
      && (event.ctrlKey || event.metaKey)
      && !event.altKey

    if (!isHistoryShortcut || isTextEntry(event.target)) {
      return
    }

    if (event.shiftKey ? actions.redo() : actions.undo()) {
      event.preventDefault()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
  })
}
