<script setup lang="ts">
useHead({ title: 'Σύνδεση' })

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

async function handleLogin() {
  error.value = null
  loading.value = true

  const { error: loginError } = await authStore.signIn(email.value, password.value)

  if (loginError) {
    error.value = loginError
  } else {
    await router.push('/')
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-5xl">🍽️</span>
        <h1 class="mt-4 font-display text-3xl font-bold text-surface-900 dark:text-white">
          Καλώς ήρθες πίσω!
        </h1>
        <p class="mt-2 text-surface-500">Συνδέσου στο VibeBites</p>
      </div>

      <div class="glass p-8">
        <!-- Error -->
        <div v-if="error" class="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input v-model="email" type="email" required class="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Κωδικός</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                tabindex="-1"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-glow disabled:opacity-50"
          >
            {{ loading ? 'Σύνδεση...' : '🚀 Σύνδεση' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-surface-500">
          Δεν έχεις λογαριασμό;
          <NuxtLink to="/auth/register" class="text-brand-500 font-semibold hover:underline">Εγγράψου</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
