import { defineStore } from 'pinia'
import type { Database } from '~/types/database'
import type { ShoppingItem } from '~/types'

// ─── Category matching (reused from IngredientChecklist) ───
const categories: Record<string, string[]> = {
  'Προϊόντα': ['ντομάτα', 'κρεμμύδι', 'σκόρδο', 'πατάτα', 'σπανάκι', 'αγγούρι', 'μαϊντανός', 'άνηθος', 'λεμόνι', 'καρότο', 'κολοκυθάκι', 'μελιτζάνα', 'πιπεριά', 'μαρούλι', 'ρόκα', 'μανιτάρι', 'μπρόκολο'],
  'Πρωτεΐνη': ['κοτόπουλο', 'μοσχάρι', 'κιμάς', 'ψάρι', 'σολομός', 'αυγό', 'ρεβίθια', 'φακές', 'φασόλια', 'τόφου', 'χοιρινό', 'γαρίδες', 'μπακαλιάρος'],
  'Γαλακτοκομικά': ['γάλα', 'φέτα', 'τυρί', 'γιαούρτι', 'κρέμα', 'βούτυρο', 'κεφαλοτύρι', 'γραβιέρα', 'μοτσαρέλα'],
  'Ντουλάπι': ['λάδι', 'ελαιόλαδο', 'αλάτι', 'πιπέρι', 'ζάχαρη', 'αλεύρι', 'ρύζι', 'μακαρόνια', 'ζυμαρικά', 'ξύδι', 'ρίγανη', 'ταχίνι', 'μέλι', 'σόδα', 'κανέλα', 'πάπρικα'],
}

function getCategory(name: string): string {
  const lowerName = name.toLowerCase()
  for (const [cat, items] of Object.entries(categories)) {
    if (items.some(item => lowerName.includes(item))) return cat
  }
  return 'Άλλα'
}

export const useShoppingStore = defineStore('shopping', () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const items = ref<ShoppingItem[]>([])
  const loading = ref(false)

  // ─── Fetch all items ─────────────────────────────────
  async function fetchItems() {
    if (!user.value) return
    loading.value = true
    try {
      const { data, error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      items.value = (data || []) as ShoppingItem[]
    } catch (err) {
      console.error('Failed to fetch shopping list:', err)
    } finally {
      loading.value = false
    }
  }

  // ─── Add ingredients from a recipe ───────────────────
  async function addFromRecipe(recipeId: string, recipeTitle: string, ingredients: { name: string; quantity: string | null; unit: string | null }[]) {
    if (!user.value) return

    const newItems = ingredients.map(ing => ({
      user_id: user.value!.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      category: getCategory(ing.name),
      is_checked: false,
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    }))

    try {
      const { error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .insert(newItems)

      if (error) throw error
      await fetchItems()
      return true
    } catch (err) {
      console.error('Failed to add to shopping list:', err)
      return false
    }
  }

  // ─── Add a custom item ──────────────────────────────
  async function addCustomItem(name: string, quantity?: string, unit?: string) {
    if (!user.value || !name.trim()) return

    try {
      const { error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .insert({
          user_id: user.value.id,
          name: name.trim(),
          quantity: quantity || null,
          unit: unit || null,
          category: getCategory(name),
          is_checked: false,
        })

      if (error) throw error
      await fetchItems()
      return true
    } catch (err) {
      console.error('Failed to add custom item:', err)
      return false
    }
  }

  // ─── Toggle check/uncheck ──────────────────────────
  async function toggleItem(id: string) {
    const item = items.value.find(i => i.id === id)
    if (!item) return

    // Optimistic update
    item.is_checked = !item.is_checked

    try {
      const { error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .update({ is_checked: item.is_checked })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      // Revert on failure
      item.is_checked = !item.is_checked
      console.error('Failed to toggle item:', err)
    }
  }

  // ─── Remove single item ─────────────────────────────
  async function removeItem(id: string) {
    try {
      const { error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .delete()
        .eq('id', id)

      if (error) throw error
      items.value = items.value.filter(i => i.id !== id)
    } catch (err) {
      console.error('Failed to remove item:', err)
    }
  }

  // ─── Clear all checked items ────────────────────────
  async function clearChecked() {
    if (!user.value) return
    const checkedIds = items.value.filter(i => i.is_checked).map(i => i.id)
    if (!checkedIds.length) return

    try {
      const { error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .delete()
        .eq('user_id', user.value.id)
        .eq('is_checked', true)

      if (error) throw error
      items.value = items.value.filter(i => !i.is_checked)
    } catch (err) {
      console.error('Failed to clear checked items:', err)
    }
  }

  // ─── Clear entire list ──────────────────────────────
  async function clearAll() {
    if (!user.value) return
    try {
      const { error } = await (supabase
        .from('shopping_list_items' as any) as any)
        .delete()
        .eq('user_id', user.value.id)

      if (error) throw error
      items.value = []
    } catch (err) {
      console.error('Failed to clear list:', err)
    }
  }

  // ─── Computed: items grouped by category ─────────────
  const itemsByCategory = computed(() => {
    const groups: Record<string, ShoppingItem[]> = {}
    const order = ['Προϊόντα', 'Πρωτεΐνη', 'Γαλακτοκομικά', 'Ντουλάπι', 'Άλλα']

    for (const item of items.value) {
      const cat = item.category || 'Άλλα'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }

    // Return in sorted order
    const sorted: Record<string, ShoppingItem[]> = {}
    for (const cat of order) {
      if (groups[cat]) sorted[cat] = groups[cat]
    }
    // Add any remaining categories
    for (const [cat, catItems] of Object.entries(groups)) {
      if (!sorted[cat]) sorted[cat] = catItems
    }
    return sorted
  })

  const checkedCount = computed(() => items.value.filter(i => i.is_checked).length)
  const totalCount = computed(() => items.value.length)

  return {
    items,
    loading,
    itemsByCategory,
    checkedCount,
    totalCount,
    fetchItems,
    addFromRecipe,
    addCustomItem,
    toggleItem,
    removeItem,
    clearChecked,
    clearAll,
  }
})
