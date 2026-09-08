<script setup lang="ts">
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  closeOnBackdrop?: boolean
}>(), {
  closeOnBackdrop: true,
  description: ''
})

const emit = defineEmits<{
  close: []
  'update:modelValue': [value: boolean]
}>()

const slots = useSlots()
const titleId = useId()
const descriptionId = useId()
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const describedBy = computed(() => (props.description || slots.default ? descriptionId : undefined))

let activator: HTMLElement | null = null
let previousBodyOverflow = ''

function isVisible(element: HTMLElement): boolean {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
}

function getFocusableElements(): HTMLElement[] {
  if (!panelRef.value) {
    return []
  }

  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => element.tabIndex >= 0 && isVisible(element))
}

function focusElement(element: HTMLElement | null | undefined): void {
  element?.focus({ preventScroll: true })
}

function resolveInitialFocus(): HTMLElement | null {
  const marked = panelRef.value?.querySelector<HTMLElement>('[data-initial-focus]')

  if (marked && isVisible(marked)) {
    return marked
  }

  return getFocusableElements()[0] ?? panelRef.value
}

function restoreFocus(): void {
  const previouslyFocused = activator
  activator = null

  requestAnimationFrame(() => {
    if (previouslyFocused && document.contains(previouslyFocused)) {
      focusElement(previouslyFocused)
      return
    }

    focusElement(document.querySelector<HTMLElement>('main h1'))
  })
}

function setBackgroundInert(inert: boolean): void {
  const appRoot = document.getElementById('__nuxt')

  if (appRoot) {
    appRoot.inert = inert
  }
}

function lockPage(): void {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  setBackgroundInert(true)
}

function unlockPage(): void {
  document.body.style.overflow = previousBodyOverflow
  setBackgroundInert(false)
}

function requestClose(): void {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdropClick(): void {
  if (props.closeOnBackdrop) {
    requestClose()
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.modelValue) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    requestClose()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = getFocusableElements()

  if (focusableElements.length === 0) {
    event.preventDefault()
    focusElement(panelRef.value)
    return
  }

  const first = focusableElements[0]
  const last = focusableElements.at(-1)
  const activeElement = document.activeElement
  const isLeavingTrap = !panelRef.value?.contains(activeElement)

  if (event.shiftKey && (activeElement === first || isLeavingTrap)) {
    event.preventDefault()
    focusElement(last)
    return
  }

  if (!event.shiftKey && (activeElement === last || isLeavingTrap)) {
    event.preventDefault()
    focusElement(first)
  }
}

function onFocusIn(event: FocusEvent): void {
  if (!props.modelValue || !rootRef.value) {
    return
  }

  const target = event.target

  if (!(target instanceof Node) || rootRef.value.contains(target)) {
    return
  }

  focusElement(resolveInitialFocus())
}

function bindGlobalEvents(): void {
  window.addEventListener('keydown', onKeydown, true)
  document.addEventListener('focusin', onFocusIn)
}

function unbindGlobalEvents(): void {
  window.removeEventListener('keydown', onKeydown, true)
  document.removeEventListener('focusin', onFocusIn)
}

async function openModal(): Promise<void> {
  const activeElement = document.activeElement
  activator = activeElement instanceof HTMLElement ? activeElement : null
  lockPage()
  await nextTick()
  focusElement(resolveInitialFocus())
  bindGlobalEvents()
}

function closeModal(): void {
  unbindGlobalEvents()
  unlockPage()
  restoreFocus()
}

watch(() => props.modelValue, (isOpen, wasOpen) => {
  if (isOpen) {
    void openModal()
    return
  }

  if (wasOpen) {
    closeModal()
  }
}, { flush: 'post', immediate: true })

onBeforeUnmount(() => {
  if (props.modelValue) {
    closeModal()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      ref="rootRef"
      class="app-modal"
    >
      <div
        class="app-modal__backdrop"
        aria-hidden="true"
        @click="onBackdropClick"
      />
      <div
        ref="panelRef"
        class="app-modal__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="describedBy"
        tabindex="-1"
      >
        <h2 :id="titleId" class="app-modal__title">{{ title }}</h2>
        <div :id="descriptionId" class="app-modal__body">
          <slot>
            <p v-if="description" class="app-modal__description">{{ description }}</p>
          </slot>
        </div>
        <div v-if="$slots.footer" class="app-modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.app-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.app-modal__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgb(30 36 48 / 48%);
}

.app-modal__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 28rem);
  padding: 1.5rem;
  border: 1px solid $color-border;
  border-radius: $radius-large;
  background-color: $color-surface;
  box-shadow: 0 1rem 2.5rem rgb(30 36 48 / 16%);
}

.app-modal__title {
  margin: 0;
  color: $color-text;
  font-size: 1.25rem;
  line-height: 1.3;
}

.app-modal__body {
  margin-top: 0.75rem;
}

.app-modal__description {
  margin: 0;
  color: $color-text-muted;
  line-height: 1.5;
}

.app-modal__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
