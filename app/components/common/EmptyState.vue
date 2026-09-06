<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="empty-state" aria-labelledby="empty-state-title">
    <div class="empty-state__icon" aria-hidden="true">+</div>
    <h1 id="empty-state-title" class="empty-state__title">{{ title }}</h1>
    <p class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.empty-state {
  width: min(100%, 34rem);
  margin: clamp(2rem, 10vw, 6rem) auto 0;
  padding: clamp(2rem, 8vw, 3.5rem) 1.5rem;
  border: 1px dashed $color-border-strong;
  border-radius: $radius-large;
  background-color: $color-surface;
  text-align: center;
}

.empty-state__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1.25rem;
  place-items: center;
  border-radius: 50%;
  background-color: $color-accent-muted;
  color: $color-accent;
  font-size: 1.75rem;
  line-height: 1;
}

.empty-state__title {
  margin: 0;
  color: $color-text;
  font-size: clamp(1.375rem, 4vw, 1.75rem);
  line-height: 1.2;
}

.empty-state__description {
  max-width: 29rem;
  margin: 0.875rem auto 0;
  color: $color-text-muted;
  line-height: 1.55;
}

.empty-state__actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}
</style>
