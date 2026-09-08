import {
  getHistoryShortcut,
  shouldUseNativeFieldHistory
} from '~/utils/historyShortcut'

interface UndoRedoActions {
  undo(): boolean
  redo(): boolean
}

export function useUndoRedoShortcut(actions: UndoRedoActions): void {
  function onKeydown(event: KeyboardEvent): void {
    const shortcut = getHistoryShortcut(event)

    if (
      shortcut === null
      || shouldUseNativeFieldHistory(event.target)
      || document.querySelector('[role="dialog"]')
    ) {
      return
    }

    const applied = shortcut === 'redo' ? actions.redo() : actions.undo()

    if (applied) {
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
