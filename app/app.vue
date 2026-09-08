<script setup lang="ts">
import { AppShell } from '~/components/common'
</script>

<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <AppShell>
      <NuxtPage />
    </AppShell>
  </div>
</template>
