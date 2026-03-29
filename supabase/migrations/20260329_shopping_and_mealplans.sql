-- ─── Shopping List Items ─────────────────────────────
create table shopping_list_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  quantity text,
  unit text,
  category text default 'Άλλα',
  is_checked boolean default false,
  recipe_id uuid references recipes(id) on delete set null,
  recipe_title text,
  created_at timestamptz default now()
);

-- RLS
alter table shopping_list_items enable row level security;
create policy "Users manage own shopping items"
  on shopping_list_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast user lookups
create index idx_shopping_list_user on shopping_list_items(user_id);

-- ─── Meal Plans ──────────────────────────────────────
create table meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id uuid references recipes(id) on delete set null,
  custom_title text,
  custom_description text,
  calories int,
  created_at timestamptz default now(),
  unique(user_id, date, meal_type)
);

-- RLS
alter table meal_plans enable row level security;
create policy "Users manage own meal plans"
  on meal_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast week lookups
create index idx_meal_plans_user_date on meal_plans(user_id, date);
