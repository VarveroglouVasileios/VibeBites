<script setup lang="ts">
useHead({ title: 'Πολιτική Απορρήτου' })
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="glass p-8 md:p-12 animate-fade-in">
      <h1 class="font-display text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-8">
        Πολιτική Απορρήτου (GDPR)
      </h1>
      
      <div class="prose dark:prose-invert prose-brand max-w-none space-y-8 text-surface-600 dark:text-surface-400">
        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">1. Εισαγωγή</h2>
          <p>
            Στο VibeBites, η προστασία των προσωπικών σας δεδομένων είναι προτεραιότητά μας. Η παρούσα Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα δεδομένα σας σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">2. Δεδομένα που Συλλέγουμε</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Δεδομένα Λογαριασμού:</strong> Email, όνομα χρήστη και κωδικός πρόσβασης (μέσω Supabase Auth).</li>
            <li><strong>Προφίλ Χρήστη:</strong> Ονοματεπώνυμο και φωτογραφία προφίλ (προαιρετικά).</li>
            <li><strong>Περιεχόμενο Χρήστη:</strong> Συνταγές, φωτογραφίες φαγητών, σχόλια και αξιολογήσεις που δημοσιεύετε.</li>
            <li><strong>Τεχνικά Δεδομένα:</strong> Διεύθυνση IP, τύπος προγράμματος περιήγησης και δεδομένα χρήσης μέσω cookies για τη λειτουργία της εφαρμογής (PWA).</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">3. Σκοπός Επεξεργασίας</h2>
          <p>Χρησιμοποιούμε τα δεδομένα σας για:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Τη δημιουργία και διαχείριση του λογαριασμού σας.</li>
            <li>Τη λειτουργία του AI Βοηθού (τα υλικά που εισάγετε στέλνονται ανώνυμα στο Groq API).</li>
            <li>Την κοινοποίηση των συνταγών σας στην κοινότητα.</li>
            <li>Τη βελτίωση των υπηρεσιών μας και την τεχνική υποστήριξη.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">4. Τα Δικαιώματά σας</h2>
          <p>Σύμφωνα με το GDPR, έχετε τα εξής δικαιώματα:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Δικαίωμα Πρόσβασης:</strong> Μπορείτε να ζητήσετε αντίγραφο των δεδομένων σας.</li>
            <li><strong>Δικαίωμα Διόρθωσης:</strong> Μπορείτε να αλλάξετε τα στοιχεία σας μέσω του προφίλ σας.</li>
            <li><strong>Δικαίωμα Διαγραφής ("Λήθη"):</strong> Μπορείτε να ζητήσετε τη διαγραφή του λογαριασμού σας.</li>
            <li><strong>Δικαίωμα Φορητότητας:</strong> Μπορείτε να ζητήσετε τα δεδομένα σας σε δομημένη μορφή.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">5. Ασφάλεια Δεδομένων</h2>
          <p>
            Χρησιμοποιούμε το Supabase, το οποίο προσφέρει κρυπτογράφηση δεδομένων και ασφαλή υποδομή cloud, για να διασφαλίσουμε ότι τα στοιχεία σας είναι προστατευμένα από μη εξουσιοδοτημένη πρόσβαση.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">6. Πολιτική Cookies</h2>
          <p>Χρησιμοποιούμε cookies για τη βελτίωση της πλοήγησης:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Απαραίτητα Cookies:</strong> Χρησιμοποιούνται για τη σύνδεση χρήστη (Supabase Auth) και την αποθήκευση των προτιμήσεων εμφάνισης (Dark Mode).</li>
            <li><strong>Cookies Λειτουργικότητας:</strong> Επιτρέπουν στην εφαρμογή να θυμάται τις επιλογές σας και να λειτουργεί ως PWA (Progressive Web App).</li>
            <li><strong>Cookies Ανάλυσης:</strong> Μας βοηθούν να κατανοήσουμε πώς χρησιμοποιείται η εφαρμογή για να τη βελτιώσουμε.</li>
          </ul>
          <p class="mt-4">
            Μπορείτε να αλλάξετε τις προτιμήσεις σας ανά πάσα στιγμή διαγράφοντας τα δεδομένα περιήγησης (Cache/LocalStorage) του προγράμματος περιήγησής σας.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-bold text-surface-900 dark:text-white mb-4">7. Επικοινωνία</h2>
          <p>
            Για οποιαδήποτε απορία σχετικά με τα δεδομένα σας, μπορείτε να επικοινωνήσετε μαζί μας μέσω της φόρμας επικοινωνίας στο υποσέλιδο της σελίδας.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
