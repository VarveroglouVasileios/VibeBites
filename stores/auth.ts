import { defineStore } from 'pinia'
import type { Database } from '~/types/database'
import type { Profile } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const isInitialLoading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function fetchProfile() {
    if (!user.value) return null

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) throw error
      profile.value = data as Profile
      return data
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      return null
    } finally {
      loading.value = false
      isInitialLoading.value = false
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) return null

    // Whitelist allowed fields to prevent privilege escalation (e.g. changing 'role')
    const allowedUpdates = {
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      username: updates.username,
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error
      profile.value = data as Profile
      return data
    } catch (err) {
      console.error('Failed to update profile:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string, username: string) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })
      if (error) throw error
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      await fetchProfile()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    profile.value = null
    navigateTo('/')
  }

  // Watch for auth state changes
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchProfile()
    } else {
      profile.value = null
      isInitialLoading.value = false
    }
  }, { immediate: true })

  return {
    profile,
    loading,
    isLoggedIn,
    isAdmin,
    fetchProfile,
    updateProfile,
    signUp,
    signIn,
    signOut,
    isInitialLoading,
  }
})
