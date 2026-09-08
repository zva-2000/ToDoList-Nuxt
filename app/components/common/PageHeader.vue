<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description: string
  titleId?: string
}>(), {
  titleId: ''
})
</script>

<template>
  <header class="page-header">
    <div>
      <h1
        :id="props.titleId || undefined"
        class="page-header__title"
        tabindex="-1"
      >
        {{ title }}
      </h1>
      <p class="page-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.page-header__title {
  margin: 0;
  color: $color-text;
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  line-height: 1.15;
}

.page-header__description {
  max-width: 40rem;
  margin: 0.625rem 0 0;
  color: $color-text-muted;
  line-height: 1.5;
}

.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (min-width: $breakpoint-tablet) {
  .page-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .page-header__actions {
    flex-shrink: 0;
  }
}
</style>
