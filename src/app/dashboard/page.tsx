import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getProfile, getWallets, getTransactions, getDebts } from "@/lib/db"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { DebtsSummary } from "@/components/dashboard/debts-summary"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfile()

  if (!profile) {
    redirect("/onboarding")
  }

  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [wallets, transactions, debts] = await Promise.all([
    getWallets(),
    getTransactions({
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0],
    }),
    getDebts(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <DashboardStats
            wallets={wallets}
            transactions={transactions}
            debts={debts}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingChart transactions={transactions} />
            <DebtsSummary debts={debts} />
          </div>

          <RecentTransactions transactions={transactions.slice(0, 10)} />
        </div>
      </main>
    </div>
  )
}