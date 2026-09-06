<script setup lang="ts">
import { NuxtLink } from '#components'
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <div class="shell__container">
        <NuxtLink class="shell__brand" to="/" aria-label="Заметки - главная страница">
          Заметки
        </NuxtLink>
      </div>
    </header>

    <main class="shell__main">
      <div class="shell__container">
        <slot />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.shell__header {
  border-bottom: 1px solid $color-border;
  background-color: $color-surface;
}

.shell__container {
  width: min(100% - 2rem, $content-width);
  margin: 0 auto;
}

.shell__brand {
  display: inline-flex;
  min-height: 4rem;
  align-items: center;
  color: $color-text;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.shell__main {
  display: flex;
  flex: 1;
  align-items: flex-start;
  padding-block: 2rem 3rem;
}

@media (min-width: $breakpoint-tablet) {
  .shell__container {
    width: min(100% - 3rem, $content-width);
  }

  .shell__main {
    padding-block: 3rem 4rem;
  }
}
</style>
