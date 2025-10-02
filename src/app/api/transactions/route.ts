import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { createTransaction, updateTransaction, deleteTransaction } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const transaction = await createTransaction(body)

    if (!transaction) {
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const transaction = await updateTransaction(id, updates)

    if (!transaction) {
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Transaction update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const success = await deleteTransaction(id)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete transaction" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Transaction deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
