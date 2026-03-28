# Plan: Final Polish & UX Improvements

## Objective
Implement final performance and UX enhancements as recommended in the testing report.

## Implementation Steps

### 1. Performance: Image Optimization
- **`components/RecipeCard.vue`**: Add explicit `width="400"` and `height="300"` to the `NuxtImg` component to prevent layout shifts and improve Best Practices score.
- **`components/recipe/RecipeDetail.vue`**: Add explicit `width="1200"` and `height="600"` to the hero image.

### 2. UX: AI Assistant Image Preview
- **`components/fridge/FridgeAssistantPanel.vue`**:
  - Add a `photoPreview` ref to store the base64 or object URL of the uploaded fridge photo.
  - Display a small, rounded thumbnail preview above the ingredients text area when an image is being analyzed or has been uploaded.
  - Add a "Remove" button to clear the preview.

### 3. Automation: Admin Alerts (Edge Function Refinement)
- **`supabase/functions/notify-admin-message/index.ts`**:
  - Update the placeholder logic for email notifications to use a cleaner, more robust structure for the Resend API.
  - Add environment variable checks for `RESEND_API_KEY`.

### 4. Security: Final Check
- Verify that `/api/seed` remains strictly disabled in production.

## Verification
- Run `npm run typecheck`.
- Manually verify the image preview in the AI Assistant.
- Check Lighthouse score for CLS (Cumulative Layout Shift).
