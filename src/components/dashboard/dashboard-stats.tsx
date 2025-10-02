"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import type { Wallet as WalletType, TransactionWithDetails, DebtWithDetails } from "@/lib/types"

interface DashboardStatsProps {
  wallets: WalletType[]
  transactions: TransactionWithDetails[]
  debts: DebtWithDetails[]
}

export function DashboardStats({
  wallets,
  transactions,
  debts,
}: DashboardStatsProps) {
  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => {
    const walletTransactions = transactions.filter(
      (t) => t.wallet_id === wallet.id || t.to_wallet_id === wallet.id || t.from_wallet_id === wallet.id
    )

    let balance = wallet.opening_balance

    walletTransactions.forEach((t) => {
      if (t.type === "expense" && t.wallet_id === wallet.id) {
        balance -= t.amount
      } else if (t.type === "income" && t.wallet_id === wallet.id) {
        balance += t.amount
      } else if (t.type === "transfer") {
        if (t.from_wallet_id === wallet.id) balance -= t.amount
        if (t.to_wallet_id === wallet.id) balance += t.amount
      } else if (t.type === "investment" && t.wallet_id === wallet.id) {
        balance -= t.amount
      } else if (t.type === "repayment_out" && t.wallet_id === wallet.id) {
        balance -= t.amount
      } else if (t.type === "repayment_in" && t.wallet_id === wallet.id) {
        balance += t.amount
      }
    })

    return sum + balance
  }, 0)

  // Calculate total expenses this month
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate total income this month
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate outstanding debts
  const totalReceivables = debts
    .filter((d) => d.direction === "receivable" && d.status !== "closed")
    .reduce((sum, d) => sum + (d.outstanding || 0), 0)

  const totalPayables = debts
    .filter((d) => d.direction === "payable" && d.status !== "closed")
    .reduce((sum, d) => sum + (d.outstanding || 0), 0)

  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "This Month Expenses",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "This Month Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Net Outstanding",
      value: formatCurrency(totalReceivables - totalPayables),
      icon: AlertCircle,
      color: totalReceivables > totalPayables
        ? "text-green-600 dark:text-green-400"
        : "text-orange-600 dark:text-orange-400",
      bgColor: totalReceivables > totalPayables
        ? "bg-green-100 dark:bg-green-900/30"
        : "bg-orange-100 dark:bg-orange-900/30",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
