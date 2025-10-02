# Spec — Daily Expense, Debt & Investment Tracking App (Clerk + Supabase)

## 1) Purpose & Scope

* Track **business investments**, **personal expenses**, and **debts/receivables**.
* **Reminders** to collect receivables and to pay debts.
* **Dashboard**: where money goes by period, top categories, trends.
* Stack: **Next.js (App Router)**, **Supabase (DB + Edge Functions + Cron)**, **Clerk (Auth)**, **ai-sdk**.

## 2) Key Features

**MVP**

1. **Auth** (Clerk).
2. **Wallets/Accounts** (cash/bank/e-wallet; opening balances).
3. **Transactions** (expense, income, transfer, investment, receivable/payable, repayments) with categories/tags/attachments.
4. **Debt Manager** (receivables/payables; due dates; partial payments).
5. **Reminder Engine** (email/Telegram/WA webhook; recurring rules).
6. **Dashboard** (period filters; cards + charts).
7. **AI Categorization** (ai-sdk) with manual override.

**Nice-to-Have**

* Multi-currency + FX snapshot.
* OCR receipts.
* Rules engine (merchant→category).
* Shared read-only ledger.

## 3) High-Level Flow

1. **Onboarding**: sign in → create `profile` row (user_id from Clerk) + default wallet; set timezone `Asia/Jakarta`, currency `IDR`.
2. **Enter transactions**: quick form; optional OCR→AI suggest.
3. **Manage debts**: create receivable/payable; set reminders; record partial/full repayments.
4. **Reminders**: daily cron calls an Edge Function → send notifications → log → reschedule if recurring.
5. **Dashboard**: filter and visualize spend/cashflow/debt status.
6. **Audit**: soft-delete or audit logs for edits.

---

## 4) Database (Postgres/Supabase) — **Clerk-first, RLS-ready**

**Core rules**

* Every table has: `user_id text not null` (Clerk `sub`).
* RLS compares `(auth.jwt()->>'sub')` to `user_id`.
* Money in **IDR minor units** (`bigint`).
* Time as `timestamptz` default `now()` (UI uses Asia/Jakarta).
* **Composite FKs** enforce tenancy: `(user_id, child_fk) → (user_id, parent_pk)`.

### 4.1 DDL (copy-paste)

```sql
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
  user_id text not null,                                 -- copy from actor’s JWT at trigger time
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
```

### 4.2 RLS — **Enable + Policies (Clerk sub vs user_id)**

> Pattern applies to **every table with `user_id`**. Copy the block and replace the table name.

```sql
-- Enable RLS on all tables
alter table public.profiles        enable row level security;
alter table public.wallets         enable row level security;
alter table public.categories      enable row level security;
alter table public.counterparties  enable row level security;
alter table public.transactions    enable row level security;
alter table public.debts           enable row level security;
alter table public.debt_payments   enable row level security;
alter table public.reminders       enable row level security;
alter table public.reminder_logs   enable row level security;
alter table public.audit_logs      enable row level security;

-- Helper macro (repeat per table). Example for "public.tasks" shown by you:
-- SELECT: user sees only their rows
-- INSERT: user may only insert their user_id
-- UPDATE: user may update only their rows
-- DELETE: user may delete only their rows

-- PROFILES: one row per user; allow self read/write
create policy "profiles_select_own"
on public.profiles for select to authenticated
using (auth.jwt()->>'sub' = user_id);

create policy "profiles_insert_self"
on public.profiles for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);

create policy "profiles_update_self"
on public.profiles for update to authenticated
using (auth.jwt()->>'sub' = user_id)
with check (auth.jwt()->>'sub' = user_id);

-- Repeat for each table below (wallets, categories, counterparties, transactions, debts, debt_payments, reminders, reminder_logs, audit_logs):

create policy "wallets_select_own" on public.wallets for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "wallets_cud_own_insert" on public.wallets for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "wallets_cud_own_update" on public.wallets for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "wallets_cud_own_delete" on public.wallets for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- categories
create policy "categories_select_own" on public.categories for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "categories_insert_own" on public.categories for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "categories_update_own" on public.categories for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "categories_delete_own" on public.categories for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- counterparties
create policy "counterparties_select_own" on public.counterparties for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "counterparties_insert_own" on public.counterparties for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "counterparties_update_own" on public.counterparties for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "counterparties_delete_own" on public.counterparties for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- transactions
create policy "transactions_select_own" on public.transactions for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "transactions_insert_own" on public.transactions for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "transactions_update_own" on public.transactions for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "transactions_delete_own" on public.transactions for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- debts
create policy "debts_select_own" on public.debts for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "debts_insert_own" on public.debts for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "debts_update_own" on public.debts for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "debts_delete_own" on public.debts for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- debt_payments
create policy "debt_payments_select_own" on public.debt_payments for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "debt_payments_insert_own" on public.debt_payments for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "debt_payments_update_own" on public.debt_payments for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "debt_payments_delete_own" on public.debt_payments for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- reminders
create policy "reminders_select_own" on public.reminders for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "reminders_insert_own" on public.reminders for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "reminders_update_own" on public.reminders for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "reminders_delete_own" on public.reminders for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- reminder_logs
create policy "reminder_logs_select_own" on public.reminder_logs for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "reminder_logs_insert_own" on public.reminder_logs for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);

-- audit_logs (read back your own entries only)
create policy "audit_logs_select_own" on public.audit_logs for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "audit_logs_insert_own" on public.audit_logs for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
```

