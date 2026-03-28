# Plan: Middleware, Persistence, Social Previews, and AI Vision

## Objective
Fix admin middleware loops, persist grocery checklist state, implement dynamic social previews using Vercel OG, and integrate AI vision for the Fridge Assistant.

## Implementation Steps

### 1. Fix Admin Middleware Consistency
- **`stores/auth.ts`**:
  - Add `isInitialLoading` ref (default `true`).
  - Set `isInitialLoading = false` after the first `fetchProfile` completes.
- **`middleware/admin.ts`**:
  - Add logic to wait for `auth.isInitialLoading` to resolve before checking `auth.isAdmin`.

### 2. Persist Grocery Checklist State
- **`components/IngredientChecklist.vue`**:
  - Receive a `recipeId` prop.
  - On mount, load checked items from `sessionStorage` using key `vibebites-checklist-${recipeId}`.
  - On toggle, update `sessionStorage`.

### 3. Dynamic Social Previews (Vercel OG)
- Install `@vercel/og` if possible, or use `nuxt-og-image` (it's built on Satori/Vercel OG logic and works perfectly with Nuxt on Vercel).
- **Update `pages/recipes/[slug].vue`**:
  - Update `useHead` to point to the dynamic OG image route.

### 4. AI Vision Integration (Groq)
- **Model**: `llama-3.2-11b-vision-preview`.
- **`components/fridge/FridgeAssistantPanel.vue`**:
  - Add a file input/camera button.
  - Convert image to base64.
- **`server/api/vision-extract.post.ts`**:
  - New route to handle vision requests.
  - Prompt: "Identify all food ingredients in this image. Return ONLY a comma-separated list of ingredients."
  - Use Groq API with the vision model.

### 5. Email Notifications (Admin)
- Create `supabase/functions/notify-admin-message/index.ts`:
  - Triggered by new rows in `contact_messages`.
  - Placeholder for Resend/SendGrid API call.

## Verification
- Test admin page access after fresh login.
- Refresh recipe page and verify checked ingredients remain checked.
- Verify camera button in AI Assistant.
- Check generated OG image URLs.
