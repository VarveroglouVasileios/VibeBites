-- ══════════════════════════════════════════════════════
-- VibeBites – Manually promote admin user
-- Run this AFTER the admin user has been created via /api/seed
-- ══════════════════════════════════════════════════════

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'varveroglou@hotmail.gr' LIMIT 1
);
