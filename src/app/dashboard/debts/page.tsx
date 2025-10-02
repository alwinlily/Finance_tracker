import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getProfile, getDebts } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"

export default async function DebtsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfile()

  if (!profile) {
    redirect("/onboarding")
  }

  const debts = await getDebts()

  const receivables = debts.filter((d) => d.direction === "receivable")
  const payables = debts.filter((d) => d.direction === "payable")

  const DebtCard = ({ debt }: { debt: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {debt.counterparty?.display_name || "Unknown"}
          </CardTitle>
          <Badge variant={debt.status === "overdue" ? "destructive" : "secondary"}>
            {debt.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Principal:</span>
            <span className="font-semibold">{formatCurrency(debt.principal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Outstanding:</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(debt.outstanding || 0)}
            </span>
          </div>
          {debt.due_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span>{new Date(debt.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Debts Manager</h1>
          <p className="text-muted-foreground">
            Track receivables and payables
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Receivables ({receivables.length})
            </h2>
            <div className="space-y-4">
              {receivables.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No receivables
                  </CardContent>
                </Card>
              ) : (
                receivables.map((debt) => <DebtCard key={debt.id} debt={debt} />)
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Payables ({payables.length})
            </h2>
            <div className="space-y-4">
              {payables.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No payables
                  </CardContent>
                </Card>
              ) : (
                payables.map((debt) => <DebtCard key={debt.id} debt={debt} />)
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
