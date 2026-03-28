<script setup lang="ts">
import type { Comment } from '~/types'

const props = defineProps<{
  recipeId: string
  comments: Comment[]
}>()

const recipeStore = useRecipeStore()
const authStore = useAuthStore()
const user = useSupabaseUser()
const { uploadFile } = useMediaUpload()

const newComment = ref('')
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const submitting = ref(false)

function handlePhotoSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    photoFile.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

function removePhoto() {
  photoFile.value = null
  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value)
    photoPreview.value = null
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !authStore.isLoggedIn) return

  submitting.value = true
  try {
    let photoUrl: string | undefined

    if (photoFile.value && user.value) {
      const url = await uploadFile(photoFile.value, 'comment-photos', user.value.id)
      if (url) photoUrl = url
    }

    await recipeStore.addComment(props.recipeId, newComment.value.trim(), photoUrl)
    newComment.value = ''
    removePhoto()

    // Refresh recipe data to get new comment
    await recipeStore.fetchRecipeBySlug(recipeStore.currentRecipe?.slug || '')
  } finally {
    submitting.value = false
  }
}

// Group comments into threads
const threadedComments = computed(() => {
  const topLevel = props.comments.filter(c => !c.parent_id)
  return topLevel.map(comment => ({
    ...comment,
    replies: props.comments.filter(c => c.parent_id === comment.id),
  }))
})
</script>

<template>
  <div class="space-y-6">
    <h3 class="font-display text-lg font-bold text-surface-900 dark:text-white">
      💬 Σχόλια ({{ comments.length }})
    </h3>

    <!-- Comment form -->
    <div v-if="authStore.isLoggedIn" class="glass p-4 space-y-3">
      <textarea
        v-model="newComment"
        rows="3"
        placeholder="Γράψε ένα σχόλιο..."
        class="input-field resize-none"
      />

      <!-- Photo preview -->
      <div v-if="photoPreview" class="relative inline-block">
        <img :src="photoPreview" class="w-24 h-24 object-cover rounded-xl" alt="Photo preview" />
        <button
          @click="removePhoto"
          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div class="flex items-center justify-between">
        <label class="btn-ghost text-sm cursor-pointer">
          📷 Φωτογραφία
          <input type="file" accept="image/*" class="hidden" @change="handlePhotoSelect" />
        </label>

        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submitting"
          class="btn-glow text-sm !px-4 !py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Αποστολή...' : 'Δημοσίευση' }}
        </button>
      </div>
    </div>
    <div v-else class="glass p-4 text-center text-sm text-surface-500">
      <NuxtLink to="/auth/login" class="text-brand-500 hover:underline">Συνδέσου</NuxtLink>
      για να αφήσεις σχόλιο.
    </div>

    <!-- Comments list -->
    <div class="space-y-4">
      <div v-for="comment in threadedComments" :key="comment.id" class="space-y-3">
        <!-- Main comment -->
        <div class="flex gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ comment.author?.username?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-surface-900 dark:text-white">
                {{ comment.author?.username || 'User' }}
              </span>
              <span class="text-xs text-surface-400">
                {{ new Date(comment.created_at).toLocaleDateString('el-GR') }}
              </span>
            </div>
            <p class="mt-1 text-sm text-surface-700 dark:text-surface-300">
              {{ comment.body }}
            </p>
            <img
              v-if="comment.photo_url"
              :src="comment.photo_url"
              class="mt-2 max-w-xs rounded-xl"
              alt="Comment photo"
            />
          </div>
        </div>

        <!-- Replies -->
        <div
          v-for="reply in comment.replies"
          :key="reply.id"
          class="ml-11 flex gap-3 pl-4 border-l-2 border-surface-200 dark:border-surface-700"
        >
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-brand-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {{ reply.author?.username?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-surface-900 dark:text-white">
                {{ reply.author?.username || 'User' }}
              </span>
              <span class="text-xs text-surface-400">
                {{ new Date(reply.created_at).toLocaleDateString('el-GR') }}
              </span>
            </div>
            <p class="mt-0.5 text-sm text-surface-700 dark:text-surface-300">
              {{ reply.body }}
            </p>
          </div>
        </div>
      </div>

      <p v-if="!comments.length" class="text-center text-sm text-surface-400 py-4">
        Κανένα σχόλιο ακόμα. Γίνε ο πρώτος! 🎉
      </p>
    </div>
  </div>
</template>
