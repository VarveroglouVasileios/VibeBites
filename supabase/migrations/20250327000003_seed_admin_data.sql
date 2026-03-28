-- ══════════════════════════════════════════════════════
-- VibeBites – SEED DATA FOR ADMIN USER
-- ══════════════════════════════════════════════════════

DO $$
DECLARE
  v_admin_id UUID;
  v_recipe_1_id UUID;
  v_recipe_2_id UUID;
  v_recipe_3_id UUID;
BEGIN
  -- 1. Get Admin ID (from the email in the promote script)
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'varveroglou@hotmail.gr' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'Admin user with email varveroglou@hotmail.gr not found. Please sign up first.';
    RETURN;
  END IF;

  -- 2. Ensure Profile Exists & is Admin
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (v_admin_id, 'admin_vasileios', 'Vasileios Varveroglou', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- 3. SEED RECIPES
  
  -- Recipe 1: Mediterranean Harvest Bowl
  INSERT INTO public.recipes (author_id, title, slug, description, instructions, cook_time, servings, is_vegan, media_urls)
  VALUES (
    v_admin_id,
    'Mediterranean Harvest Bowl',
    'mediterranean-harvest-bowl',
    'Experience the symphony of fresh garden herbs and sun-drenched vegetables. Perfect for a mindful lunch.',
    '["Roast chickpeas with olive oil and spices for 20 min at 200°C.", "Whisk tahini, lemon juice, and a splash of water for the dressing.", "Layer greens, chopped cucumber, tomatoes, and warm chickpeas.", "Drizzle dressing, finish with fresh herbs and a pinch of salt."]',
    25,
    2,
    true,
    '{"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"}'
  )
  RETURNING id INTO v_recipe_1_id;

  -- Ingredients for Recipe 1
  INSERT INTO public.ingredients (recipe_id, name, quantity, unit, sort_order)
  VALUES
    (v_recipe_1_id, 'Chickpeas (cooked)', '400', 'g', 0),
    (v_recipe_1_id, 'Baby spinach', '2', 'cups', 1),
    (v_recipe_1_id, 'Cherry tomatoes', '150', 'g', 2),
    (v_recipe_1_id, 'Tahini', '2', 'tbsp', 3),
    (v_recipe_1_id, 'Lemon juice', '1', 'tbsp', 4);

  -- Recipe 2: Blueberry Cloud Flapjacks
  INSERT INTO public.recipes (author_id, title, slug, description, instructions, cook_time, servings, is_vegan, media_urls)
  VALUES (
    v_admin_id,
    'Blueberry Cloud Flapjacks',
    'blueberry-cloud-flapjacks',
    'Light, airy pancakes bursting with fresh blueberries and topped with maple syrup.',
    '["Whisk flour, baking powder, and a pinch of salt.", "In another bowl, mix almond milk and vanilla extract.", "Combine wet and dry ingredients, then fold in blueberries.", "Cook on a non-stick griddle until bubbles form, then flip."]',
    15,
    2,
    true,
    '{"https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=1000"}'
  )
  RETURNING id INTO v_recipe_2_id;

  -- Ingredients for Recipe 2
  INSERT INTO public.ingredients (recipe_id, name, quantity, unit, sort_order)
  VALUES
    (v_recipe_2_id, 'Flour', '1.5', 'cups', 0),
    (v_recipe_2_id, 'Almond milk', '1', 'cup', 1),
    (v_recipe_2_id, 'Blueberries', '1', 'cup', 2),
    (v_recipe_2_id, 'Maple syrup', '2', 'tbsp', 3);

  -- Recipe 3: Wild Salmon Zen Bowl
  INSERT INTO public.recipes (author_id, title, slug, description, instructions, cook_time, servings, is_vegan, media_urls)
  VALUES (
    v_admin_id,
    'Wild Salmon Zen Bowl',
    'wild-salmon-zen-bowl',
    'Perfectly seared wild salmon over a bed of quinoa, avocado, and pickled ginger.',
    '["Cook quinoa according to package directions.", "Sear salmon fillets in a hot pan for 4 mins per side.", "Arrange quinoa, sliced avocado, and salmon in bowls.", "Top with pickled ginger, sesame seeds, and soy glaze."]',
    20,
    2,
    false,
    '{"https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1000"}'
  )
  RETURNING id INTO v_recipe_3_id;

  -- Ingredients for Recipe 3
  INSERT INTO public.ingredients (recipe_id, name, quantity, unit, sort_order)
  VALUES
    (v_recipe_3_id, 'Wild salmon fillets', '2', 'pieces', 0),
    (v_recipe_3_id, 'Quinoa', '1', 'cup', 1),
    (v_recipe_3_id, 'Avocado', '1', 'piece', 2),
    (v_recipe_3_id, 'Pickled ginger', '2', 'tbsp', 3);

  RAISE NOTICE 'Seed data for admin user varveroglou@hotmail.gr has been added successfully.';
END $$;
