/**
 * useShare – Web Share API composable with clipboard fallback
 */
export function useShare() {
  const isSupported = ref(false)
  const shared = ref(false)

  onMounted(() => {
    isSupported.value = !!navigator.share
  })

  async function share(data: {
    title: string
    text: string
    url: string
  }) {
    shared.value = false

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
        shared.value = true
        return true
      } catch (err: any) {
        // User cancelled — not an error
        if (err.name === 'AbortError') return false
        console.warn('Share failed:', err)
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(data.url)
      shared.value = true
      return true
    } catch {
      return false
    }
  }

  /**
   * Share with video link for social platforms
   */
  async function shareWithVideo(data: {
    title: string
    text: string
    url: string
    videoUrl?: string
  }) {
    const shareText = data.videoUrl
      ? `${data.text}\n🎬 Watch: ${data.videoUrl}`
      : data.text

    return share({
      title: data.title,
      text: shareText,
      url: data.url,
    })
  }

  return {
    isSupported: readonly(isSupported),
    shared: readonly(shared),
    share,
    shareWithVideo,
  }
}
