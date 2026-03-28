-- ══════════════════════════════════════════════════════
-- VibeBites – Initial Database Schema
-- ══════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ══════════════════════ PROFILES ══════════════════════
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ══════════════════════ RECIPES ══════════════════════
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
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  -- Full-Text Search (Greek dictionary)
  fts          TSVECTOR GENERATED ALWAYS AS (
                 to_tsvector('simple', unaccent(coalesce(title, '') || ' ' || coalesce(description, '')))
               ) STORED
);

CREATE INDEX idx_recipes_fts ON public.recipes USING GIN (fts);
CREATE INDEX idx_recipes_slug ON public.recipes (slug);
CREATE INDEX idx_recipes_author ON public.recipes (author_id);
CREATE INDEX idx_recipes_created ON public.recipes (created_at DESC);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ══════════════════════ INGREDIENTS ══════════════════════
CREATE TABLE public.ingredients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id  UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  quantity   TEXT,
  unit       TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_ingredients_recipe ON public.ingredients (recipe_id, sort_order);

-- ══════════════════════ COMMENTS ══════════════════════
CREATE TABLE public.comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  photo_url   TEXT,
  parent_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_recipe ON public.comments (recipe_id, created_at);
CREATE INDEX idx_comments_parent ON public.comments (parent_id);

-- ══════════════════════ RATINGS ══════════════════════
CREATE TABLE public.ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id  UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score      INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (recipe_id, user_id)
);

CREATE INDEX idx_ratings_recipe ON public.ratings (recipe_id);

-- ══════════════════════ FULL-TEXT SEARCH FUNCTION ══════════════════════
-- Strips Greek accents and performs fuzzy matching
CREATE OR REPLACE FUNCTION search_recipes(query TEXT)
RETURNS SETOF public.recipes AS $$
  SELECT *
  FROM public.recipes
  WHERE fts @@ plainto_tsquery('simple', unaccent(query))
  ORDER BY ts_rank(fts, plainto_tsquery('simple', unaccent(query))) DESC;
$$ LANGUAGE sql STABLE;

-- ══════════════════════ AVERAGE RATING VIEW ══════════════════════
CREATE OR REPLACE VIEW public.recipe_ratings_avg AS
  SELECT
    recipe_id,
    ROUND(AVG(score)::numeric, 1) AS average_rating,
    COUNT(*) AS total_ratings
  FROM public.ratings
  GROUP BY recipe_id;
