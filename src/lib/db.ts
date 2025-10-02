// Database utility functions for Finance Tracker
import { createSupabaseServerClient } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/user"
import type {
  Profile,
  Wallet,
  Category,
  Counterparty,
  Transaction,
  TransactionWithDetails,
  Debt,
  DebtWithDetails,
  DebtPayment,
  Reminder,
  ReminderWithDetails,
  CreateWallet,
  CreateCategory,
  CreateCounterparty,
  CreateTransaction,
  CreateDebt,
  CreateDebtPayment,
  CreateReminder,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_INVESTMENT_CATEGORIES,
} from "@/lib/types"

// ========== PROFILES ==========

export async function getOrCreateProfile(
  email: string,
  fullName?: string
): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  // Try to get existing profile
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (existing) return existing

  // Create new profile
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      email,
      full_name: fullName || null,
      default_currency: "IDR",
      timezone: "Asia/Jakarta",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  return data
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(
  updates: Partial<Omit<Profile, "user_id" | "created_at">>
): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

// ========== WALLETS ==========

export async function getWallets(): Promise<Wallet[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching wallets:", error)
    return []
  }

  return data || []
}

export async function createWallet(wallet: CreateWallet): Promise<Wallet | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("wallets")
    .insert({
      user_id: user.id,
      ...wallet,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating wallet:", error)
    return null
  }

  return data
}

export async function updateWallet(
  id: string,
  updates: Partial<CreateWallet>
): Promise<Wallet | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("wallets")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating wallet:", error)
    return null
  }

  return data
}

export async function deleteWallet(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("wallets").delete().eq("id", id)

  if (error) {
    console.error("Error deleting wallet:", error)
    return false
  }

  return true
}

// ========== CATEGORIES ==========

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("kind", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export async function createCategory(
  category: CreateCategory
): Promise<Category | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      ...category,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    return null
  }

  return data
}

export async function updateCategory(
  id: string,
  updates: Partial<CreateCategory>
): Promise<Category | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating category:", error)
    return null
  }

  return data
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    return false
  }

  return true
}

// ========== COUNTERPARTIES ==========

export async function getCounterparties(): Promise<Counterparty[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("counterparties")
    .select("*")
    .order("display_name", { ascending: true })

  if (error) {
    console.error("Error fetching counterparties:", error)
    return []
  }

  return data || []
}

export async function createCounterparty(
  counterparty: CreateCounterparty
): Promise<Counterparty | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("counterparties")
    .insert({
      user_id: user.id,
      ...counterparty,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating counterparty:", error)
    return null
  }

  return data
}

export async function updateCounterparty(
  id: string,
  updates: Partial<CreateCounterparty>
): Promise<Counterparty | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("counterparties")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating counterparty:", error)
    return null
  }

  return data
}

export async function deleteCounterparty(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("counterparties").delete().eq("id", id)

  if (error) {
    console.error("Error deleting counterparty:", error)
    return false
  }

  return true
}

// ========== TRANSACTIONS ==========

export async function getTransactions(
  filters?: {
    startDate?: string
    endDate?: string
    type?: string
    walletId?: string
    categoryId?: string
  }
): Promise<TransactionWithDetails[]> {
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from("transactions")
    .select("*")

  if (filters?.startDate) {
    query = query.gte("txn_date", filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte("txn_date", filters.endDate)
  }
  if (filters?.type) {
    query = query.eq("type", filters.type)
  }
  if (filters?.walletId) {
    query = query.eq("wallet_id", filters.walletId)
  }
  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId)
  }

  const { data: transactions, error } = await query.order("txn_date", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  if (!transactions) return []

  // Fetch related data separately to avoid join issues
  const walletIds = new Set<string>()
  const categoryIds = new Set<string>()
  const counterpartyIds = new Set<string>()

  transactions.forEach((t) => {
    if (t.wallet_id) walletIds.add(t.wallet_id)
    if (t.category_id) categoryIds.add(t.category_id)
    if (t.counterparty_id) counterpartyIds.add(t.counterparty_id)
    if (t.from_wallet_id) walletIds.add(t.from_wallet_id)
    if (t.to_wallet_id) walletIds.add(t.to_wallet_id)
  })

  // Fetch wallets
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .in("id", Array.from(walletIds))

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .in("id", Array.from(categoryIds))

  // Fetch counterparties
  const { data: counterparties } = await supabase
    .from("counterparties")
    .select("*")
    .in("id", Array.from(counterpartyIds))

  // Map to lookup objects
  const walletMap = new Map(wallets?.map((w) => [w.id, w]) || [])
  const categoryMap = new Map(categories?.map((c) => [c.id, c]) || [])
  const counterpartyMap = new Map(counterparties?.map((c) => [c.id, c]) || [])

  // Combine data
  const result: TransactionWithDetails[] = transactions.map((t) => ({
    ...t,
    wallet: t.wallet_id ? walletMap.get(t.wallet_id) : undefined,
    category: t.category_id ? categoryMap.get(t.category_id) : undefined,
    counterparty: t.counterparty_id ? counterpartyMap.get(t.counterparty_id) : undefined,
    from_wallet: t.from_wallet_id ? walletMap.get(t.from_wallet_id) : undefined,
    to_wallet: t.to_wallet_id ? walletMap.get(t.to_wallet_id) : undefined,
  }))

  return result
}

export async function createTransaction(
  transaction: CreateTransaction
): Promise<Transaction | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      ...transaction,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating transaction:", error)
    return null
  }

  return data
}

