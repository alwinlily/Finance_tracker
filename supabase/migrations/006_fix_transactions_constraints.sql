-- Drop the problematic composite foreign keys and replace with simple ones
-- This will make the queries work correctly

-- First, drop existing constraints if they exist
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_wallet_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_category_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_counterparty_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_from_wallet_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_to_wallet_fk;

-- Add back simple foreign keys (without composite user_id check)
ALTER TABLE public.transactions
  ADD CONSTRAINT tx_wallet_fk
  FOREIGN KEY (wallet_id)
  REFERENCES public.wallets(id)
  ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD CONSTRAINT tx_category_fk
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD CONSTRAINT tx_counterparty_fk
  FOREIGN KEY (counterparty_id)
  REFERENCES public.counterparties(id)
  ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD CONSTRAINT tx_from_wallet_fk
  FOREIGN KEY (from_wallet_id)
  REFERENCES public.wallets(id)
  ON DELETE SET NULL;

ALTER TABLE public.transactions
  ADD CONSTRAINT tx_to_wallet_fk
  FOREIGN KEY (to_wallet_id)
  REFERENCES public.wallets(id)
  ON DELETE SET NULL;

-- Do the same for debts table
ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debt_counterparty_fk;
ALTER TABLE public.debts
  ADD CONSTRAINT debt_counterparty_fk
  FOREIGN KEY (counterparty_id)
  REFERENCES public.counterparties(id)
  ON DELETE RESTRICT;

-- Do the same for debt_payments table
ALTER TABLE public.debt_payments DROP CONSTRAINT IF EXISTS dp_debt_fk;
ALTER TABLE public.debt_payments DROP CONSTRAINT IF EXISTS dp_tx_fk;

ALTER TABLE public.debt_payments
  ADD CONSTRAINT dp_debt_fk
  FOREIGN KEY (debt_id)
  REFERENCES public.debts(id)
  ON DELETE CASCADE;

ALTER TABLE public.debt_payments
  ADD CONSTRAINT dp_tx_fk
  FOREIGN KEY (transaction_id)
  REFERENCES public.transactions(id)
  ON DELETE SET NULL;

-- Do the same for reminders table
ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminder_debt_fk;
ALTER TABLE public.reminders
  ADD CONSTRAINT reminder_debt_fk
  FOREIGN KEY (debt_id)
  REFERENCES public.debts(id)
  ON DELETE CASCADE;

-- Do the same for reminder_logs table
ALTER TABLE public.reminder_logs DROP CONSTRAINT IF EXISTS rlog_reminder_fk;
ALTER TABLE public.reminder_logs
  ADD CONSTRAINT rlog_reminder_fk
  FOREIGN KEY (reminder_id)
  REFERENCES public.reminders(id)
  ON DELETE CASCADE;
