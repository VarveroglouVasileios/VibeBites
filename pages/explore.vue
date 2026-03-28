<script setup lang="ts">
useHead({ title: 'Explore · Culinary Curator' })
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-12 text-center">
    <img
      src="/stitch/assistant.png"
      alt=""
      class="mx-auto mb-8 max-h-64 rounded-3xl object-cover shadow-ambient"
    >
    <h1 class="font-headline text-3xl font-bold text-on-surface">
      Explore
    </h1>
    <p class="mt-4 text-on-surface-variant">
      Full search and social feed will hook into Supabase <code class="rounded bg-surface-container px-1 text-sm">search_recipes</code>.
      For now, browse the
      <NuxtLink
        to="/"
        class="font-semibold text-primary underline"
      >home feed</NuxtLink>
      or open
      <NuxtLink
        to="/recipes/demo"
        class="font-semibold text-primary underline"
      >the demo recipe</NuxtLink>.
    </p>
  </div>
</template>
