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

-- WALLETS
create policy "wallets_select_own" on public.wallets for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "wallets_cud_own_insert" on public.wallets for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "wallets_cud_own_update" on public.wallets for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "wallets_cud_own_delete" on public.wallets for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- CATEGORIES
create policy "categories_select_own" on public.categories for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "categories_insert_own" on public.categories for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "categories_update_own" on public.categories for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "categories_delete_own" on public.categories for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- COUNTERPARTIES
create policy "counterparties_select_own" on public.counterparties for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "counterparties_insert_own" on public.counterparties for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "counterparties_update_own" on public.counterparties for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "counterparties_delete_own" on public.counterparties for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- TRANSACTIONS
create policy "transactions_select_own" on public.transactions for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "transactions_insert_own" on public.transactions for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "transactions_update_own" on public.transactions for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "transactions_delete_own" on public.transactions for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- DEBTS
create policy "debts_select_own" on public.debts for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "debts_insert_own" on public.debts for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "debts_update_own" on public.debts for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "debts_delete_own" on public.debts for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- DEBT_PAYMENTS
create policy "debt_payments_select_own" on public.debt_payments for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "debt_payments_insert_own" on public.debt_payments for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "debt_payments_update_own" on public.debt_payments for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "debt_payments_delete_own" on public.debt_payments for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- REMINDERS
create policy "reminders_select_own" on public.reminders for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "reminders_insert_own" on public.reminders for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);
create policy "reminders_update_own" on public.reminders for update to authenticated
using (auth.jwt()->>'sub' = user_id) with check (auth.jwt()->>'sub' = user_id);
create policy "reminders_delete_own" on public.reminders for delete to authenticated
using (auth.jwt()->>'sub' = user_id);

-- REMINDER_LOGS
create policy "reminder_logs_select_own" on public.reminder_logs for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "reminder_logs_insert_own" on public.reminder_logs for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);

-- AUDIT_LOGS (read back your own entries only)
create policy "audit_logs_select_own" on public.audit_logs for select to authenticated
using (auth.jwt()->>'sub' = user_id);
create policy "audit_logs_insert_own" on public.audit_logs for insert to authenticated
with check (auth.jwt()->>'sub' = user_id);