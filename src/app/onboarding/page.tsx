import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getProfile, initializeUserData } from "@/lib/db"
import { OnboardingForm } from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  // Check if user already has a profile
  const profile = await getProfile()

  if (profile) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Finance Tracker</h1>
          <p className="text-muted-foreground">
            Let's set up your account to start tracking your finances
          </p>
        </div>

        <OnboardingForm
          email={user.emailAddresses[0]?.emailAddress || ""}
          fullName={user.fullName || ""}
        />
      </div>
    </div>
  )
}
