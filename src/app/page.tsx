import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/auth-header";
import { getCurrentUser } from "@/lib/user";
import { getProfile } from "@/lib/db";
import { Wallet, TrendingUp, Bell, PieChart } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    const profile = await getProfile();

    if (!profile) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <AuthHeader />
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Finance Tracker
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Track expenses, manage debts, and monitor investments with AI-powered insights
        </p>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Track Expenses</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor daily expenses across multiple wallets and categories
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Manage Debts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track receivables and payables with automated reminders
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Smart Reminders</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Never miss a payment with recurring reminder notifications
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-semibold">AI Insights</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get intelligent categorization and spending analysis
            </p>
          </div>
        </div>

        <div className="text-center">
          <AuthHeader showGetStarted={true} />
        </div>
      </main>
    </div>
  );
}
