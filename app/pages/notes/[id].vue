<script setup lang="ts">
import AppButton from '~/components/common/AppButton.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import NoteEditor from '~/components/notes/NoteEditor.vue'
import { useNotesStore } from '~/stores/notes'

definePageMeta({
  key: (route) => route.fullPath
})

const NEW_NOTE_ID = 'new'

const route = useRoute()
const notesStore = useNotesStore()
const noteId = typeof route.params.id === 'string' ? route.params.id : ''
const isNewNote = noteId === NEW_NOTE_ID
const storedNote = computed(() => (isNewNote ? undefined : notesStore.noteById(noteId)))
const initialNote = storedNote.value
const editor = useNoteEditor({ initialNote, routeKey: noteId })
const {
  isCancelConfirmOpen,
  goToList,
  leaveWithoutSaving,
  requestCancel,
  focusFirstInvalidField
} = useNoteEditorPage(editor)

const isDeleteConfirmOpen = ref(false)
const wasDeletedElsewhere = ref(false)
let isDeletingHere = false

const isEditorVisible = computed(() => isNewNote || (Boolean(initialNote) && !wasDeletedElsewhere.value))

const pageTitle = computed(() => {
  if (isNewNote) {
    return 'Новая заметка'
  }

  return editor.note.title || 'Редактирование заметки'
})

watch(storedNote, (note) => {
  if (initialNote && !note && !isDeletingHere) {
    wasDeletedElsewhere.value = true
    isCancelConfirmOpen.value = false
    isDeleteConfirmOpen.value = false
    editor.cancel()
    editor.discardDraft()
  }
})

onMounted(() => {
  if (!isNewNote && !initialNote) {
    editor.cancel()
    editor.discardDraft()
  }
})

async function saveNote(): Promise<void> {
  if (!isNewNote && !storedNote.value) {
    wasDeletedElsewhere.value = true
    return
  }

  const note = editor.save()

  if (!note) {
    await focusFirstInvalidField()
    return
  }

  if (isNewNote) {
    notesStore.addNote(note)
  } else {
    notesStore.updateNote(note)
  }

  await goToList()
}

async function deleteNote(): Promise<void> {
  isDeletingHere = true
  editor.cancel()
  notesStore.deleteNote(noteId)
  isDeleteConfirmOpen.value = false
  await goToList()
}
</script>

<template>
  <section v-if="isEditorVisible" aria-labelledby="edit-note-title">
    <PageHeader
      title-id="edit-note-title"
      :title="pageTitle"
      :description="isNewNote
        ? 'Добавьте название и задачи, затем сохраните заметку.'
        : 'Измените название или задачи и сохраните результат.'"
    />

    <NoteEditor
      :editor="editor"
      :show-delete="!isNewNote"
      @save="saveNote"
      @cancel="requestCancel"
      @delete="isDeleteConfirmOpen = true"
    />

    <ConfirmModal
      :model-value="editor.restorableDraft !== null"
      title="Восстановить черновик?"
      :description="isNewNote
        ? 'Найдены несохранённые изменения предыдущей сессии.'
        : 'Найдены несохранённые изменения этой заметки.'"
      confirm-label="Восстановить"
      :cancel-label="isNewNote ? 'Начать заново' : 'Продолжить без него'"
      confirm-variant="primary"
      @confirm="editor.restoreDraft"
      @cancel="editor.discardDraft"
    />

    <ConfirmModal
      v-model="isCancelConfirmOpen"
      :title="isNewNote ? 'Отменить создание заметки?' : 'Отменить редактирование?'"
      description="Все несохранённые изменения будут удалены."
      :confirm-label="isNewNote ? 'Удалить черновик' : 'Отменить'"
      cancel-label="Продолжить"
      @confirm="leaveWithoutSaving"
    />

    <ConfirmModal
      v-if="!isNewNote"
      v-model="isDeleteConfirmOpen"
      title="Удалить заметку?"
      description="Заметка и все её задачи будут удалены. Это действие нельзя отменить."
      confirm-label="Удалить"
      cancel-label="Отмена"
      @confirm="deleteNote"
    />
  </section>

  <EmptyState
    v-else-if="wasDeletedElsewhere"
    title="Заметка удалена в другой вкладке"
    description="Редактирование остановлено, потому что этой заметки больше нет."
  >
    <template #actions>
      <AppButton variant="secondary" @click="leaveWithoutSaving">Вернуться к списку</AppButton>
    </template>
  </EmptyState>

  <EmptyState
    v-else
    title="Заметка не найдена"
    description="Возможно, она была удалена или ссылка содержит неверный идентификатор."
  >
    <template #actions>
      <AppButton to="/" variant="secondary">Вернуться к списку</AppButton>
    </template>
  </EmptyState>
</template>
