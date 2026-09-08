import type { NoteEditorController } from '~/types/editor'

export function useNoteEditorPage(editor: NoteEditorController) {
  const router = useRouter()
  const isCancelConfirmOpen = ref(false)

  async function goToList(): Promise<void> {
    await router.push('/')
  }

  async function leaveWithoutSaving(): Promise<void> {
    editor.cancel()
    isCancelConfirmOpen.value = false
    await goToList()
  }

  function requestCancel(): void {
    isCancelConfirmOpen.value = true
  }

  async function focusFirstInvalidField(): Promise<void> {
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }

  return {
    isCancelConfirmOpen,
    goToList,
    leaveWithoutSaving,
    requestCancel,
    focusFirstInvalidField
  }
}
