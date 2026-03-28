<script setup lang="ts">
useHead({ title: 'Σχετικά με εμάς' })
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="glass p-8 md:p-12 animate-fade-in text-center">
      <div class="mb-8 flex justify-center">
        <span class="text-6xl" aria-hidden="true">🍽️</span>
      </div>
      
      <h1 class="font-display text-3xl md:text-5xl font-bold text-surface-900 dark:text-white mb-6">
        Η Αποστολή του <span class="gradient-text">VibeBites</span>
      </h1>
      
      <div class="prose dark:prose-invert prose-brand max-w-2xl mx-auto text-lg text-surface-600 dark:text-surface-400 space-y-6">
        <p>
          Το VibeBites ξεκίνησε με μια απλή ιδέα: η μαγειρική δεν πρέπει να είναι μια μοναχική δουλειά, αλλά μια κοινωνική εμπειρία γεμάτη έμπνευση.
        </p>
        <p>
          Συνδυάζουμε την τελευταία λέξη της τεχνολογίας (Τεχνητή Νοημοσύνη) με την αγάπη για το καλό φαγητό. Ο AI Βοηθός μας είναι εδώ για να σας βοηθήσει να αξιοποιήσετε ό,τι έχετε στο ψυγείο σας, μειώνοντας τη σπατάλη τροφίμων και ανακαλύπτοντας νέες γεύσεις.
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12">
          <div class="space-y-2">
            <span class="text-3xl" aria-hidden="true">🤝</span>
            <h3 class="font-bold text-surface-900 dark:text-white">Κοινότητα</h3>
            <p class="text-sm">Μοιραζόμαστε συνταγές και μυστικά.</p>
          </div>
          <div class="space-y-2">
            <span class="text-3xl" aria-hidden="true">🤖</span>
            <h3 class="font-bold text-surface-900 dark:text-white">Καινοτομία</h3>
            <p class="text-sm">AI που καταλαβαίνει τις ανάγκες σας.</p>
          </div>
          <div class="space-y-2">
            <span class="text-3xl" aria-hidden="true">🌿</span>
            <h3 class="font-bold text-surface-900 dark:text-white">Βιωσιμότητα</h3>
            <p class="text-sm">Λιγότερη σπατάλη, καλύτερο φαγητό.</p>
          </div>
        </div>

        <p class="font-medium text-brand-500">
          Σας ευχαριστούμε που είστε μέρος της κοινότητάς μας!
        </p>
      </div>
    </div>
  </div>
</template>
