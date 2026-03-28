<script setup lang="ts">
import type { RecipeFormData, RecipeStep } from '~/types'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const recipeId = route.params.id as string
const authStore = useAuthStore()
const user = useSupabaseUser()
const recipeStore = useRecipeStore()
const { uploadMultiple } = useMediaUpload()
const router = useRouter()

useHead({ title: 'Επεξεργασία Συνταγής' })

const loadingRecipe = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive<RecipeFormData>({
  title: '',
  description: '',
  instructions: [{ order: 1, text: '' }],
  cook_time: null,
  servings: null,
  is_vegan: false,
  ingredients: [{ name: '', quantity: '', unit: '', sort_order: 0 }],
  media_files: [],
})

const existingMedia = ref<string[]>([])
const mediaPreviews = ref<string[]>([])

onMounted(async () => {
  const recipe = await recipeStore.fetchRecipeById(recipeId)
  if (!recipe) {
    error.value = 'Η συνταγή δεν βρέθηκε.'
    loadingRecipe.value = false
    return
  }

  // Populate form
  form.title = recipe.title
  form.description = recipe.description || ''
  form.cook_time = recipe.cook_time
  form.servings = recipe.servings
  form.is_vegan = recipe.is_vegan
  
  if (recipe.instructions?.length) {
    form.instructions = JSON.parse(JSON.stringify(recipe.instructions))
  }
  
  if (recipe.ingredients?.length) {
    form.ingredients = recipe.ingredients.map(i => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      sort_order: i.sort_order,
    }))
  }

  existingMedia.value = [...(recipe.media_urls || [])]
  loadingRecipe.value = false
})

// Ingredient management
function addIngredient() {
  form.ingredients.push({ name: '', quantity: '', unit: '', sort_order: form.ingredients.length })
}

function removeIngredient(index: number) {
  if (form.ingredients.length > 1) form.ingredients.splice(index, 1)
}

// Step management
function addStep() {
  form.instructions.push({ order: form.instructions.length + 1, text: '' })
}

function removeStep(index: number) {
  if (form.instructions.length > 1) form.instructions.splice(index, 1)
}

// Media handling
function handleMediaSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  form.media_files.push(...files)
  files.forEach(f => mediaPreviews.value.push(URL.createObjectURL(f)))
}

function removeMedia(index: number) {
  form.media_files.splice(index, 1)
  URL.revokeObjectURL(mediaPreviews.value[index])
  mediaPreviews.value.splice(index, 1)
}

function removeExistingMedia(index: number) {
  existingMedia.value.splice(index, 1)
}

