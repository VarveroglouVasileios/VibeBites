<script setup lang="ts">
import FridgeAssistantPanel from '~/components/fridge/FridgeAssistantPanel.vue'

useHead({
  title: 'AI Fridge Assistant · Culinary Curator',
  meta: [
    { name: 'description', content: 'Turn your ingredients into gourmet recipes with our AI Chef.' }
  ]
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pb-32 pt-24 md:px-10">
    <FridgeAssistantPanel />
  </main>
</template>
