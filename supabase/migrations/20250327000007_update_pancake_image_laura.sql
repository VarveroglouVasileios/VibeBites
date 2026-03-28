-- ══════════════════════════════════════════════════════
-- VibeBites – UPDATE PANCAKE IMAGE FROM LAURA FUENTES
-- ══════════════════════════════════════════════════════

-- Fix Blueberry Cloud Flapjacks (Αφράτα Pancakes με Μύρτιλα)
-- Using preferred image from Laura Fuentes
UPDATE public.recipes
SET 
  media_urls = '{"https://www.laurafuentes.com/wp-content/uploads/2013/05/Blueberry-Pancakes-Recipe.jpg"}',
  og_image_url = 'https://www.laurafuentes.com/wp-content/uploads/2013/05/Blueberry-Pancakes-Recipe.jpg'
WHERE slug = 'blueberry-cloud-flapjacks';
