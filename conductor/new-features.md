# Plan: New Features & Enhancements

## Objective
Implement Social Media Generator, Ingredient Mapping (Grocery Mode), Recipe Scaling (Portion Calculator), Seasonal Suggestions, Toast Notifications, and Skeleton Screens.

## Key Files & Context
- `app.vue`: Add `Toaster`.
- `components/recipe/RecipeDetail.vue`: Add scaling slider, social summary button.
- `components/IngredientChecklist.vue`: Add grocery mode, handle scaling.
- `pages/index.vue`: Add seasonal suggestions logic.
- `pages/ai-assistant.vue`: Add skeleton screens for loading state.
- `components/RecipeCard.vue`: Add loading state skeletons.

## Implementation Steps

### 1. Setup & Toast Notifications
- Install `vue-sonner`.
- Add `<Toaster />` to `app.vue`.
- Replace all `alert()` calls with `toast()`.

### 2. Recipe Scaling (Portion Calculator)
- **RecipeDetail.vue**: 
  - Add a `targetServings` ref initialized to `recipe.servings`.
  - Add a slider/stepper to adjust servings.
- **IngredientChecklist.vue**:
  - Accept `targetServings` and `originalServings` as props.
  - Calculate scaling factor: `targetServings / originalServings`.
  - Dynamically update displayed quantities.

### 3. Interactive Ingredient Map (Grocery Mode)
- Create `utils/ingredient-mapper.ts` to categorize ingredients by name (e.g., "milk" -> "Γαλακτοκομικά").
- **IngredientChecklist.vue**:
  - Add a "Grocery Mode" toggle.
  - When active, group ingredients by category.

### 4. Social Media Generator
- **RecipeDetail.vue**:
  - Add a button "Social Summary".
  - Open a modal with a formatted text block (Title, Ingredients, brief steps) optimized for pasting into TikTok/Instagram descriptions.

### 5. Intelligent Seasonal Suggestions
- **index.vue**:
  - Logic to determine the current season (Spring, Summer, Autumn, Winter).
  - Update hero section and "Trending" picks based on the season.

### 6. Skeleton Screens
- Implement skeleton loaders using Tailwind `animate-pulse` for:
  - AI generation in `ai-assistant.vue`.
  - Recipe grid loading.

## Verification & Testing
- Run `npm run dev` and test each feature manually.
- Verify scaling math for various quantities.
- Check accessibility of new buttons and toggles.
