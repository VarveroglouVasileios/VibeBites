<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'admin'
})

useHead({ title: 'Μηνύματα Επικοινωνίας (Admin)' })

const supabase = useSupabaseClient()
const messages = ref<any[]>([])
const loading = ref(true)

async function fetchMessages() {
  loading.value = true
  try {
    const { data, error } = await (supabase
      .from('contact_messages' as any) as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    messages.value = (data as any[]) || []
  } catch (e: any) {
    toast.error('Αποτυχία φόρτωσης μηνυμάτων: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function markAsRead(id: string) {
  try {
    const { error } = await (supabase
      .from('contact_messages' as any) as any)
      .update({ status: 'read' })
      .eq('id', id)

    if (error) throw error
    
    const msg = messages.value.find(m => m.id === id)
    if (msg) msg.status = 'read'
    
    toast.success('Το μήνυμα σημειώθηκε ως αναγνωσμένο.')
  } catch (e: any) {
    toast.error('Αποτυχία ενημέρωσης: ' + e.message)
  }
}

async function deleteMessage(id: string) {
  if (!confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το μήνυμα;')) return

  try {
    const { error } = await (supabase
      .from('contact_messages' as any) as any)
      .delete()
      .eq('id', id)

    if (error) throw error
    
    messages.value = messages.value.filter(m => m.id !== id)
    toast.success('Το μήνυμα διαγράφηκε.')
  } catch (e: any) {
    toast.error('Αποτυχία διαγραφής: ' + e.message)
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-display text-3xl font-bold text-surface-900 dark:text-white">
          📩 Μηνύματα Επικοινωνίας
        </h1>
        <p class="text-surface-500 mt-1">Διαχείριση εισερχόμενων μηνυμάτων από την πλατφόρμα.</p>
      </div>
      <button @click="fetchMessages" class="btn-secondary text-sm flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">refresh</span>
        Ανανέωση
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="glass p-6 animate-pulse">
        <div class="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-4"></div>
        <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full mb-2"></div>
        <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="messages.length === 0" class="text-center py-20 glass rounded-3xl">
      <span class="text-5xl" aria-hidden="true">📭</span>
      <h3 class="mt-4 font-display text-xl font-bold text-surface-900 dark:text-white">Δεν υπάρχουν μηνύματα</h3>
      <p class="text-surface-500 mt-2">Όλα τα μηνύματα των χρηστών θα εμφανίζονται εδώ.</p>
    </div>

    <!-- Messages List -->
    <div v-else class="space-y-6">
      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="glass p-6 transition-all duration-300 hover:shadow-glow relative overflow-hidden"
        :class="msg.status === 'unread' ? 'border-l-4 border-brand-500' : 'border-l-4 border-surface-200 dark:border-surface-800'"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-surface-900 dark:text-white">{{ msg.name }}</h3>
              <span 
                class="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full"
                :class="msg.status === 'unread' ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-500'"
              >
                {{ msg.status === 'unread' ? 'Νέο' : 'Αναγνωσμένο' }}
              </span>
            </div>
            <p class="text-sm text-brand-500">{{ msg.email }}</p>
            <p class="text-xs text-surface-400">
              {{ new Date(msg.created_at).toLocaleString('el-GR') }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              v-if="msg.status === 'unread'"
              @click="markAsRead(msg.id)"
              class="p-2 rounded-xl hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 transition-colors"
              title="Σήμανση ως αναγνωσμένο"
            >
              <span class="material-symbols-outlined">drafts</span>
            </button>
            <button 
              @click="deleteMessage(msg.id)"
              class="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
              title="Διαγραφή"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800">
          <p class="text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">
            {{ msg.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
