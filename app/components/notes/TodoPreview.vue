<script setup lang="ts">
import type { Todo } from '~/types/notes'

const props = withDefaults(defineProps<{
  todos: Todo[]
  limit?: number
}>(), {
  limit: 3
})

const visibleTodos = computed(() => props.todos.slice(0, props.limit))
const hiddenTodosCount = computed(() => Math.max(props.todos.length - visibleTodos.value.length, 0))
</script>

<template>
  <div class="todo-preview">
    <ul v-if="visibleTodos.length" class="todo-preview__list" aria-label="Задачи заметки">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        class="todo-preview__item"
        :class="{ 'todo-preview__item--completed': todo.completed }"
      >
        {{ todo.text }}
      </li>
    </ul>
    <p v-else class="todo-preview__empty">Нет задач</p>
    <p v-if="hiddenTodosCount" class="todo-preview__more">Ещё задач: {{ hiddenTodosCount }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.todo-preview__list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo-preview__item {
  position: relative;
  padding-left: 0.875rem;
  color: $color-text;
  line-height: 1.4;

  &::before {
    content: '';
    position: absolute;
    top: 0.5em;
    left: 0;
    width: 0.3125rem;
    height: 0.3125rem;
    border-radius: 50%;
    background-color: $color-text;
  }
}

.todo-preview__item--completed {
  color: $color-text-muted;
  text-decoration: line-through;
}

.todo-preview__empty,
.todo-preview__more {
  margin: 0;
  color: $color-text-muted;
  font-size: 0.9375rem;
}

.todo-preview__more {
  margin-top: 0.75rem;
}
</style>
