<script setup lang="ts">
import { AppButton, AppTextField } from '~/components/common'
import { TodoEditorList } from '~/components/notes'
import type { NoteEditorController } from '~/types/editor'

withDefaults(defineProps<{
  editor: NoteEditorController
  showDelete?: boolean
}>(), {
  showDelete: false
})

defineEmits<{
  cancel: []
  delete: []
  save: []
}>()
</script>

<template>
  <form class="note-editor" novalidate @submit.prevent="$emit('save')">
    <AppTextField
      id="note-title"
      :model-value="editor.note.title"
      label="Название заметки"
      :error="editor.titleError"
      autocomplete="off"
      autofocus
      placeholder="Например, планы на выходные"
      @update:model-value="editor.updateTitle"
      @blur="editor.finishTextEdit"
    />

    <TodoEditorList :editor="editor" />

    <footer class="note-editor__actions">
      <div class="note-editor__history">
        <span class="note-editor__history-label">История</span>
        <AppButton
          class="note-editor__history-button"
          variant="secondary"
          :disabled="!editor.canUndo"
          aria-label="Шаг назад"
          title="Шаг назад — Ctrl или Cmd + Z"
          @click="editor.undo"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M9 7 5 11l4 4" />
            <path d="M5 11h8a6 6 0 0 1 6 6" />
          </svg>
        </AppButton>
        <AppButton
          class="note-editor__history-button"
          variant="secondary"
          :disabled="!editor.canRedo"
          aria-label="Шаг вперёд"
          title="Шаг вперёд — Ctrl или Cmd + Shift + Z"
          @click="editor.redo"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m15 7 4 4-4 4" />
            <path d="M19 11h-8a6 6 0 0 0-6 6" />
          </svg>
        </AppButton>
      </div>

      <div class="note-editor__primary-actions">
        <AppButton variant="secondary" @click="$emit('cancel')">
          Отмена
        </AppButton>
        <AppButton
          v-if="showDelete"
          variant="danger"
          @click="$emit('delete')"
        >
          Удалить
        </AppButton>
        <AppButton type="submit">Сохранить</AppButton>
      </div>
    </footer>
  </form>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.note-editor {
  display: grid;
  gap: 1.5rem;
  padding: clamp(1rem, 4vw, 1.5rem);
  border: 1px solid $color-border;
  border-radius: $radius-large;
  background-color: $color-surface;
}

.note-editor__actions,
.note-editor__history,
.note-editor__primary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.note-editor__actions {
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid $color-border;
}

.note-editor__history-button {
  width: 2.5rem;
  min-height: 2.5rem;
  padding: 0;
  border-radius: 50%;

  svg {
    width: 1.125rem;
    height: 1.125rem;
    fill: none;
    stroke: currentcolor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }
}

.note-editor__history-label {
  align-self: center;
  color: $color-text-muted;
  font-size: 0.875rem;
}

@media (max-width: 32rem) {
  .note-editor__actions,
  .note-editor__history,
  .note-editor__primary-actions {
    width: 100%;
  }

  .note-editor__primary-actions .app-button {
    flex: 1;
  }
}
</style>