export async function updateTransaction(
  id: string,
  updates: Partial<CreateTransaction>
): Promise<Transaction | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating transaction:", error)
    return null
  }

  return data
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting transaction:", error)
    return false
  }

  return true
}

// ========== DEBTS ==========

export async function getDebts(
  direction?: "receivable" | "payable"
): Promise<DebtWithDetails[]> {
  const supabase = await createSupabaseServerClient()

  let query = supabase.from("debts").select("*")

  if (direction) {
    query = query.eq("direction", direction)
  }

  const { data: debts, error } = await query.order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching debts:", error)
    return []
  }

  if (!debts) return []

  // Fetch related data
  const counterpartyIds = debts.map((d) => d.counterparty_id).filter(Boolean)
  const debtIds = debts.map((d) => d.id)

  const { data: counterparties } = await supabase
    .from("counterparties")
    .select("*")
    .in("id", counterpartyIds)

  const { data: payments } = await supabase
    .from("debt_payments")
    .select("*")
    .in("debt_id", debtIds)

  const counterpartyMap = new Map(counterparties?.map((c) => [c.id, c]) || [])
  const paymentsMap = new Map<string, any[]>()

  payments?.forEach((p) => {
    if (!paymentsMap.has(p.debt_id)) {
      paymentsMap.set(p.debt_id, [])
    }
    paymentsMap.get(p.debt_id)!.push(p)
  })

  // Calculate outstanding for each debt
  const debtsWithOutstanding = debts.map((debt) => {
    const debtPayments = paymentsMap.get(debt.id) || []
    const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0)

    return {
      ...debt,
      counterparty: counterpartyMap.get(debt.counterparty_id),
      payments: debtPayments,
      outstanding: debt.principal - totalPaid,
    }
  })

  return debtsWithOutstanding
}

export async function createDebt(debt: CreateDebt): Promise<Debt | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      status: "open",
      ...debt,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating debt:", error)
    return null
  }

  return data
}

export async function updateDebt(
  id: string,
  updates: Partial<CreateDebt>
): Promise<Debt | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("debts")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating debt:", error)
    return null
  }

  return data
}

export async function deleteDebt(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("debts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting debt:", error)
    return false
  }

  return true
}

// ========== DEBT PAYMENTS ==========

export async function createDebtPayment(
  payment: CreateDebtPayment
): Promise<DebtPayment | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("debt_payments")
    .insert({
      user_id: user.id,
      ...payment,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating debt payment:", error)
    return null
  }

  // Update debt status after payment
  await updateDebtStatus(payment.debt_id)

  return data
}

async function updateDebtStatus(debtId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()

  // Get debt and payments
  const { data: debt } = await supabase
    .from("debts")
    .select("*, payments:debt_payments(*)")
    .eq("id", debtId)
    .single()

  if (!debt) return

  const totalPaid = debt.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0

  let status: "open" | "partial" | "closed" | "overdue" = "open"

  if (totalPaid >= debt.principal) {
    status = "closed"
  } else if (totalPaid > 0) {
    status = "partial"
  }

  // Check if overdue
  if (
    debt.due_date &&
    new Date(debt.due_date) < new Date() &&
    status !== "closed"
  ) {
    status = "overdue"
  }

  await supabase.from("debts").update({ status }).eq("id", debtId)
}

// ========== REMINDERS ==========

export async function getReminders(): Promise<ReminderWithDetails[]> {
  const supabase = await createSupabaseServerClient()

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*")
    .order("due_at", { ascending: true })

  if (error) {
    console.error("Error fetching reminders:", error)
    return []
  }

  if (!reminders) return []

  // Fetch related debts
  const debtIds = reminders.map((r) => r.debt_id).filter(Boolean)

  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .in("id", debtIds)

  const debtMap = new Map(debts?.map((d) => [d.id, d]) || [])

  return reminders.map((r) => ({
    ...r,
    debt: r.debt_id ? debtMap.get(r.debt_id) : undefined,
  }))
}

export async function createReminder(
  reminder: CreateReminder
): Promise<Reminder | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      ...reminder,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating reminder:", error)
    return null
  }

  return data
}

export async function updateReminder(
  id: string,
  updates: Partial<CreateReminder>
): Promise<Reminder | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("reminders")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating reminder:", error)
    return null
  }

  return data
}

export async function deleteReminder(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("reminders").delete().eq("id", id)

  if (error) {
    console.error("Error deleting reminder:", error)
    return false
  }

  return true
}

// ========== ONBOARDING ==========

export async function initializeUserData(
  email: string,
  fullName?: string
): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const supabase = await createSupabaseServerClient()

  try {
    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        email,
        full_name: fullName || null,
        default_currency: "IDR",
        timezone: "Asia/Jakarta",
      })
      .select()
      .single()

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return false
    }

    // Create default wallet
    await supabase.from("wallets").insert({
      user_id: user.id,
      name: "Cash",
      type: "cash",
      opening_balance: 0,
      currency: "IDR",
      is_archived: false,
    })

    // Create default categories
    const { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_INVESTMENT_CATEGORIES } = await import("@/lib/types")

    const categories = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        kind: "expense" as const,
        color: cat.color,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        kind: "income" as const,
        color: cat.color,
      })),
      ...DEFAULT_INVESTMENT_CATEGORIES.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        kind: "investment" as const,
        color: cat.color,
      })),
    ]

    await supabase.from("categories").insert(categories)

    return true
  } catch (error) {
    console.error("Error initializing user data:", error)
    return false
  }
}
