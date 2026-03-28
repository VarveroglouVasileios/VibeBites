<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Toaster position="top-right" rich-colors />
  </NuxtLayout>
</template>
