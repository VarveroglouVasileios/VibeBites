<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Προφίλ' })

const authStore = useAuthStore()
const recipeStore = useRecipeStore()
const { uploadFile, uploading: isUploadingAvatar } = useMediaUpload()
const supabase = useSupabaseClient()

const { profile, loading: authLoading } = storeToRefs(authStore)
const userRecipes = ref<any[]>([])
const loadingRecipes = ref(true)

const editMode = ref(false)
const editForm = reactive({
  full_name: '',
  username: '',
})

// Fetch user's recipes
onMounted(async () => {
  if (authStore.user) {
    const { data } = await supabase
      .from('recipes')
      .select('*, ratings(score)')
      .eq('author_id', authStore.user.id)
      .order('created_at', { ascending: false })

    userRecipes.value = (data || []).map((r: any) => ({
      ...r,
      average_rating: r.ratings?.length
        ? r.ratings.reduce((sum: number, rt: any) => sum + rt.score, 0) / r.ratings.length
        : 0,
    }))
  }
  loadingRecipes.value = false
})

function startEdit() {
  editForm.full_name = profile.value?.full_name || ''
  editForm.username = profile.value?.username || ''
  editMode.value = true
}

async function saveProfile() {
  await authStore.updateProfile({
    full_name: editForm.full_name,
    username: editForm.username,
  })
  editMode.value = false
}

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !authStore.user) return

  const url = await uploadFile(file, 'avatars', authStore.user.id)
  if (url) {
    await authStore.updateProfile({ avatar_url: url })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Profile Header -->
    <div class="glass p-8">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <!-- Avatar -->
        <div class="relative group">
          <div class="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-surface-800">
            <template v-if="isUploadingAvatar">
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </template>
            <img
              v-if="profile?.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.username"
              class="w-full h-full object-cover transition-opacity"
              :class="isUploadingAvatar ? 'opacity-50' : 'opacity-100'"
            />
            <span v-else>{{ profile?.username?.[0]?.toUpperCase() || '?' }}</span>
          </div>
          <label 
            v-if="!isUploadingAvatar"
            class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-[2px]"
          >
            <span class="text-white text-sm font-bold flex flex-col items-center" aria-hidden="true">
              <span class="text-xl">📷</span>
              Αλλαγή
            </span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
          </label>
        </div>

        <!-- Info -->
        <div class="flex-1 text-center sm:text-left">
          <template v-if="!editMode">
            <h1 class="font-display text-2xl font-bold text-surface-900 dark:text-white">
              {{ profile?.full_name || profile?.username }}
            </h1>
            <p class="text-surface-500">@{{ profile?.username }}</p>
            <div class="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span v-if="authStore.isAdmin" class="badge-accent">👑 Admin</span>
              <span class="badge-brand">{{ userRecipes.length }} Συνταγές</span>
            </div>
            <button @click="startEdit" class="mt-4 btn-ghost text-sm">
              <span aria-hidden="true">✏️</span> Επεξεργασία
            </button>
          </template>

          <!-- Edit form -->
          <template v-else>
            <div class="space-y-3 max-w-sm">
              <input v-model="editForm.full_name" type="text" class="input-field" placeholder="Ονοματεπώνυμο" />
              <input v-model="editForm.username" type="text" class="input-field" placeholder="Username" />
              <div class="flex gap-2">
                <button @click="saveProfile" class="btn-glow text-sm !px-4 !py-2">Αποθήκευση</button>
                <button @click="editMode = false" class="btn-ghost text-sm">Ακύρωση</button>
              </div>
            </div>
          </template>
        </div>

        <!-- Logout -->
        <button @click="authStore.signOut" class="btn-ghost text-sm text-red-500 hover:text-red-600">
          <span aria-hidden="true">🚪</span> Αποσύνδεση
        </button>
      </div>
    </div>

    <!-- User's Recipes -->
    <div class="mt-10">
      <h2 class="font-display text-xl font-bold text-surface-900 dark:text-white mb-6">
        <span aria-hidden="true">📖</span> Οι Συνταγές μου
      </h2>

      <div v-if="loadingRecipes" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="glass rounded-2xl overflow-hidden animate-pulse">
          <div class="aspect-[4/3] bg-surface-200 dark:bg-surface-700" />
          <div class="p-4 space-y-3">
            <div class="h-5 bg-surface-200 dark:bg-surface-700 rounded-lg w-3/4" />
          </div>
        </div>
      </div>

      <div v-else-if="userRecipes.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCard v-for="recipe in userRecipes" :key="recipe.id" :recipe="recipe" />
      </div>

      <div v-else class="text-center py-12 glass rounded-2xl">
        <span class="text-4xl" aria-hidden="true">🍳</span>
        <p class="mt-3 text-surface-500">Δεν έχεις δημιουργήσει συνταγή ακόμα.</p>
        <NuxtLink to="/recipes/create" class="btn-glow mt-4 inline-block text-sm">
          <span aria-hidden="true">✨</span> Δημιούργησε μια τώρα
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
