import type { NoteEditorController } from '~/types/editor'
import type { Note } from '~/types/notes'
import { cloneNote } from '~/utils/noteClone'
import { createNoteEditorSession } from '~/utils/noteEditorSession'

const NEW_NOTE_ROUTE_KEY = 'new'

interface UseNoteEditorOptions {
  initialNote?: Note
  routeKey?: string
}

export function useNoteEditor(options: UseNoteEditorOptions = {}): NoteEditorController {
  const session = createNoteEditorSession(options.initialNote)
  const draft = useNoteDraft(options.routeKey ?? NEW_NOTE_ROUTE_KEY)
  const view = reactive({
    note: cloneNote(session.getNote()),
    titleError: '',
    invalidTodoIds: [] as string[],
    isDirty: false,
    canUndo: false,
    canRedo: false
  })

  function syncView(): void {
    view.note = cloneNote(session.getNote())
    view.titleError = session.getTitleError()
    view.invalidTodoIds = [...session.getInvalidTodoIds()]
    view.isDirty = session.isDirty()
    view.canUndo = session.canUndo()
    view.canRedo = session.canRedo()
  }

  function syncDraft(): void {
    if (view.isDirty) {
      draft.schedule(view.note)
    } else {
      draft.clear()
    }
  }

  function applyChange(run: () => void): void {
    run()
    syncView()
    syncDraft()
  }

  function undo(): boolean {
    const applied = session.undo()
    syncView()
    syncDraft()
    return applied
  }

  function redo(): boolean {
    const applied = session.redo()
    syncView()
    syncDraft()
    return applied
  }

  function save(): Note | null {
    const result = session.save()
    syncView()

    if (!result) {
      return null
    }

    draft.clear()
    return result
  }

  function restoreDraft(): void {
    const draftNote = draft.restorable.value

    if (!draftNote) {
      return
    }

    session.replaceNote(draftNote)
    draft.forget()
    syncView()
    syncDraft()
  }

  const editor: NoteEditorController = {
    get note() {
      return view.note
    },
    get titleError() {
      return view.titleError
    },
    get invalidTodoIds() {
      return view.invalidTodoIds
    },
    get restorableDraft() {
      return draft.restorable.value
    },
    get isDirty() {
      return view.isDirty
    },
    get canUndo() {
      return view.canUndo
    },
    get canRedo() {
      return view.canRedo
    },
    updateTitle: (value) => {
      applyChange(() => session.updateTitle(value))
    },
    updateTodoText: (todoId, value) => {
      applyChange(() => session.updateTodoText(todoId, value))
    },
    finishTextEdit: () => {
      applyChange(() => session.finishTextEdit())
    },
    addTodo: (text) => {
      applyChange(() => {
        session.addTodo(text)
      })
    },
    removeTodo: (todoId) => {
      applyChange(() => session.removeTodo(todoId))
    },
    toggleTodo: (todoId) => {
      applyChange(() => session.toggleTodo(todoId))
    },
    undo,
    redo,
    save,
    cancel: () => {
      session.cancel()
      draft.clear()
      syncView()
    },
    restoreDraft,
    discardDraft: () => {
      draft.forget()
      draft.clear()
    }
  }

  useUndoRedoShortcut(editor)
  onBeforeUnmount(() => session.dispose())

  return editor
}
