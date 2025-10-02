-- Temporarily disable RLS for development with service role key
-- WARNING: Only use this in development!

alter table public.profiles        disable row level security;
alter table public.wallets         disable row level security;
alter table public.categories      disable row level security;
alter table public.counterparties  disable row level security;
alter table public.transactions    disable row level security;
alter table public.debts           disable row level security;
alter table public.debt_payments   disable row level security;
alter table public.reminders       disable row level security;
alter table public.reminder_logs   disable row level security;
alter table public.audit_logs      disable row level security;
