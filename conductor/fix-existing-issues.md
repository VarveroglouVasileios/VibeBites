# Plan: Fix Existing Security & Asset Issues

## Objective
To resolve the identified security vulnerabilities, missing static assets, and accessibility gaps in the VibeBites project.

## Key Files & Context
- `server/api/seed.post.ts`: Hardcoded admin password.
- `.env.example` / `.env`: Need to add `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- `public/`: Missing `favicon.ico` and `icons/` directory.
- `components/RecipeCard.vue`: Needs accessibility updates for emojis and icon-only buttons.
- `layouts/default.vue`: Needs accessibility updates (aria-labels, skip link).
- `package.json`: Need to update `serialize-javascript`.

## Implementation Steps

### 1. Security Fixes
- **Move admin credentials to environment variables:**
  - Update `server/api/seed.post.ts` to use `process.env.ADMIN_EMAIL` and `process.env.ADMIN_PASSWORD`.
  - Add these keys to `.env.example`.
- **Patch Vulnerable Dependency:**
  - Update `serialize-javascript` to `v7.0.5` or later.

### 2. Asset Management
- **Create missing directories:**
  - Create `public/icons/`.
- **Add placeholders for icons and favicon:**
  - Since I cannot generate images directly, I will provide a placeholder favicon and dummy image files for the PWA icons to ensure the manifest doesn't fail.

### 3. Accessibility Updates (WCAG AA)
- **Improve screen reader support:**
  - Add `aria-hidden="true"` to all decorative emojis.
  - Add `aria-label` to all icon-only buttons (edit/delete/trash/dark-mode toggle).
- **Add Keyboard Support:**
  - Add a "Skip to main content" link at the top of `layouts/default.vue`.

### 4. Verification & Testing
- Run `npm run typecheck` to ensure no new errors were introduced.
- Verify that the `seed` endpoint still works by using the new environment variables.
- Manually check accessibility attributes in the browser (if possible) or via a snapshot.

