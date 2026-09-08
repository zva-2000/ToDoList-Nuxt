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
        <span
          class="todo-preview__check"
          :class="{ 'todo-preview__check--completed': todo.completed }"
          aria-hidden="true"
        />
        <span class="todo-preview__item-text">{{ todo.text }}</span>
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
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  color: $color-text;
  line-height: 1.4;
}

.todo-preview__check {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  border: 1px solid $color-border-strong;
  border-radius: 0.25rem;
  background-color: $color-surface;
  pointer-events: none;
}

.todo-preview__check--completed {
  border-color: $color-accent;
  background-color: $color-accent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3.5 8.5 3 3 6-7'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0.75rem;
}

.todo-preview__item--completed {
  color: $color-text-muted;

  .todo-preview__item-text {
    text-decoration: line-through;
  }
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
