import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { initializeUserData } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, fullName } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const success = await initializeUserData(email, fullName)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to initialize user data" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
