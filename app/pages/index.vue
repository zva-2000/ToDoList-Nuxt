<script setup lang="ts">
import AppButton from '~/components/common/AppButton.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import NotesList from '~/components/notes/NotesList.vue'
import { useNotesStore } from '~/stores/notes'
import type { Note } from '~/types/notes'

const notesStore = useNotesStore()
const noteToDelete = ref<Note | null>(null)

const isConfirmOpen = computed({
  get: () => noteToDelete.value !== null,
  set: (isOpen) => {
    if (!isOpen) {
      noteToDelete.value = null
    }
  }
})

const confirmDescription = computed(() => {
  const title = noteToDelete.value?.title ?? 'эту заметку'
  return `Заметка «${title}» будет удалена. Это действие нельзя отменить.`
})

function confirmDelete(): void {
  if (noteToDelete.value) {
    notesStore.deleteNote(noteToDelete.value.id)
    noteToDelete.value = null
  }
}
</script>

<template>
  <section aria-labelledby="notes-page-title">
    <PageHeader
      title-id="notes-page-title"
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
      @delete="noteToDelete = $event"
    />

    <EmptyState
      v-else
      title="Заметок пока нет"
      description="Создайте первую заметку, чтобы добавить задачи и планы."
    />

    <ConfirmModal
      v-model="isConfirmOpen"
      title="Удалить заметку?"
      :description="confirmDescription"
      confirm-label="Удалить"
      cancel-label="Отмена"
      @confirm="confirmDelete"
    />
  </section>
</template>
