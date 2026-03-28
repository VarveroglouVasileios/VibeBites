-- ══════════════════════════════════════════════════════
-- VibeBites – FORCE FIX MISSING IMAGES
-- ══════════════════════════════════════════════════════

-- Fix Blueberry Cloud Flapjacks (Αφράτα Pancakes με Μύρτιλα)
UPDATE public.recipes
SET 
  media_urls = '{"https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1000"}',
  og_image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1000'
WHERE slug = 'blueberry-cloud-flapjacks';

-- Fix Mediterranean Harvest Bowl (Μεσογειακό Μπολ Συγκομιδής)
UPDATE public.recipes
SET 
  media_urls = '{"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"}',
  og_image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000'
WHERE slug = 'mediterranean-harvest-bowl';

-- Fix Wild Salmon Zen Bowl (Zen Μπολ με Άγριο Σολομό)
UPDATE public.recipes
SET 
  media_urls = '{"https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1000"}',
  og_image_url = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1000'
WHERE slug = 'wild-salmon-zen-bowl';
