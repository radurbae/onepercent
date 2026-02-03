-- =====================================================
-- 1% Better - RPG Gamification Schema
-- Supabase Database Migration
-- =====================================================

-- =====================================================
-- NEW TABLES
-- =====================================================

-- Player Profile (game stats per user)
create table public.player_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level int not null default 1,
  xp int not null default 0,
  gold int not null default 0,
  rank text not null default 'E' check (rank in ('E', 'D', 'C', 'B', 'A', 'S', 'SS')),
  equipped_title text,
  equipped_badge text,
  equipped_theme text default 'default',
  created_at timestamptz default now()
);

-- Loot (collectible items)
create table public.loot (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('title', 'badge', 'theme', 'frame')),
  name text not null,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  unlocked_at timestamptz default now(),
  unique (user_id, type, name)
);

-- Daily Summary (aggregated daily stats)
create table public.daily_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  completed_count int not null default 0,
  scheduled_count int not null default 0,
  cleared boolean not null default false,
  unique (user_id, date)
);

-- Reward Ledger (idempotent reward tracking)
create table public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  date date not null,
  xp_delta int not null default 0,
  gold_delta int not null default 0,
  reason text not null,
  created_at timestamptz default now(),
  unique (user_id, habit_id, date, reason)
);

-- =====================================================
-- INDEXES
-- =====================================================

create index loot_user_id_idx on public.loot(user_id);
create index loot_type_idx on public.loot(type);
create index daily_summary_user_date_idx on public.daily_summary(user_id, date);
create index reward_ledger_user_date_idx on public.reward_ledger(user_id, date);
create index reward_ledger_habit_idx on public.reward_ledger(habit_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

alter table public.player_profile enable row level security;
alter table public.loot enable row level security;
alter table public.daily_summary enable row level security;
alter table public.reward_ledger enable row level security;

-- =====================================================
-- PLAYER_PROFILE POLICIES
-- =====================================================

create policy "Users can view own profile"
  on public.player_profile for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.player_profile for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.player_profile for update
  using (auth.uid() = user_id);

-- =====================================================
-- LOOT POLICIES
-- =====================================================

create policy "Users can view own loot"
  on public.loot for select
  using (auth.uid() = user_id);

create policy "Users can insert own loot"
  on public.loot for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own loot"
  on public.loot for delete
  using (auth.uid() = user_id);

-- =====================================================
-- DAILY_SUMMARY POLICIES
-- =====================================================

create policy "Users can view own daily_summary"
  on public.daily_summary for select
  using (auth.uid() = user_id);

create policy "Users can upsert own daily_summary"
  on public.daily_summary for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily_summary"
  on public.daily_summary for update
  using (auth.uid() = user_id);

-- =====================================================
-- REWARD_LEDGER POLICIES
-- =====================================================

create policy "Users can view own reward_ledger"
  on public.reward_ledger for select
  using (auth.uid() = user_id);

create policy "Users can insert own reward_ledger"
  on public.reward_ledger for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reward_ledger"
  on public.reward_ledger for delete
  using (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Auto-create player profile
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.player_profile (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger to auto-create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
