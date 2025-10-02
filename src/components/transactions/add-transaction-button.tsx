"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TransactionDialog } from "./transaction-dialog"
import type { Wallet, Category, Counterparty } from "@/lib/types"

interface AddTransactionButtonProps {
  wallets: Wallet[]
  categories: Category[]
  counterparties: Counterparty[]
}

export function AddTransactionButton({
  wallets,
  categories,
  counterparties,
}: AddTransactionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        <Plus className="w-4 h-4 mr-2" />
        Add Transaction
      </Button>

      <TransactionDialog
        open={open}
        onOpenChange={setOpen}
        wallets={wallets}
        categories={categories}
        counterparties={counterparties}
      />
    </>
  )
}
