-- EXTENSIONS
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ========== PROFILES (Clerk user mirror) ==========
create table if not exists public.profiles (
  user_id text primary key,                            -- Clerk sub
  email text not null,
  full_name text,
  default_currency text not null default 'IDR',
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now()
);

-- ========== WALLETS ==========
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  name text not null,                                  -- e.g., BCA, Cash, OVO
  type text not null check (type in ('cash','bank','ewallet','investment')),
  opening_balance bigint not null default 0,
  currency text not null default 'IDR',
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists wallets_user_idx on public.wallets(user_id);

-- ========== CATEGORIES ==========
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('expense','income','investment')),
  color text,
  created_at timestamptz not null default now(),
  unique(user_id, name, kind)
);
create index if not exists categories_user_idx on public.categories(user_id);

-- ========== COUNTERPARTIES ==========
create table if not exists public.counterparties (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  display_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists counterparties_user_idx on public.counterparties(user_id);

-- ========== TRANSACTIONS ==========
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  txn_date date not null,
  type text not null check (type in (
    'expense','income','transfer','investment',
    'receivable','payable','repayment_in','repayment_out'
  )),
  amount bigint not null,                               -- positive; sign handled in queries
  currency text not null default 'IDR',
  wallet_id uuid,                                       -- required for non-transfer cash moves
  category_id uuid,
  counterparty_id uuid,
  description text,
  tags text[] not null default '{}',
  attachment_url text,
  meta jsonb not null default '{}'::jsonb,
  from_wallet_id uuid,
  to_wallet_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- tenancy-safe references
  constraint tx_wallet_fk
    foreign key (user_id, wallet_id) references public.wallets(user_id, id) on delete set null,
  constraint tx_category_fk
    foreign key (user_id, category_id) references public.categories(user_id, id) on delete set null,
  constraint tx_counterparty_fk
    foreign key (user_id, counterparty_id) references public.counterparties(user_id, id) on delete set null,
  constraint tx_from_wallet_fk
    foreign key (user_id, from_wallet_id) references public.wallets(user_id, id) on delete set null,
  constraint tx_to_wallet_fk
    foreign key (user_id, to_wallet_id) references public.wallets(user_id, id) on delete set null,

  -- correctness checks
  constraint tx_transfer_check check (
    (type <> 'transfer' and from_wallet_id is null and to_wallet_id is null)
    or
    (type = 'transfer' and from_wallet_id is not null and to_wallet_id is not null and wallet_id is null)
  ),
  constraint tx_wallet_required check (
    (type in ('expense','income','investment','repayment_in','repayment_out') and wallet_id is not null)
    or
    (type in ('transfer','receivable','payable'))
  )
);
create index if not exists transactions_user_date_idx on public.transactions(user_id, txn_date);
create index if not exists transactions_user_type_idx on public.transactions(user_id, type);
create index if not exists transactions_user_cat_idx on public.transactions(user_id, category_id);

-- ========== DEBTS (headers) ==========
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  direction text not null check (direction in ('receivable','payable')),
  counterparty_id uuid not null,
  principal bigint not null,
  currency text not null default 'IDR',
  start_date date not null default (now() at time zone 'Asia/Jakarta')::date,
  due_date date,
  status text not null default 'open' check (status in ('open','partial','closed','overdue')),
  notes text,
  created_at timestamptz not null default now(),

  constraint debt_counterparty_fk
    foreign key (user_id, counterparty_id) references public.counterparties(user_id, id) on delete restrict
);
create index if not exists debts_user_idx on public.debts(user_id);
create index if not exists debts_user_due_idx on public.debts(user_id, due_date);

-- ========== DEBT PAYMENTS ==========
create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  debt_id uuid not null,
  transaction_id uuid,                                   -- optional link to real cash txn
  amount bigint not null,
  paid_at date not null,
  method text,
  created_at timestamptz not null default now(),

  constraint dp_debt_fk
    foreign key (user_id, debt_id) references public.debts(user_id, id) on delete cascade,
  constraint dp_tx_fk
    foreign key (user_id, transaction_id) references public.transactions(user_id, id) on delete set null
);
create index if not exists debt_payments_user_idx on public.debt_payments(user_id);
create index if not exists debt_payments_user_debt_idx on public.debt_payments(user_id, debt_id);

-- ========== REMINDERS ==========
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  type text not null check (type in ('debt','generic')),
  debt_id uuid,
  title text not null,
  message text,
  channel text[] not null default '{email}',             -- ['email','telegram','webhook']
  due_at timestamptz not null,
  recur_rule text,                                       -- RFC 5545 RRULE string, optional
  is_active boolean not null default true,
  last_fired_at timestamptz,
  created_at timestamptz not null default now(),

  constraint reminder_debt_fk
    foreign key (user_id, debt_id) references public.debts(user_id, id) on delete cascade
);
create index if not exists reminders_user_due_idx on public.reminders(user_id, due_at);

-- ========== REMINDER LOGS ==========
create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(user_id) on delete cascade,
  reminder_id uuid not null,
  fired_at timestamptz not null default now(),
  status text not null,                                  -- sent/failed
  response jsonb,

  constraint rlog_reminder_fk
    foreign key (user_id, reminder_id) references public.reminders(user_id, id) on delete cascade
);
create index if not exists reminder_logs_user_idx on public.reminder_logs(user_id);
create index if not exists reminder_logs_user_rem_idx on public.reminder_logs(user_id, reminder_id);

-- ========== AUDIT LOGS (optional) ==========
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,                                 -- copy from actor's JWT at trigger time
  table_name text not null,
  row_id uuid not null,
  action text not null check (action in ('insert','update','delete')),
  diff jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_user_idx on public.audit_logs(user_id);

-- ========== UPDATED_AT TRIGGER (optional convenience) ==========
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_transactions_touch on public.transactions;
create trigger trg_transactions_touch
before update on public.transactions
for each row execute function public.touch_updated_at();
