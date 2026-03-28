-- ══════════════════════════════════════════════════════
-- VibeBites – FINAL FIX FOR BLUEBERRY PANCAKE IMAGE
-- ══════════════════════════════════════════════════════

-- Fix Blueberry Cloud Flapjacks (Αφράτα Pancakes με Μύρτιλα)
-- Using verified pancake ID: photo-1567620905732-2d1ec7bb7445
UPDATE public.recipes
SET 
  media_urls = '{"https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=1000"}',
  og_image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=1000'
WHERE slug = 'blueberry-cloud-flapjacks';
