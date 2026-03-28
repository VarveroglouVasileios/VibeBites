# Plan: Cookie Consent System (GDPR)

## Objective
Implement a user-friendly and GDPR-compliant cookie consent system to manage user preferences and ensure transparency.

## Key Files & Context
- `components/layout/CookieBanner.vue`: New component for the consent UI.
- `layouts/default.vue`: Integrate the banner.
- `pages/privacy.vue`: Update with detailed cookie information.

## Implementation Steps

### 1. Cookie Banner Component
- Create `components/layout/CookieBanner.vue`:
  - **State Management:** Use `localStorage` to check if the user has already made a choice.
  - **Functionality:** 
    - "Αποδοχή Όλων": Sets all preferences to true and closes.
    - "Απαραίτητα Μόνο": Sets only functional cookies to true and closes.
    - "Προσαρμογή": (Optional/Simplified) Link to Privacy page for details.
  - **UI Design:** Fixed bottom banner with glass effect, mobile responsive, animations.

### 2. Layout Integration
- Add the `CookieBanner` component to the bottom of `layouts/default.vue`.
- Ensure it only renders on the client-side to prevent hydration mismatches with `localStorage`.

### 3. Policy Update
- Add a dedicated "6. Πολιτική Cookies" section to `pages/privacy.vue` explaining:
  - What cookies are.
  - Types used (Necessary for Auth/PWA, Analytics for AI usage).
  - How to revoke consent.

### 4. Verification
- Verify the banner appears on first load.
- Verify clicking buttons saves the choice and hides the banner.
- Verify the banner stays hidden on subsequent refreshes.
