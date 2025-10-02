"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  Users,
  Bell,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/debts", label: "Debts", icon: Users },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 max-w-7xl">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            Finance Tracker
          </span>
        </Link>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
