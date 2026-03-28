<script setup lang="ts">
useHead({ title: 'Saved · Culinary Curator' })
</script>

<template>
  <div class="mx-auto max-w-lg px-6 py-16 text-center">
    <span class="material-symbols-outlined text-5xl text-on-surface-variant">bookmark</span>
    <h1 class="mt-6 font-headline text-2xl font-bold text-on-surface">
      Saved recipes
    </h1>
    <p class="mt-3 text-on-surface-variant">
      Sign in with Supabase Auth to sync saved recipes across devices.
    </p>
    <NuxtLink
      to="/recipes/demo"
      class="mt-8 inline-block rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-on-primary"
    >
      Open demo recipe
    </NuxtLink>
  </div>
</template>
