<template>
  <main class="shell">
    <div class="shell__container">
      <slot />
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as *;

.shell {
  display: flex;
  min-height: 100vh;
  align-items: flex-start;
  padding-block: 2rem 3rem;
}

.shell__container {
  width: min(100% - 2rem, $content-width);
  margin: 0 auto;
}

@media (min-width: $breakpoint-tablet) {
  .shell {
    padding-block: 3rem 4rem;
  }

  .shell__container {
    width: min(100% - 3rem, $content-width);
  }
}
</style>
