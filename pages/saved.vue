<script setup lang="ts">
useHead({ title: 'Αποθηκευμένα' })
</script>

<template>
  <div class="max-w-lg mx-auto px-6 py-24 text-center animate-scale-in">
    <div class="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
      <span class="material-symbols-outlined text-4xl text-brand-500">bookmark</span>
    </div>
    
    <h1 class="font-display text-3xl font-bold text-surface-900 dark:text-white">
      Αποθηκευμένες Συνταγές
    </h1>
    <p class="mt-4 text-surface-500 dark:text-surface-400 leading-relaxed">
      Σύντομα θα μπορείς να αποθηκεύεις τις αγαπημένες σου συνταγές για να τις βρίσκεις εύκολα σε κάθε συσκευή.
    </p>
    
    <NuxtLink
      to="/recipes"
      class="mt-10 btn-glow inline-block"
    >
      Εξερεύνησε Συνταγές
    </NuxtLink>
  </div>
</template>
