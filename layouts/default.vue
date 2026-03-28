<script setup lang="ts">
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const route = useRoute()
const supabase = useSupabaseClient()

const isMobileMenuOpen = ref(false)
const isDark = ref(false)

// Contact form state
const contactForm = reactive({
  name: '',
  email: '',
  message: ''
})
const isSubmitting = ref(false)

async function submitContact() {
  if (!contactForm.name || !contactForm.email || !contactForm.message) {
    toast.error('Παρακαλώ συμπληρώστε όλα τα πεδία.')
    return
  }

  isSubmitting.value = true
  try {
    const { error } = await (supabase
      .from('contact_messages' as any) as any)
      .insert([contactForm])

    if (error) throw error

    toast.success('Το μήνυμά σας στάλθηκε επιτυχώς!')
    contactForm.name = ''
    contactForm.email = ''
    contactForm.message = ''
  } catch (e: any) {
    toast.error('Αποτυχία αποστολής: ' + e.message)
  } finally {
    isSubmitting.value = false
  }
}

// Toggle dark mode
function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  // Sync state with the class applied by the head script
  isDark.value = document.documentElement.classList.contains('dark')
})

// Close mobile menu on route change
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

const navLinks = [
  { to: '/', label: 'Αρχική', icon: '🏠' },
  { to: '/recipes', label: 'Συνταγές', icon: '📖' },
  { to: '/ai-assistant', label: 'AI Βοηθός', icon: '🤖' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
    <!-- Skip to main content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg"
    >
      Μετάβαση στο περιεχόμενο
    </a>

    <!-- ─── Navigation ──────────────────────────────── -->
    <header class="sticky top-0 z-50 glass-strong border-b border-surface-200/50 dark:border-surface-700/50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <span class="text-2xl" aria-hidden="true">🍽️</span>
            <span class="font-display text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
              VibeBites
            </span>
          </NuxtLink>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              :class="route.path === link.to
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'"
            >
              <span class="mr-1.5" aria-hidden="true">{{ link.icon }}</span>
              {{ link.label }}
            </NuxtLink>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              :aria-label="isDark ? 'Εναλλαγή σε φωτεινή λειτουργία' : 'Εναλλαγή σε σκοτεινή λειτουργία'"
            >
              <span class="text-lg" aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
            </button>

            <!-- Auth Buttons -->
            <template v-if="authStore.isLoggedIn">
              <NuxtLink
                v-if="authStore.isAdmin"
                to="/recipes/create"
                class="hidden sm:inline-flex btn-glow text-sm !px-4 !py-2"
              >
                <span aria-hidden="true">✨</span> Νέα Συνταγή
              </NuxtLink>
              <NuxtLink to="/profile" class="flex items-center gap-2 btn-ghost !p-0.5" aria-label="Προφίλ χρήστη">
                <div class="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-surface-800 shadow-sm">
                  <img
                    v-if="authStore.profile?.avatar_url"
                    :src="authStore.profile.avatar_url"
                    :alt="authStore.profile.username"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ authStore.profile?.username?.[0]?.toUpperCase() || '?' }}</span>
                </div>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/auth/login" class="btn-ghost text-sm">
                Σύνδεση
              </NuxtLink>
              <NuxtLink to="/auth/register" class="btn-glow text-sm !px-4 !py-2">
                Εγγραφή
              </NuxtLink>
            </template>

            <!-- Mobile Menu Button -->
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
              aria-label="Μενού πλοήγησης"
            >
              <span class="text-xl" aria-hidden="true">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="isMobileMenuOpen" class="md:hidden py-4 border-t border-surface-200/50 dark:border-surface-700/50">
            <div class="flex flex-col gap-1">
              <NuxtLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group"
                :class="route.path === link.to
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'"
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg" aria-hidden="true">{{ link.icon }}</span>
                  {{ link.label }}
                </div>
                <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
              </NuxtLink>
              <NuxtLink
                v-if="authStore.isLoggedIn && authStore.isAdmin"
                to="/recipes/create"
                class="mt-2 px-4 py-3 rounded-xl text-sm font-bold bg-brand-500/5 text-brand-600 dark:text-brand-400 flex items-center gap-3"
              >
                <span aria-hidden="true">✨</span> Νέα Συνταγή
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </nav>
    </header>

    <!-- ─── Main Content ────────────────────────────── -->
    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <!-- ─── Footer ──────────────────────────────────── -->
    <footer class="border-t border-surface-200/50 dark:border-surface-700/50 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-md pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <!-- Column 1: Brand -->
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <span class="text-2xl" aria-hidden="true">🍽️</span>
              <span class="font-display text-xl font-bold gradient-text">VibeBites</span>
            </div>
            <p class="text-sm text-surface-500 leading-relaxed">
              Η απόλυτη social πλατφόρμα μαγειρικής. Ανακάλυψε, δημιούργησε και μοιράσου το πάθος σου για το φαγητό με την πιο ζωντανή κοινότητα.
            </p>
            <div class="flex items-center gap-4">
              <a href="https://www.instagram.com/homecooked_diaries/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full glass flex items-center justify-center text-surface-500 hover:text-brand-500 hover:shadow-glow transition-all" aria-label="Instagram">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full glass flex items-center justify-center text-surface-500 hover:text-brand-500 hover:shadow-glow transition-all" aria-label="TikTok">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full glass flex items-center justify-center text-surface-500 hover:text-brand-500 hover:shadow-glow transition-all" aria-label="YouTube">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          <!-- Column 2: Navigation -->
          <div>
            <h3 class="font-display font-bold text-surface-900 dark:text-white mb-6">Εξερεύνηση</h3>
            <ul class="space-y-4">
              <li v-for="link in navLinks" :key="link.to">
                <NuxtLink :to="link.to" class="text-sm text-surface-500 hover:text-brand-500 transition-colors flex items-center gap-2">
                  <span aria-hidden="true">{{ link.icon }}</span>
                  {{ link.label }}
                </NuxtLink>
              </li>
              <li v-if="authStore.isAdmin">
                <NuxtLink to="/admin/messages" class="text-sm text-surface-500 hover:text-brand-500 transition-colors flex items-center gap-2 font-bold">
                  <span aria-hidden="true">📩</span> Μηνύματα Admin
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Column 3: Info -->
          <div>
            <h3 class="font-display font-bold text-surface-900 dark:text-white mb-6">Πληροφορίες</h3>
            <ul class="space-y-4">
              <li><NuxtLink to="/terms" class="text-sm text-surface-500 hover:text-brand-500 transition-colors">Όροι Χρήσης</NuxtLink></li>
              <li><NuxtLink to="/privacy" class="text-sm text-surface-500 hover:text-brand-500 transition-colors">Πολιτική Απορρήτου</NuxtLink></li>
              <li><NuxtLink to="/about" class="text-sm text-surface-500 hover:text-brand-500 transition-colors">Σχετικά με εμάς</NuxtLink></li>
              <li><NuxtLink to="/faq" class="text-sm text-surface-500 hover:text-brand-500 transition-colors">Συχνές Ερωτήσεις</NuxtLink></li>
            </ul>
          </div>

          <!-- Column 4: Contact Form -->
          <div class="lg:col-span-1">
            <h3 class="font-display font-bold text-surface-900 dark:text-white mb-6">Πες μας ένα γεια!</h3>
            <form @submit.prevent="submitContact" class="space-y-3">
              <input 
                v-model="contactForm.name" 
                type="text" 
                placeholder="Όνομα" 
                required
                class="w-full bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              />
              <input 
                v-model="contactForm.email" 
                type="email" 
                placeholder="Email" 
                required
                class="w-full bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              />
              <textarea 
                v-model="contactForm.message" 
                placeholder="Το μήνυμά σου..." 
                rows="3" 
                required
                class="w-full bg-white/50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="w-full btn-glow text-sm py-2 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Αποστολή...' : '🚀 Αποστολή Μηνύματος' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Bottom -->
        <div class="pt-8 border-t border-surface-200/50 dark:border-surface-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-surface-500">
            © {{ new Date().getFullYear() }} VibeBites. Φτιαγμένο με <span aria-hidden="true" class="text-brand-500">🧡</span> στην Ελλάδα.
          </p>
          <div class="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-surface-400">
            <span>Server Status: Online</span>
            <span>AI Model: Groq-Llama-3</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Cookie Consent Banner -->
    <CookieBanner />
  </div>
</template>
