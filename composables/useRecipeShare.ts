export interface RecipeSharePayload {
  title: string
  text?: string
  url: string
}

/**
 * Web Share API with clipboard fallback (good for pasting into TikTok / Instagram captions).
 */
export function useRecipeShare () {
  const canNativeShare = computed(
    () => typeof navigator !== 'undefined' && Boolean(navigator.share),
  )

  async function share (payload: RecipeSharePayload) {
    const { title, text, url } = payload
    const shareableText = [title, text, url].filter(Boolean).join('\n\n')

    if (canNativeShare.value) {
      try {
        // Web Share API v1: title, text, url
        await navigator.share({
          title,
          text: text ? `${text}\n\n${url}` : shareableText,
          url,
        })
        return { ok: true as const, method: 'native' as const }
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          return { ok: false as const, method: 'aborted' as const }
        }
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareableText)
      return { ok: true as const, method: 'clipboard' as const }
    }

    return { ok: false as const, method: 'unsupported' as const }
  }

  return { canNativeShare, share }
}
