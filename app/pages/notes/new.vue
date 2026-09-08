<script setup lang="ts">
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import NoteEditor from '~/components/notes/NoteEditor.vue'
import { useNotesStore } from '~/stores/notes'

const notesStore = useNotesStore()
const editor = useNoteEditor()
const {
  isCancelConfirmOpen,
  goToList,
  leaveWithoutSaving,
  requestCancel,
  focusFirstInvalidField
} = useNoteEditorPage(editor)

async function saveNote(): Promise<void> {
  const note = editor.save()

  if (!note) {
    await focusFirstInvalidField()
    return
  }

  notesStore.addNote(note)
  await goToList()
}
</script>

<template>
  <section aria-labelledby="new-note-title">
    <PageHeader
      title-id="new-note-title"
      title="Новая заметка"
      description="Добавьте название и задачи, затем сохраните заметку."
    />

    <NoteEditor
      :editor="editor"
      @save="saveNote"
      @cancel="requestCancel"
    />

    <ConfirmModal
      :model-value="editor.restorableDraft !== null"
      title="Восстановить черновик?"
      description="Найдены несохранённые изменения предыдущей сессии."
      confirm-label="Восстановить"
      cancel-label="Начать заново"
      confirm-variant="primary"
      @confirm="editor.restoreDraft"
      @cancel="editor.discardDraft"
    />

    <ConfirmModal
      v-model="isCancelConfirmOpen"
      title="Отменить создание заметки?"
      description="Все несохранённые изменения будут удалены."
      confirm-label="Удалить черновик"
      cancel-label="Продолжить"
      @confirm="leaveWithoutSaving"
    />
  </section>
</template>
