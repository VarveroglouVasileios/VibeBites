-- ══════════════════════════════════════════════════════
-- VibeBites – FIX ADMIN RLS POLICIES
-- ══════════════════════════════════════════════════════

-- 1. RECIPES POLICIES
DROP POLICY IF EXISTS "Only admins can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authors or admins can delete recipes" ON public.recipes;

-- Update: Admins can update ANY recipe (or author if they were admin)
CREATE POLICY "Admins can update any recipe"
  ON public.recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delete: Admins can delete ANY recipe
CREATE POLICY "Admins can delete any recipe"
  ON public.recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. INGREDIENTS POLICIES
DROP POLICY IF EXISTS "Recipe author can update ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Recipe author can delete ingredients" ON public.ingredients;

CREATE POLICY "Admins can update any ingredient"
  ON public.ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any ingredient"
  ON public.ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. COMMENTS POLICIES
DROP POLICY IF EXISTS "Authors or admins can delete comments" ON public.comments;

CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
