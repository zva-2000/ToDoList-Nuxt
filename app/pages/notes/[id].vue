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

const route = useRoute()
const notesStore = useNotesStore()
const noteId = typeof route.params.id === 'string' ? route.params.id : ''
const storedNote = computed(() => notesStore.noteById(noteId))
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

watch(storedNote, (note) => {
  if (initialNote && !note && !isDeletingHere) {
    wasDeletedElsewhere.value = true
    isCancelConfirmOpen.value = false
    isDeleteConfirmOpen.value = false
  }
})

async function saveNote(): Promise<void> {
  if (!storedNote.value) {
    wasDeletedElsewhere.value = true
    return
  }

  const note = editor.save()

  if (!note) {
    await focusFirstInvalidField()
    return
  }

  notesStore.updateNote(note)
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
  <section v-if="initialNote && !wasDeletedElsewhere" aria-labelledby="edit-note-title">
    <PageHeader
      title-id="edit-note-title"
      :title="editor.note.title || 'Редактирование заметки'"
      description="Измените название или задачи и сохраните результат."
    />

    <NoteEditor
      :editor="editor"
      show-delete
      @save="saveNote"
      @cancel="requestCancel"
      @delete="isDeleteConfirmOpen = true"
    />

    <ConfirmModal
      :model-value="editor.restorableDraft !== null"
      title="Восстановить черновик?"
      description="Найдены несохранённые изменения этой заметки."
      confirm-label="Восстановить"
      cancel-label="Продолжить без него"
      confirm-variant="primary"
      @confirm="editor.restoreDraft"
      @cancel="editor.discardDraft"
    />

    <ConfirmModal
      v-model="isCancelConfirmOpen"
      title="Отменить редактирование?"
      description="Все несохранённые изменения будут удалены."
      confirm-label="Отменить"
      cancel-label="Продолжить"
      @confirm="leaveWithoutSaving"
    />

    <ConfirmModal
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
