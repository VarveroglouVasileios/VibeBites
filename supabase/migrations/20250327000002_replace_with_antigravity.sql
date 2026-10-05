-- ══════════════════════════════════════════════════════
-- VibeBites – RESET AND APPLY ANTIGRAVITY SCHEMA (v2 - Fixed FTS)
-- ══════════════════════════════════════════════════════

-- 1. DROP EXISTING TABLES (CASCADE)
DROP TABLE IF EXISTS public.recipe_bookmarks CASCADE;
DROP TABLE IF EXISTS public.recipe_ratings CASCADE;
DROP TABLE IF EXISTS public.comment_media CASCADE;
DROP TABLE IF EXISTS public.recipe_media CASCADE;
DROP TABLE IF EXISTS public.recipe_ingredients CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.ingredients CASCADE;

-- DROP FUNCTIONS AND TRIGGERS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.search_recipes(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.build_recipe_tsvector(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.refresh_recipe_search_tsv() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.auto_promote_admin() CASCADE;

-- DROP TYPES
DROP TYPE IF EXISTS public.app_role CASCADE;

-- 2. APPLY SCHEMA
CREATE EXTENSION IF NOT EXISTS unaccent;

-- PROFILES
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RECIPES (FTS as regular column for trigger)
CREATE TABLE public.recipes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  instructions JSONB NOT NULL DEFAULT '[]',
  cook_time    INT,
  servings     INT,
  is_vegan     BOOLEAN DEFAULT false,
  media_urls   TEXT[] DEFAULT '{}',
  og_image_url TEXT,
  fts          TSVECTOR,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recipes_fts ON public.recipes USING GIN (fts);
CREATE INDEX idx_recipes_slug ON public.recipes (slug);
CREATE INDEX idx_recipes_author ON public.recipes (author_id);
CREATE INDEX idx_recipes_created ON public.recipes (created_at DESC);

-- INGREDIENTS
CREATE TABLE public.ingredients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id  UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  quantity   TEXT,
  unit       TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_ingredients_recipe ON public.ingredients (recipe_id, sort_order);

-- COMMENTS
CREATE TABLE public.comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  photo_url   TEXT,
  parent_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RATINGS
CREATE TABLE public.ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id  UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score      INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (recipe_id, user_id)
);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FTS Trigger Function
CREATE OR REPLACE FUNCTION public.refresh_recipe_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('simple', unaccent(coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER recipes_fts_update BEFORE INSERT OR UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.refresh_recipe_fts();

-- SEARCH FUNCTION
CREATE OR REPLACE FUNCTION search_recipes(query TEXT)
RETURNS SETOF public.recipes AS $$
  SELECT *
  FROM public.recipes
  WHERE fts @@ plainto_tsquery('simple', unaccent(query))
  ORDER BY ts_rank(fts, plainto_tsquery('simple', unaccent(query))) DESC;
$$ LANGUAGE sql STABLE;

-- VIEW
CREATE OR REPLACE VIEW public.recipe_ratings_avg AS
  SELECT
    recipe_id,
    ROUND(AVG(score)::numeric, 1) AS average_rating,
    COUNT(*) AS total_ratings
  FROM public.ratings
  GROUP BY recipe_id;

-- RLS
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Recipes are viewable by everyone" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Only admins can create recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can update recipes" ON public.recipes FOR UPDATE USING (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Authors or admins can delete recipes" ON public.recipes FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Ingredients viewable by everyone" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Recipe author can insert ingredients" ON public.ingredients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND author_id = auth.uid()));
CREATE POLICY "Recipe author can update ingredients" ON public.ingredients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND author_id = auth.uid()));
CREATE POLICY "Recipe author can delete ingredients" ON public.ingredients FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND author_id = auth.uid()));

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or admins can delete comments" ON public.comments FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate once per recipe" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rating" ON public.ratings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rating" ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-media', 'recipe-media', true), ('avatars', 'avatars', true), ('comment-photos', 'comment-photos', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Anyone can view recipe media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recipe media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recipe media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view comment photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload comment photos" ON storage.objects;
CREATE POLICY "Anyone can view recipe media" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-media');
CREATE POLICY "Authenticated users can upload recipe media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own recipe media" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view comment photos" ON storage.objects FOR SELECT USING (bucket_id = 'comment-photos');
CREATE POLICY "Authenticated users can upload comment photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comment-photos' AND auth.role() = 'authenticated');

-- ADMIN PROMOTION
CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  IF user_email IN ('varveroglou@hotmail.gr') THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_promote_admin_trigger BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();

-- PERMISSIONS
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.recipes TO anon, authenticated;
GRANT SELECT ON public.ingredients TO anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT SELECT ON public.ratings TO anon, authenticated;
GRANT SELECT ON public.recipe_ratings_avg TO anon, authenticated;
