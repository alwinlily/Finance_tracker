import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getProfile, getTransactions, getWallets, getCategories, getCounterparties } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { AddTransactionButton } from "@/components/transactions/add-transaction-button"

export default async function TransactionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfile()

  if (!profile) {
    redirect("/onboarding")
  }

  const [transactions, wallets, categories, counterparties] = await Promise.all([
    getTransactions(),
    getWallets(),
    getCategories(),
    getCounterparties(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transactions</h1>
            <p className="text-muted-foreground">
              Track and manage all your financial transactions
            </p>
          </div>
          <AddTransactionButton
            wallets={wallets}
            categories={categories}
            counterparties={counterparties}
          />
        </div>

        <TransactionsTable
          transactions={transactions}
          wallets={wallets}
          categories={categories}
          counterparties={counterparties}
        />
      </main>
    </div>
  )
}
