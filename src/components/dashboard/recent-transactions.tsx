"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { ArrowRight, TrendingDown, TrendingUp, ArrowLeftRight } from "lucide-react"
import type { TransactionWithDetails } from "@/lib/types"

interface RecentTransactionsProps {
  transactions: TransactionWithDetails[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case "income":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "transfer":
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />
      default:
        return <ArrowRight className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "destructive"
      case "income":
        return "default"
      case "transfer":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="sm" className="mt-4">
                Add Transaction
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {transaction.description || "No description"}
                      </p>
                      <Badge variant={getTypeColor(transaction.type)} className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {transaction.category && (
                        <span className="truncate">{transaction.category.name}</span>
                      )}
                      {transaction.wallet && (
                        <span className="truncate">• {transaction.wallet.name}</span>
                      )}
                      <span>• {new Date(transaction.txn_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className={`text-lg font-semibold ml-4 ${
                  transaction.type === "expense" ? "text-red-600" : "text-green-600"
                }`}>
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount, transaction.currency, false)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
