<script setup lang="ts">
import { PageHeader, EmptyState, AppButton } from '~/components/common/'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import NotesList from '~/components/notes/NotesList.vue'
import { useNotesStore } from '~/stores/notes'
import type { Note } from '~/types/notes'

const notesStore = useNotesStore()
const pendingNote = ref<Note | null>(null)

const isConfirmOpen = computed({
  get: () => pendingNote.value !== null,
  set: (isOpen) => {
    if (!isOpen) {
      pendingNote.value = null
    }
  }
})

const confirmTitle = 'Удалить заметку?'
const confirmDescription = computed(() => {
  const title = pendingNote.value?.title ?? 'эту заметку'
  return `Заметка «${title}» будет удалена. Это действие нельзя отменить.`
})

function requestDelete(note: Note): void {
  pendingNote.value = note
}

function confirmDelete(): void {
  if (!pendingNote.value) {
    return
  }

  notesStore.deleteNote(pendingNote.value.id)
  pendingNote.value = null
}
</script>

<template>
  <section aria-labelledby="notes-page-title">
    <PageHeader
      id="notes-page-title"
      title="Заметки"
      description="Храните задачи и планы в одном месте."
    >
      <template #actions>
        <AppButton to="/notes/new">Создать заметку</AppButton>
      </template>
    </PageHeader>

    <NotesList
      v-if="notesStore.notes.length"
      :notes="notesStore.notes"
      @delete="requestDelete"
    />

    <EmptyState
      v-else
      title="Заметок пока нет"
      description="Создайте первую заметку, чтобы добавить задачи и планы."
    >
    </EmptyState>

    <ConfirmModal
      v-model="isConfirmOpen"
      :title="confirmTitle"
      :description="confirmDescription"
      confirm-label="Удалить"
      cancel-label="Отмена"
      @confirm="confirmDelete"
    />
  </section>
</template>
