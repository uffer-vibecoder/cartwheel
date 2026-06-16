-- whim — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: uses "if not exists" / "or replace".

-- ── Profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_emoji text default '🛒',
  saved_total  numeric not null default 0,
  created_at   timestamptz not null default now()
);

-- ── Daydreams (the "purchase" history of a fake store) ──────────────────────
create table if not exists public.daydreams (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  total          numeric not null default 0,
  window_seconds integer not null default 30,
  surprise       boolean not null default false,
  items          jsonb not null default '[]'::jsonb,
  placed_at      timestamptz not null default now()
);
create index if not exists daydreams_user_idx on public.daydreams (user_id, placed_at desc);

-- ── Drop subscriptions (for future "notify me on new drops") ────────────────
create table if not exists public.drop_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  drop_id    text not null,
  created_at timestamptz not null default now(),
  unique (user_id, drop_id)
);

-- ── Row Level Security: everyone sees only their own rows ───────────────────
alter table public.profiles           enable row level security;
alter table public.daydreams          enable row level security;
alter table public.drop_subscriptions enable row level security;

drop policy if exists "own profile"        on public.profiles;
drop policy if exists "own daydreams"      on public.daydreams;
drop policy if exists "own subscriptions"  on public.drop_subscriptions;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own daydreams" on public.daydreams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own subscriptions" on public.drop_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Auto-create a profile row when a user signs up ──────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
