"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { ArrowRight, AlertCircle } from "lucide-react"
import type { DebtWithDetails } from "@/lib/types"

interface DebtsSummaryProps {
  debts: DebtWithDetails[]
}

export function DebtsSummary({ debts }: DebtsSummaryProps) {
  const activeDebts = debts.filter((d) => d.status !== "closed")
  const overdueDebts = activeDebts.filter((d) => d.status === "overdue")

  const totalReceivables = debts
    .filter((d) => d.direction === "receivable" && d.status !== "closed")
    .reduce((sum, d) => sum + (d.outstanding || 0), 0)

  const totalPayables = debts
    .filter((d) => d.direction === "payable" && d.status !== "closed")
    .reduce((sum, d) => sum + (d.outstanding || 0), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "destructive"
      case "partial":
        return "default"
      case "open":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Debts Summary</CardTitle>
        <Link href="/dashboard/debts">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Receivables</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalReceivables)}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Payables</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalPayables)}
              </div>
            </div>
          </div>

          {overdueDebts.length > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {overdueDebts.length} Overdue Debt{overdueDebts.length > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                You have overdue debts that need attention
              </p>
            </div>
          )}

          {activeDebts.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Recent Active Debts
              </div>
              {activeDebts.slice(0, 3).map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {debt.counterparty?.display_name || "Unknown"}
                      </span>
                      <Badge variant={getStatusColor(debt.status)} className="text-xs">
                        {debt.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {debt.direction === "receivable" ? "Owes you" : "You owe"}
                      {debt.due_date && ` • Due ${new Date(debt.due_date).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ml-4 ${
                    debt.direction === "receivable" ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatCurrency(debt.outstanding || 0, debt.currency, false)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No active debts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
