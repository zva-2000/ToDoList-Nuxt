<script setup lang="ts">
import AppButton from '~/components/common/AppButton.vue'
import AppTextField from '~/components/common/AppTextField.vue'
import type { Todo } from '~/types/notes'

defineProps<{
  todo: Todo
  index: number
  error: string
}>()

defineEmits<{
  blur: []
  remove: []
  toggle: []
  'update:text': [value: string]
}>()
</script>

<template>
  <li class="todo-editor-item">
    <span class="todo-editor-item__check">
      <input
        type="checkbox"
        :checked="todo.completed"
        :aria-label="`Отметить задачу ${index + 1} выполненной`"
        @change="$emit('toggle')"
      >
    </span>

    <AppTextField
      :id="`todo-${todo.id}`"
      :model-value="todo.text"
      :label="`Задача ${index + 1}`"
      visually-hide-label
      multiline
      rows="2"
      :error="error"
      autocomplete="off"
      @update:model-value="$emit('update:text', $event)"
      @blur="$emit('blur')"
    />

    <AppButton
      class="todo-editor-item__remove"
      variant="secondary"
      :aria-label="`Удалить задачу ${index + 1}`"
      title="Удалить задачу"
      @click="$emit('remove')"
    >
      <span aria-hidden="true">×</span>
    </AppButton>
  </li>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.todo-editor-item {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
  gap: 0.5rem;
  align-items: start;
  padding-block: 0.25rem;
}

.todo-editor-item__check {
  display: grid;
  height: 3rem;
  place-items: center;

  input {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: $color-accent;
  }
}

.todo-editor-item__remove {
  width: 2.5rem;
  min-height: 3rem;
  padding: 0;
  font-size: 1.4rem;
  line-height: 1;
}
</style>
