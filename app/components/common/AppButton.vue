<script setup lang="ts">
import { NuxtLink } from '#components'

type ButtonType = 'button' | 'reset' | 'submit'
type ButtonVariant = 'primary' | 'secondary' | 'danger'

const props = withDefaults(defineProps<{
  to?: string
  type?: ButtonType
  variant?: ButtonVariant
  disabled?: boolean
  ariaLabel?: string
}>(), {
  ariaLabel: '',
  disabled: false,
  to: '',
  type: 'button',
  variant: 'primary'
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <NuxtLink
    v-if="props.to"
    v-bind="$attrs"
    class="app-button"
    :class="`app-button--${props.variant}`"
    :to="props.to"
    :aria-label="props.ariaLabel || undefined"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    v-bind="$attrs"
    class="app-button"
    :class="`app-button--${props.variant}`"
    :type="props.type"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel || undefined"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;
@use '~/assets/scss/mixins' as *;

.app-button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1rem;
  border: 1px solid transparent;
  border-radius: $radius-small;
  font-weight: 600;
  line-height: 1.25;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.app-button--primary {
  background-color: $color-accent;
  color: $color-surface;

  &:hover,
  &:focus-visible {
    background-color: #394cc3;
  }
}

.app-button--secondary {
  border-color: $color-border-strong;
  background-color: $color-surface;
  color: $color-text;

  &:hover,
  &:focus-visible {
    border-color: $color-accent;
    background-color: $color-border;
  }
}

.app-button--danger {
  background-color: $color-danger;
  color: $color-surface;

  &:hover,
  &:focus-visible {
    background-color: $color-danger-hover;
  }
}
</style>
