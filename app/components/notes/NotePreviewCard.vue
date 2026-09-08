<script setup lang="ts">
import { NuxtLink } from '#components'
import { AppButton } from '~/components/common'
import { TodoPreview } from '~/components/notes'
import type { Note } from '~/types/notes'

defineProps<{
  note: Note
}>()

defineEmits<{
  delete: []
}>()
</script>

<template>
  <article class="note-card">
    <h2 class="note-card__title">
      <NuxtLink :to="`/notes/${note.id}`">{{ note.title }}</NuxtLink>
    </h2>
    <TodoPreview :todos="note.todos" />
    <footer class="note-card__footer">
      <AppButton :to="`/notes/${note.id}`" variant="secondary">
        Изменить
      </AppButton>
      <AppButton
        variant="secondary"
        :aria-label="`Удалить заметку ${note.title}`"
        @click="$emit('delete')"
      >
        Удалить
      </AppButton>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.note-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 1.25rem;
  border: 1px solid $color-border;
  border-radius: $radius-large;
  background-color: $color-surface;
  box-shadow: 0 0.25rem 0.75rem rgb(30 36 48 / 4%);
}

.note-card__title {
  margin: 0 0 1rem;
  color: $color-text;
  font-size: 1.125rem;
  line-height: 1.3;
}

.note-card__title a {
  text-decoration: none;
}

.note-card__title a:hover {
  color: $color-accent;
  text-decoration: underline;
}

.note-card__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1.25rem;
}
</style>
