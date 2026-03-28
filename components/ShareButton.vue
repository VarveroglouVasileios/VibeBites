<script setup lang="ts">
const props = defineProps<{
  title: string
  text: string
  url: string
  videoUrl?: string
}>()

const { isSupported, shared, share, shareWithVideo } = useShare()
const showTooltip = ref(false)

async function handleShare() {
  const success = props.videoUrl
    ? await shareWithVideo({
        title: props.title,
        text: props.text,
        url: props.url,
        videoUrl: props.videoUrl,
      })
    : await share({
        title: props.title,
        text: props.text,
        url: props.url,
      })

  if (success && !isSupported.value) {
    // Show "copied to clipboard" tooltip
    showTooltip.value = true
    setTimeout(() => { showTooltip.value = false }, 2000)
  }
}
</script>

<template>
  <div class="relative">
    <button
      @click="handleShare"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm glass transition-all duration-200 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] text-surface-700 dark:text-surface-300"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Κοινοποίηση
    </button>

    <!-- Copied tooltip -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-1"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showTooltip"
        class="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-surface-800 dark:bg-surface-200 text-white dark:text-surface-900 text-xs font-medium whitespace-nowrap"
      >
        ✅ Αντιγράφηκε!
      </div>
    </Transition>
  </div>
</template>
