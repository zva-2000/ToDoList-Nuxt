<script setup lang="ts">
import NotePreviewCard from './NotePreviewCard.vue'
import type { Note } from '~/types/notes'

defineProps<{
  notes: Note[]
}>()

const emit = defineEmits<{
  delete: [note: Note]
}>()
</script>

<template>
  <ul class="notes-list" aria-label="Список заметок">
    <li v-for="note in notes" :key="note.id">
      <NotePreviewCard
        :note="note"
        @delete="emit('delete', note)"
      />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.notes-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notes-list > li {
  min-width: 0;
}

@media (min-width: $breakpoint-tablet) {
  .notes-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 70rem) {
  .notes-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
