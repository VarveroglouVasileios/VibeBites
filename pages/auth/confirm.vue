<script setup lang="ts">
useHead({ title: 'Email επιβεβαίωση' })
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="glass p-8 max-w-md w-full text-center animate-scale-in">
      <span class="text-5xl" aria-hidden="true">✅</span>
      <h1 class="mt-4 font-display text-2xl font-bold text-surface-900 dark:text-white">
        Email επιβεβαιώθηκε!
      </h1>
      <p class="mt-2 text-surface-500">Ο λογαριασμός σου είναι έτοιμος.</p>
      <NuxtLink to="/auth/login" class="btn-glow mt-6 inline-block">
        🚀 Σύνδεση
      </NuxtLink>
    </div>
  </div>
</template>
