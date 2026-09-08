<script setup lang="ts">
import AppButton from '~/components/common/AppButton.vue'
import AppTextField from '~/components/common/AppTextField.vue'
import TodoEditorItem from './TodoEditorItem.vue'
import type { Todo } from '~/types/notes'
import { NEW_TODO_FIELD_ID } from '~/utils/historyShortcut'

const TODO_REQUIRED_ERROR = 'Введите текст задачи.'

defineProps<{
  todos: readonly Todo[]
  invalidTodoIds: readonly string[]
}>()

const emit = defineEmits<{
  add: [text: string]
  'blur-text': []
  remove: [todoId: string]
  toggle: [todoId: string]
  'update:text': [todoId: string, value: string]
}>()

const newTodoText = ref('')
const newTodoError = ref('')

function onNewTodoInput(value: string): void {
  newTodoText.value = value
  newTodoError.value = ''
}

function addTodo(): void {
  const text = newTodoText.value.trim()

  if (!text) {
    newTodoError.value = TODO_REQUIRED_ERROR
    return
  }

  emit('add', text)
  newTodoText.value = ''
  newTodoError.value = ''
}

function todoError(todoId: string, invalidTodoIds: readonly string[]): string {
  return invalidTodoIds.includes(todoId) ? TODO_REQUIRED_ERROR : ''
}
</script>

<template>
  <section class="todo-editor" aria-labelledby="todo-editor-title">
    <h2 id="todo-editor-title" class="todo-editor__title">Задачи</h2>

    <div class="todo-editor__add">
      <AppTextField
        :id="NEW_TODO_FIELD_ID"
        :model-value="newTodoText"
        label="Новая задача"
        visually-hide-label
        multiline
        rows="2"
        :error="newTodoError"
        autocomplete="off"
        placeholder="Например, купить продукты"
        @update:model-value="onNewTodoInput"
      />
      <AppButton
        class="todo-editor__add-button"
        type="button"
        aria-label="Добавить задачу"
        title="Добавить задачу"
        @click="addTodo"
      >
        <span aria-hidden="true">+</span>
      </AppButton>
    </div>

    <ul v-if="todos.length" class="todo-editor__list">
      <TodoEditorItem
        v-for="(todo, index) in todos"
        :key="todo.id"
        :todo="todo"
        :index="index"
        :error="todoError(todo.id, invalidTodoIds)"
        @update:text="emit('update:text', todo.id, $event)"
        @blur="emit('blur-text')"
        @toggle="emit('toggle', todo.id)"
        @remove="emit('remove', todo.id)"
      />
    </ul>

    <p v-else class="todo-editor__empty">
      Задач пока нет. Добавьте первую задачу выше.
    </p>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.todo-editor {
  display: grid;
  gap: 1rem;
}

.todo-editor__title {
  margin: 0;
  font-size: 1.25rem;
}

.todo-editor__add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: start;
}

.todo-editor__add-button {
  width: 3rem;
  min-height: 3rem;
  padding: 0;
  font-size: 1.5rem;
  line-height: 1;
}

.todo-editor__list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo-editor__empty {
  margin: 0;
  color: $color-text-muted;
}
</style>
