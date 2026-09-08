import type { NoteEditorController } from '~/types/editor'
import type { NoteHistoryState } from '~/types/history'
import type { Note, Todo } from '~/types/notes'
import { createId } from '~/utils/ids'
import { cloneNote, cloneTodo } from '~/utils/noteClone'
import {
  clearNoteHistory,
  createNoteHistoryState,
  recordNoteOperation,
  redoNoteOperation,
  undoNoteOperation
} from '~/utils/noteHistory'
import { createTextEditBuffer } from '~/utils/textEditBuffer'

const TEXT_EDIT_DELAY = 500
const NEW_NOTE_ROUTE_KEY = 'new'
const TITLE_REQUIRED_ERROR = 'Введите название заметки.'

interface UseNoteEditorOptions {
  initialNote?: Note
  routeKey?: string
}

interface EditorState {
  note: Note
  titleError: string
  invalidTodoIds: string[]
}

function createEmptyNote(): Note {
  return {
    id: createId(),
    title: '',
    todos: []
  }
}

function haveSameContent(first: Note, second: Note): boolean {
  return first.title === second.title
    && first.todos.length === second.todos.length
    && first.todos.every((todo, index) => {
      const other = second.todos[index]

      return other !== undefined
        && other.id === todo.id
        && other.text === todo.text
        && other.completed === todo.completed
    })
}

export function useNoteEditor(options: UseNoteEditorOptions = {}): NoteEditorController {
  const savedNote = shallowRef(cloneNote(options.initialNote ?? createEmptyNote()))
  const state = reactive<EditorState>({
    note: cloneNote(savedNote.value),
    titleError: '',
    invalidTodoIds: []
  })
  const history = reactive<NoteHistoryState>(createNoteHistoryState())
  const draft = useNoteDraft(options.routeKey ?? NEW_NOTE_ROUTE_KEY)
  const textEdits = createTextEditBuffer(TEXT_EDIT_DELAY)
  const isDirty = computed(() => !haveSameContent(state.note, savedNote.value))

  function syncDraft(): void {
    if (isDirty.value) {
      draft.schedule(state.note)
    } else {
      draft.clear()
    }
  }

  function findTodo(todoId: string): Todo | undefined {
    return state.note.todos.find((todo) => todo.id === todoId)
  }

  function clearTodoError(todoId: string): void {
    state.invalidTodoIds = state.invalidTodoIds.filter((id) => id !== todoId)
  }

  function updateTitle(value: string): void {
    textEdits.track('title', state.note.title, value, (previous, next) => {
      recordNoteOperation(history, { type: 'setTitle', previous, next })
    })

    state.note.title = value
    state.titleError = ''
    syncDraft()
  }

  function updateTodoText(todoId: string, value: string): void {
    const todo = findTodo(todoId)

    if (!todo) {
      return
    }

    textEdits.track(`todo:${todoId}`, todo.text, value, (previous, next) => {
      recordNoteOperation(history, { type: 'setTodoText', todoId, previous, next })
    })

    todo.text = value
    clearTodoError(todoId)
    syncDraft()
  }

  function addTodo(text: string): void {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    textEdits.commit()
    const todo: Todo = { id: createId(), text: trimmedText, completed: false }
    const index = state.note.todos.length

    state.note.todos.push(cloneTodo(todo))
    recordNoteOperation(history, { type: 'addTodo', index, todo })
    syncDraft()
  }

  function removeTodo(todoId: string): void {
    textEdits.commit()
    const index = state.note.todos.findIndex((todo) => todo.id === todoId)
    const todo = state.note.todos[index]

    if (!todo) {
      return
    }

    const removedTodo = cloneTodo(todo)
    state.note.todos.splice(index, 1)
    recordNoteOperation(history, { type: 'removeTodo', index, todo: removedTodo })
    clearTodoError(todoId)
    syncDraft()
  }

  function toggleTodo(todoId: string): void {
    textEdits.commit()
    const todo = findTodo(todoId)

    if (!todo) {
      return
    }

    const previous = todo.completed
    todo.completed = !previous
    recordNoteOperation(history, { type: 'toggleTodo', todoId, previous, next: todo.completed })
    syncDraft()
  }

  function stepHistory(step: (history: NoteHistoryState, note: Note) => boolean): boolean {
    textEdits.commit()

    if (!step(history, state.note)) {
      return false
    }

    state.titleError = ''
    state.invalidTodoIds = []
    syncDraft()
    return true
  }

  function validate(): boolean {
    state.titleError = state.note.title.trim() ? '' : TITLE_REQUIRED_ERROR
    state.invalidTodoIds = state.note.todos
      .filter((todo) => !todo.text.trim())
      .map((todo) => todo.id)

    return state.titleError === '' && state.invalidTodoIds.length === 0
  }

  function forgetPendingEdits(): void {
    textEdits.discard()
    clearNoteHistory(history)
    draft.clear()
  }

  function save(): Note | null {
    textEdits.discard()

    if (!validate()) {
      return null
    }

    state.note.title = state.note.title.trim()
    state.note.todos.forEach((todo) => {
      todo.text = todo.text.trim()
    })

    const result = cloneNote(state.note)
    savedNote.value = cloneNote(result)
    forgetPendingEdits()
    return result
  }

  function restoreDraft(): void {
    const draftNote = draft.restorable.value

    if (!draftNote) {
      return
    }

    textEdits.discard()
    state.note = cloneNote(draftNote)
    state.titleError = ''
    state.invalidTodoIds = []
    clearNoteHistory(history)
    draft.forget()
    syncDraft()
  }

  function discardDraft(): void {
    draft.forget()
    draft.clear()
  }

  const editor: NoteEditorController = {
    get note() {
      return state.note
    },
    get titleError() {
      return state.titleError
    },
    get invalidTodoIds() {
      return state.invalidTodoIds
    },
    get restorableDraft() {
      return draft.restorable.value
    },
    get isDirty() {
      return isDirty.value
    },
    get canUndo() {
      return history.past.length > 0
    },
    get canRedo() {
      return history.future.length > 0
    },
    updateTitle,
    updateTodoText,
    finishTextEdit: textEdits.commit,
    addTodo,
    removeTodo,
    toggleTodo,
    undo: () => stepHistory(undoNoteOperation),
    redo: () => stepHistory(redoNoteOperation),
    save,
    cancel: forgetPendingEdits,
    restoreDraft,
    discardDraft
  }

  useUndoRedoShortcut(editor)
  onBeforeUnmount(textEdits.discard)

  return editor
}
