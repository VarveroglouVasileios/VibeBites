import type { Database } from '~/types/database'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  if (!user.value) {
    return navigateTo('/auth/login', { replace: true })
  }

  // Wait for auth store to finish initial profile fetch
  if (auth.isInitialLoading) {
    await new Promise((resolve) => {
      const stop = watch(() => auth.isInitialLoading, (loading) => {
        if (!loading) {
          stop()
          resolve(true)
        }
      })
    })
  }

  if (!auth.isAdmin) {
    return navigateTo('/', { replace: true })
  }
})