// Submit
async function handleSubmit() {
  error.value = null

  if (!form.title.trim()) {
    error.value = 'Ο τίτλος είναι υποχρεωτικός.'
    return
  }

  if (form.ingredients.every(i => !i.name.trim())) {
    error.value = 'Προσθέστε τουλάχιστον ένα υλικό.'
    return
  }

  submitting.value = true
  try {
    // Upload new media using user ID as folder for RLS compliance
    let newMediaUrls: string[] = []
    if (form.media_files.length > 0 && user.value) {
      newMediaUrls = await uploadMultiple(form.media_files, 'recipe-media', user.value.id)
    }

    const allMediaUrls = [...existingMedia.value, ...newMediaUrls]

    // Filter out empty ingredients/steps
    const cleanedForm = {
      ...form,
      ingredients: form.ingredients.filter(i => i.name.trim()),
      instructions: form.instructions.filter(s => s.text.trim()),
    }

    const updated = await recipeStore.updateRecipe(recipeId, cleanedForm, allMediaUrls)
    if (updated) {
      await router.push(`/recipes/${updated.slug}`)
    } else {
      error.value = 'Αποτυχία ενημέρωσης συνταγής. Δοκιμάστε ξανά.'
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="loadingRecipe" class="text-center py-20">
      <span class="text-3xl animate-bounce inline-block" aria-hidden="true">⏳</span>
      <p class="mt-4 text-surface-500">Φόρτωση συνταγής...</p>
    </div>

    <div v-else>
      <h1 class="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">
        <span aria-hidden="true">✏️</span> Επεξεργασία Συνταγής
      </h1>
      <p class="text-surface-500 mb-8">{{ form.title }}</p>

      <!-- Error -->
      <div v-if="error" class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Title & Description -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Τίτλος *</label>
            <input v-model="form.title" type="text" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Περιγραφή</label>
            <textarea v-model="form.description" rows="3" class="input-field resize-none" />
          </div>
        </div>

        <!-- Meta info -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5"><span aria-hidden="true">⏱️</span> Χρόνος (λεπτά)</label>
            <input v-model.number="form.cook_time" type="number" min="1" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5"><span aria-hidden="true">🍽️</span> Μερίδες</label>
            <input v-model.number="form.servings" type="number" min="1" class="input-field" />
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-2 cursor-pointer p-3">
              <input v-model="form.is_vegan" type="checkbox" class="w-5 h-5 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
              <span class="text-sm font-semibold text-surface-700 dark:text-surface-300"><span aria-hidden="true">🌱</span> Vegan</span>
            </label>
          </div>
        </div>

        <!-- Ingredients -->
        <div>
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3"><span aria-hidden="true">🧾</span> Υλικά *</label>
          <div class="space-y-2">
            <div v-for="(ing, i) in form.ingredients" :key="i" class="flex gap-2">
              <input v-model="ing.quantity" type="text" class="input-field w-20" placeholder="1" />
              <input v-model="ing.unit" type="text" class="input-field w-24" placeholder="κούπα" />
              <input v-model="ing.name" type="text" class="input-field flex-1" placeholder="Αλεύρι" />
              <button
                type="button"
                @click="removeIngredient(i)"
                class="p-2 text-red-400 hover:text-red-500 transition-colors"
                :disabled="form.ingredients.length === 1"
              >✕</button>
            </div>
          </div>
          <button type="button" @click="addIngredient" class="mt-2 btn-ghost text-sm text-brand-500">
            + Προσθήκη υλικού
          </button>
        </div>

        <!-- Instructions -->
        <div>
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3"><span aria-hidden="true">📝</span> Οδηγίες *</label>
          <div class="space-y-3">
            <div v-for="(step, i) in form.instructions" :key="i" class="flex gap-3">
              <span class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 text-sm font-bold flex items-center justify-center mt-2">
                {{ i + 1 }}
              </span>
              <textarea
                v-model="step.text"
                rows="2"
                class="input-field flex-1 resize-none"
                :placeholder="`Βήμα ${i + 1}...`"
              />
              <button
                type="button"
                @click="removeStep(i)"
                class="p-2 text-red-400 hover:text-red-500 transition-colors mt-2"
                :disabled="form.instructions.length === 1"
              >✕</button>
            </div>
          </div>
          <button type="button" @click="addStep" class="mt-2 btn-ghost text-sm text-brand-500">
            + Προσθήκη βήματος
          </button>
        </div>

        <!-- Media management -->
        <div>
          <label class="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3"><span aria-hidden="true">📸</span> Media</label>
          
          <!-- Existing Media -->
          <div v-if="existingMedia.length" class="mb-6">
            <p class="text-xs text-surface-400 mb-2 font-medium uppercase tracking-wider">Υπάρχοντα αρχεία</p>
            <div class="flex gap-3 flex-wrap">
              <div v-for="(url, i) in existingMedia" :key="i" class="relative">
                <template v-if="url.match(/\.(mp4|webm|mov)$/i)">
                  <div class="w-24 h-24 bg-surface-900 rounded-xl flex items-center justify-center text-xl">🎬</div>
                </template>
                <img v-else :src="url" class="w-24 h-24 object-cover rounded-xl" />
                <button
                  type="button"
                  @click="removeExistingMedia(i)"
                  class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >✕</button>
              </div>
            </div>
          </div>

          <!-- New Previews -->
          <div v-if="mediaPreviews.length" class="mb-6">
            <p class="text-xs text-surface-400 mb-2 font-medium uppercase tracking-wider">Νέα αρχεία</p>
            <div class="flex gap-3 flex-wrap">
              <div v-for="(preview, i) in mediaPreviews" :key="i" class="relative">
                <img :src="preview" class="w-24 h-24 object-cover rounded-xl" />
                <button
                  type="button"
                  @click="removeMedia(i)"
                  class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >✕</button>
              </div>
            </div>
          </div>

          <label class="glass p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-glow transition-all border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-2xl">
            <span class="text-3xl" aria-hidden="true">📤</span>
            <span class="mt-2 text-sm text-surface-500 font-medium">Προσθήκη νέων αρχείων</span>
            <input type="file" accept="image/*,video/*" multiple class="hidden" @change="handleMediaSelect" />
          </label>
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="router.back()" class="btn-secondary">Ακύρωση</button>
          <button
            type="submit"
            :disabled="submitting"
            class="btn-glow disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
          >
            {{ submitting ? '⏳ Ενημέρωση...' : '✨ Αποθήκευση' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
