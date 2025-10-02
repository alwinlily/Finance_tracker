// Database types for Finance Tracker

export type Profile = {
  user_id: string
  email: string
  full_name: string | null
  default_currency: string
  timezone: string
  created_at: string
}

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment'

export type Wallet = {
  id: string
  user_id: string
  name: string
  type: WalletType
  opening_balance: number
  currency: string
  is_archived: boolean
  created_at: string
}

export type CategoryKind = 'expense' | 'income' | 'investment'

export type Category = {
  id: string
  user_id: string
  name: string
  kind: CategoryKind
  color: string | null
  created_at: string
}

export type Counterparty = {
  id: string
  user_id: string
  display_name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'investment'
  | 'receivable'
  | 'payable'
  | 'repayment_in'
  | 'repayment_out'

export type Transaction = {
  id: string
  user_id: string
  txn_date: string
  type: TransactionType
  amount: number
  currency: string
  wallet_id: string | null
  category_id: string | null
  counterparty_id: string | null
  description: string | null
  tags: string[]
  attachment_url: string | null
  meta: Record<string, any>
  from_wallet_id: string | null
  to_wallet_id: string | null
  created_at: string
  updated_at: string
}

export type TransactionWithDetails = Transaction & {
  wallet?: Wallet | null
  category?: Category | null
  counterparty?: Counterparty | null
  from_wallet?: Wallet | null
  to_wallet?: Wallet | null
}

export type DebtDirection = 'receivable' | 'payable'
export type DebtStatus = 'open' | 'partial' | 'closed' | 'overdue'

export type Debt = {
  id: string
  user_id: string
  direction: DebtDirection
  counterparty_id: string
  principal: number
  currency: string
  start_date: string
  due_date: string | null
  status: DebtStatus
  notes: string | null
  created_at: string
}

export type DebtWithDetails = Debt & {
  counterparty?: Counterparty
  payments?: DebtPayment[]
  outstanding?: number
}

export type DebtPayment = {
  id: string
  user_id: string
  debt_id: string
  transaction_id: string | null
  amount: number
  paid_at: string
  method: string | null
  created_at: string
}

export type ReminderType = 'debt' | 'generic'

export type Reminder = {
  id: string
  user_id: string
  type: ReminderType
  debt_id: string | null
  title: string
  message: string | null
  channel: string[]
  due_at: string
  recur_rule: string | null
  is_active: boolean
  last_fired_at: string | null
  created_at: string
}

export type ReminderWithDetails = Reminder & {
  debt?: Debt | null
}

export type ReminderLog = {
  id: string
  user_id: string
  reminder_id: string
  fired_at: string
  status: string
  response: Record<string, any> | null
}

export type AuditLog = {
  id: string
  user_id: string
  table_name: string
  row_id: string
  action: 'insert' | 'update' | 'delete'
  diff: Record<string, any> | null
  created_at: string
}

// Utility types for forms
export type CreateWallet = Omit<Wallet, 'id' | 'user_id' | 'created_at'>
export type CreateCategory = Omit<Category, 'id' | 'user_id' | 'created_at'>
export type CreateCounterparty = Omit<Counterparty, 'id' | 'user_id' | 'created_at'>
export type CreateTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type CreateDebt = Omit<Debt, 'id' | 'user_id' | 'created_at' | 'status'>
export type CreateDebtPayment = Omit<DebtPayment, 'id' | 'user_id' | 'created_at'>
export type CreateReminder = Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'last_fired_at'>

// Default categories for onboarding
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', color: '#EF4444' },
  { name: 'Transportation', color: '#F59E0B' },
  { name: 'Shopping', color: '#8B5CF6' },
  { name: 'Entertainment', color: '#EC4899' },
  { name: 'Bills & Utilities', color: '#3B82F6' },
  { name: 'Healthcare', color: '#10B981' },
  { name: 'Education', color: '#6366F1' },
  { name: 'Travel', color: '#14B8A6' },
  { name: 'Personal Care', color: '#F97316' },
  { name: 'Gifts & Donations', color: '#A855F7' },
  { name: 'Insurance', color: '#6B7280' },
  { name: 'Other Expenses', color: '#64748B' },
]

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', color: '#10B981' },
  { name: 'Business Revenue', color: '#059669' },
  { name: 'Freelance', color: '#14B8A6' },
  { name: 'Investment Returns', color: '#0891B2' },
  { name: 'Gifts Received', color: '#A855F7' },
  { name: 'Refunds', color: '#6366F1' },
  { name: 'Other Income', color: '#64748B' },
]

export const DEFAULT_INVESTMENT_CATEGORIES = [
  { name: 'Stocks', color: '#3B82F6' },
  { name: 'Mutual Funds', color: '#8B5CF6' },
  { name: 'Crypto', color: '#F59E0B' },
  { name: 'Real Estate', color: '#059669' },
  { name: 'Business', color: '#6366F1' },
  { name: 'Bonds', color: '#6B7280' },
  { name: 'Other Investments', color: '#64748B' },
]