---

## 5) Business Rules (unchanged)

* Default TZ: **Asia/Jakarta** (do conversions in UI/Edge Functions).
* Money: `bigint` (IDR minor units).
* Debt status auto:

  * payments sum `= 0` → `open`
  * `0 < sum < principal` → `partial`
  * `>= principal` → `closed`
  * `due_date < today` and not closed → `overdue` (daily job).

## 6) Example Queries (same semantics)

**Top expense categories**

```sql
select c.name, sum(t.amount) as total_idr
from public.transactions t
left join public.categories c
  on c.user_id = t.user_id and c.id = t.category_id
where t.user_id = :uid
  and t.type = 'expense'
  and t.txn_date between :start and :end
group by c.name
order by total_idr desc
limit 10;
```

**Outstanding receivables**

```sql
select d.id, cp.display_name,
       d.principal - coalesce(sum(dp.amount),0) as outstanding
from public.debts d
left join public.debt_payments dp
  on dp.user_id = d.user_id and dp.debt_id = d.id
left join public.counterparties cp
  on cp.user_id = d.user_id and cp.id = d.counterparty_id
where d.user_id = :uid
  and d.direction = 'receivable'
  and d.status <> 'closed'
group by d.id, cp.display_name;
```

---

## 7) Edge Functions & Cron (short)

* `reminder_dispatcher`:

  * fetch `reminders where user_id = jwt.sub and is_active and due_at <= now()`
  * send via channels; write `reminder_logs`; compute next `due_at` if `recur_rule`.
* Supabase Scheduled Cron: run daily **08:00 Asia/Jakarta**.

---

## 8) API Contracts (short)

* `POST /api/transactions` (auth required; backend sets `user_id = jwt.sub`).
* `POST /api/debts` (optional `create_reminder`).
* `POST /api/reminders/fire` (cron-protected).

---

## 9) Screens / UX (short)

* **Dashboard** (cards + period filters + charts).
* **Transactions** (table + filters + add/edit; AI suggest).
* **Debts** (receivable/payable tabs; payments; reminders).
* **Reminders** (list/status/last fired).
* **Settings** (wallets, categories, channels, TZ/currency).

---

### Notes that matter

* **Composite FKs** keep tenants isolated at the DB level; RLS prevents cross-tenant reads/writes.
* You **must** pass the Clerk JWT to Supabase so `auth.jwt()->>'sub'` resolves.
* For **serverless API routes** (Next.js), **never** trust client `user_id`; derive it from the verified token and inject into queries.

If you want, I can also add:

* a **seed SQL** for common categories,
* a **`reminder_dispatcher`** Edge Function (TypeScript) skeleton,
* or a **Next.js API handler** that safely binds `user_id` from Clerk JWT to inserts.