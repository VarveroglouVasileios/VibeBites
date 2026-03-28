<script setup lang="ts">
const isVisible = ref(false)

// Use a separate key for testing if needed, or ensure it's clear
const CONSENT_KEY = 'vibebites-cookie-consent-v1'

onMounted(() => {
  const consent = sessionStorage.getItem(CONSENT_KEY)
  if (!consent) {
    isVisible.value = true
  }
})

function acceptAll() {
  saveConsent({ necessary: true, analytics: true, marketing: true })
}

function acceptNecessary() {
  saveConsent({ necessary: true, analytics: false, marketing: false })
}

function saveConsent(preferences: { necessary: boolean, analytics: boolean, marketing: boolean }) {
  sessionStorage.setItem(CONSENT_KEY, JSON.stringify({
    ...preferences,
    timestamp: new Date().toISOString()
  }))
  isVisible.value = false
}
</script>

<template>
  <div 
    v-if="isVisible" 
    class="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 flex justify-center"
  >
    <div class="w-full max-w-5xl bg-white dark:bg-surface-900 border-2 border-brand-500 shadow-[0_20px_50px_rgba(249,115,22,0.3)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 animate-slide-up">
      <div class="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl">
        🍪
      </div>
      
      <div class="flex-1 text-center md:text-left">
        <h3 class="font-display font-bold text-xl text-surface-900 dark:text-white mb-2">Φρεσκοψημένα Cookies!</h3>
        <p class="text-sm text-surface-600 dark:text-surface-400 leading-relaxed max-w-2xl">
          Χρησιμοποιούμε cookies για να σας προσφέρουμε την καλύτερη δυνατή εμπειρία στη σελίδα μας. 
          Τα απαραίτητα cookies βοηθούν στη λειτουργία του site, ενώ τα cookies ανάλυσης μας επιτρέπουν να γινόμαστε καλύτεροι.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <button 
          @click="acceptNecessary"
          class="px-6 py-3 rounded-xl text-sm font-bold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-surface-200 dark:border-surface-700"
        >
          Απαραίτητα Μόνο
        </button>
        <button 
          @click="acceptAll"
          class="px-8 py-3 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-glow hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
        >
          Αποδοχή όλων
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
