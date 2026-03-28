-- ══════════════════════════════════════════════════════
-- VibeBites – Row Level Security Policies
-- ══════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings     ENABLE ROW LEVEL SECURITY;

-- ═══════════════ PROFILES ═══════════════
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ═══════════════ RECIPES ═══════════════
CREATE POLICY "Recipes are viewable by everyone"
  ON public.recipes FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update recipes"
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

CREATE POLICY "Admins can delete recipes"
  ON public.recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════ INGREDIENTS ═══════════════
CREATE POLICY "Ingredients viewable by everyone"
  ON public.ingredients FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage ingredients"
  ON public.ingredients FOR ALL
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

-- ═══════════════ COMMENTS ═══════════════
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or admins can delete comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════ RATINGS ═══════════════
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rate once per recipe"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rating"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rating"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);
