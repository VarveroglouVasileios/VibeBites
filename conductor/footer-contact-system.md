# Plan: Footer with Social Media & Contact Form

## Objective
Enhance the site footer with a professional design including social media links and a functional contact form that persists messages to Supabase, viewable via an admin dashboard.

## Key Files & Context
- `supabase/migrations/`: New migration for `contact_messages` table.
- `layouts/default.vue`: Redesign footer and add contact form logic.
- `pages/admin/messages.vue`: New admin page to manage inquiries.
- `middleware/admin.ts`: Protect the messages page.

## Implementation Steps

### 1. Database Schema
- Create `supabase/migrations/20250328000001_contact_messages.sql`:
  - `id` (uuid, primary key)
  - `name` (text)
  - `email` (text)
  - `subject` (text, optional)
  - `message` (text)
  - `status` (text, default 'unread')
  - `created_at` (timestamp)
- Enable RLS:
  - Public `INSERT` access.
  - Admin `ALL` access based on `profiles.role`.

### 2. Enhanced Footer (`layouts/default.vue`)
- Replace the simple footer with a 4-column grid:
  - **Column 1 (VibeBites):** Logo, mission statement, copyright.
  - **Column 2 (Εξερεύνηση):** Navigation links.
  - **Column 3 (Social):** TikTok, Instagram, YouTube icons with hover effects.
  - **Column 4 (Επικοινωνία):** 
    - Form with `name`, `email`, `message`.
    - Integrated loading state and `vue-sonner` success/error toasts.

### 3. Admin Messages Page (`pages/admin/messages.vue`)
- Create a sleek UI to list messages.
- Include "Mark as Read" and "Delete" actions.
- Use `useSupabaseClient` to fetch data.
- Enforce `admin` middleware.

### 4. Verification
- Submit a test message from the footer.
- Verify entry in Supabase dashboard or CLI.
- Verify the message appears in the `/admin/messages` page.
- Test responsive layout of the new footer.

