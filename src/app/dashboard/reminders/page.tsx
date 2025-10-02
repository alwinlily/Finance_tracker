import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getProfile, getReminders } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar } from "lucide-react"

export default async function RemindersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfile()

  if (!profile) {
    redirect("/onboarding")
  }

  const reminders = await getReminders()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Reminders</h1>
          <p className="text-muted-foreground">
            Manage your payment and collection reminders
          </p>
        </div>

        {reminders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reminders set up yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                    <Badge variant={reminder.is_active ? "default" : "secondary"}>
                      {reminder.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reminder.message && (
                      <p className="text-sm text-muted-foreground">
                        {reminder.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(reminder.due_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {reminder.channel.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-xs">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
