# Plan: Informational Pages & Footer Update

## Objective
Create the following pages with professional, GDPR-compliant content and update the footer to link to them, including a placeholder for social media links.

## New Pages
1.  **Όροι Χρήσης** (`pages/terms.vue`)
2.  **Πολιτική Απορρήτου** (`pages/privacy.vue`) - GDPR compliant
3.  **Σχετικά με εμάς** (`pages/about.vue`)
4.  **Συχνές Ερωτήσεις** (`pages/faq.vue`)

## Implementation Steps

### 1. Create `pages/privacy.vue`
- Detailed GDPR policy including:
  - Data controller info.
  - Types of data collected (Email, Username, Recipes).
  - Use of cookies for PWA and session management.
  - User rights (Access, Erasure, Rectification).
  - Third-party processors (Supabase, Groq).

### 2. Create `pages/terms.vue`
- Terms including:
  - User-generated content responsibility.
  - AI disclaimer (Verify ingredients for allergies/safety).
  - Copyright of recipes.

### 3. Create `pages/about.vue`
- Mission statement for VibeBites.
- Emphasis on community and technology (AI).

### 4. Create `pages/faq.vue`
- FAQ addressing:
  - How AI Fridge Assistant works.
  - How to save recipes.
  - Account management.

### 5. Update `layouts/default.vue`
- Replace static `<a>` footer links with `<NuxtLink>` to the new routes.
- Update Instagram link placeholder.

## Verification
- Click every link in the footer to ensure it leads to the correct page.
- Review GDPR content for completeness.
