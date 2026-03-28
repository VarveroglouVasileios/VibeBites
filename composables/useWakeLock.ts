/**
 * useWakeLock – Screen Wake Lock API composable
 * Prevents screen from dimming during Cooking Mode
 */
export function useWakeLock() {
  const isActive = ref(false)
  const isSupported = ref(false)
  let wakeLock: WakeLockSentinel | null = null

  onMounted(() => {
    isSupported.value = 'wakeLock' in navigator
  })

  async function request() {
    if (!isSupported.value) return false

    try {
      wakeLock = await navigator.wakeLock.request('screen')
      isActive.value = true

      wakeLock.addEventListener('release', () => {
        isActive.value = false
      })

      return true
    } catch (err) {
      console.warn('Wake Lock request failed:', err)
      isActive.value = false
      return false
    }
  }

  async function release() {
    if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
      isActive.value = false
    }
  }

  async function toggle() {
    if (isActive.value) {
      await release()
    } else {
      await request()
    }
  }

  // Re-acquire wake lock when page becomes visible again
  if (import.meta.client) {
    document.addEventListener('visibilitychange', async () => {
      if (isActive.value && document.visibilityState === 'visible') {
        await request()
      }
    })
  }

  // Release on unmount
  onUnmounted(() => {
    release()
  })

  return {
    isActive: readonly(isActive),
    isSupported: readonly(isSupported),
    request,
    release,
    toggle,
  }
}
