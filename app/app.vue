<script setup lang="ts">
import AppShell from './components/common/AppShell.vue'
</script>

<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <AppShell>
      <NuxtPage />
    </AppShell>
  </div>
</template>
