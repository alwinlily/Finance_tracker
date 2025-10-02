import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getProfile, getWallets, getCategories } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { Wallet, Tag } from "lucide-react"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfile()

  if (!profile) {
    redirect("/onboarding")
  }

  const [wallets, categories] = await Promise.all([
    getWallets(),
    getCategories(),
  ])

  const expenseCategories = categories.filter((c) => c.kind === "expense")
  const incomeCategories = categories.filter((c) => c.kind === "income")
  const investmentCategories = categories.filter((c) => c.kind === "investment")

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your wallets, categories, and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium">{profile.full_name || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-medium">{profile.default_currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timezone:</span>
                <span className="font-medium">{profile.timezone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Wallets */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <CardTitle>Wallets ({wallets.length})</CardTitle>
              </div>
              <CardDescription>Manage your accounts and wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{wallet.name}</span>
                      <Badge variant="outline">{wallet.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Opening Balance: {formatCurrency(wallet.opening_balance)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <CardTitle>Categories ({categories.length})</CardTitle>
              </div>
              <CardDescription>Organize your transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-600">
                  Expense ({expenseCategories.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expenseCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="outline"
                      style={{ borderColor: cat.color || undefined }}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-green-600">
                  Income ({incomeCategories.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {incomeCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="outline"
                      style={{ borderColor: cat.color || undefined }}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-blue-600">
                  Investment ({investmentCategories.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {investmentCategories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="outline"
                      style={{ borderColor: cat.color || undefined }}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
