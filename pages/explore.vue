<script setup lang="ts">
useHead({ title: 'Εξερεύνηση' })
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div class="relative inline-block mb-12 animate-float">
      <div class="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full" />
      <img
        src="/pwa-512x512.png"
        alt="Explore"
        class="relative z-10 mx-auto max-h-64 rounded-[2rem] object-cover shadow-2xl"
      >
    </div>
    
    <h1 class="font-display text-4xl font-extrabold text-surface-900 dark:text-white mb-4">
      Ανακάλυψε Νέες Γεύσεις
    </h1>
    <p class="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Ετοιμάζουμε ένα μοναδικό social feed για να βλέπεις τι μαγειρεύει η κοινότητα. 
      Για την ώρα, μπορείς να δεις τις trending συνταγές μας!
    </p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <NuxtLink to="/recipes" class="btn-glow">
        🔍 Όλες οι Συνταγές
      </NuxtLink>
      <NuxtLink to="/ai-assistant" class="btn-secondary">
        🤖 AI Βοηθός Ψυγείου
      </NuxtLink>
    </div>
  </div>
</template>
