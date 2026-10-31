-- Run this entire script in Supabase Dashboard → SQL Editor.
-- It is safe to run on a fresh project. Do not expose service-role keys in your frontend.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text not null default 'INR' check (currency = 'INR'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  type text not null check (type in ('income','expense')),
  amount numeric(14,2) not null check (amount > 0),
  category text not null check (char_length(category) between 1 and 60),
  transaction_date date not null default current_date,
  payment_method text not null default 'Other' check (char_length(payment_method) <= 40),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions(user_id, transaction_date desc);
create index if not exists transactions_user_category_idx
  on public.transactions(user_id, category);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (char_length(category) between 1 and 60),
  amount numeric(14,2) not null check (amount > 0),
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  created_at timestamptz not null default now(),
  unique (user_id, category, month)
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  target_amount numeric(14,2) not null check (target_amount > 0),
  saved_amount numeric(14,2) not null default 0 check (saved_amount >= 0 and saved_amount <= target_amount),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  type text not null check (type in ('income','expense')),
  amount numeric(14,2) not null check (amount > 0),
  category text not null,
  frequency text not null check (frequency in ('weekly','monthly','yearly')),
  next_due_date date not null,
  payment_method text not null default 'Other',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS must be enabled on every exposed table.
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.recurring_transactions enable row level security;

-- Profiles are only readable/writable by their owner.
drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Transactions
drop policy if exists "Transactions select own" on public.transactions;
create policy "Transactions select own" on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Transactions insert own" on public.transactions;
create policy "Transactions insert own" on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Transactions update own" on public.transactions;
create policy "Transactions update own" on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Transactions delete own" on public.transactions;
create policy "Transactions delete own" on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Budgets
drop policy if exists "Budgets select own" on public.budgets;
create policy "Budgets select own" on public.budgets for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Budgets insert own" on public.budgets;
create policy "Budgets insert own" on public.budgets for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Budgets update own" on public.budgets;
create policy "Budgets update own" on public.budgets for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Budgets delete own" on public.budgets;
create policy "Budgets delete own" on public.budgets for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Savings goals
drop policy if exists "Goals select own" on public.savings_goals;
create policy "Goals select own" on public.savings_goals for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Goals insert own" on public.savings_goals;
create policy "Goals insert own" on public.savings_goals for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Goals update own" on public.savings_goals;
create policy "Goals update own" on public.savings_goals for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Goals delete own" on public.savings_goals;
create policy "Goals delete own" on public.savings_goals for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Recurring transactions
drop policy if exists "Recurring select own" on public.recurring_transactions;
create policy "Recurring select own" on public.recurring_transactions for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Recurring insert own" on public.recurring_transactions;
create policy "Recurring insert own" on public.recurring_transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Recurring update own" on public.recurring_transactions;
create policy "Recurring update own" on public.recurring_transactions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Recurring delete own" on public.recurring_transactions;
create policy "Recurring delete own" on public.recurring_transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Create a private profile automatically when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Restrict direct API access to signed-in users. RLS still determines row ownership.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.transactions,
  public.budgets, public.savings_goals, public.recurring_transactions to authenticated;
revoke all on public.profiles, public.transactions, public.budgets,
  public.savings_goals, public.recurring_transactions from anon;
