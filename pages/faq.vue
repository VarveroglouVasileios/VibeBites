<script setup lang="ts">
useHead({ title: 'Συχνές Ερωτήσεις' })

const faqs = [
  {
    q: 'Πώς λειτουργεί ο AI Βοηθός Ψυγείου;',
    a: 'Εσείς εισάγετε τα υλικά που έχετε διαθέσιμα, και ο AI μας αναλύει τις πιθανές συνδυαστικές γεύσεις για να σας προτείνει μια ολοκληρωμένη συνταγή, συμπεριλαμβανομένων των θρεπτικών συστατικών (macros).'
  },
  {
    q: 'Είναι η χρήση της πλατφόρμας δωρεάν;',
    a: 'Ναι! Η περιήγηση, η δημιουργία λογαριασμού και η χρήση του AI Βοηθού είναι εντελώς δωρεάν για όλους τους χρήστες μας.'
  },
  {
    q: 'Πώς μπορώ να αποθηκεύσω μια συνταγή;',
    a: 'Αφού συνδεθείτε, μπορείτε να πατήσετε το εικονίδιο της αποθήκευσης σε οποιαδήποτε συνταγή. Θα τη βρείτε στη συνέχεια στο προφίλ σας.'
  },
  {
    q: 'Μπορώ να χρησιμοποιήσω το VibeBites στο κινητό μου;',
    a: 'Φυσικά! Το VibeBites είναι Progressive Web App (PWA). Μπορείτε να το προσθέσετε στην αρχική οθόνη του κινητού σας και να το χρησιμοποιείτε σαν κανονική εφαρμογή, ακόμα και με "Cooking Mode" που κρατά την οθόνη ανοιχτή.'
  },
  {
    q: 'Πώς προστατεύονται τα δεδομένα μου;',
    a: 'Χρησιμοποιούμε τις πιο σύγχρονες τεχνολογίες κρυπτογράφησης μέσω του Supabase. Δεν μοιραζόμαστε τα προσωπικά σας στοιχεία με τρίτους για διαφημιστικούς σκοπούς.'
  }
]
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-12">
      <h1 class="font-display text-3xl md:text-5xl font-bold text-surface-900 dark:text-white mb-4">
        Συχνές Ερωτήσεις
      </h1>
      <p class="text-surface-500">Όλα όσα θέλετε να μάθετε για το VibeBites.</p>
    </div>

    <div class="space-y-4">
      <div v-for="(faq, i) in faqs" :key="i" class="glass p-6 animate-slide-up" :style="{ animationDelay: `${i * 0.1}s` }">
        <h3 class="text-lg font-bold text-surface-900 dark:text-white mb-2 flex items-start gap-3">
          <span class="text-brand-500 font-display">Q.</span>
          {{ faq.q }}
        </h3>
        <div class="flex items-start gap-3 pl-1">
          <span class="text-accent-500 font-display font-bold">A.</span>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">{{ faq.a }}</p>
        </div>
      </div>
    </div>

    <div class="mt-16 text-center glass p-8">
      <h3 class="font-bold text-surface-900 dark:text-white mb-2">Έχετε περισσότερες ερωτήσεις;</h3>
      <p class="text-sm text-surface-500 mb-6">Επικοινωνήστε μαζί μας απευθείας χρησιμοποιώντας τη φόρμα στο υποσέλιδο.</p>
      <a href="#main-content" class="btn-glow inline-block">Μετάβαση στη Φόρμα</a>
    </div>
  </div>
</template>
