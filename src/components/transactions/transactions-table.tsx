"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { Pencil, Trash2 } from "lucide-react"
import { TransactionDialog } from "./transaction-dialog"
import type { TransactionWithDetails, Wallet, Category, Counterparty } from "@/lib/types"

interface TransactionsTableProps {
  transactions: TransactionWithDetails[]
  wallets: Wallet[]
  categories: Category[]
  counterparties: Counterparty[]
}

export function TransactionsTable({
  transactions,
  wallets,
  categories,
  counterparties,
}: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | null>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "destructive"
      case "income":
        return "default"
      case "transfer":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No transactions found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Click "Add Transaction" to get started
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(transaction.txn_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeColor(transaction.type)} className="text-xs">
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.description || "-"}</TableCell>
                <TableCell>{transaction.category?.name || "-"}</TableCell>
                <TableCell>{transaction.wallet?.name || "-"}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    transaction.type === "expense"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(transaction.amount, transaction.currency, false)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingTransaction && (
        <TransactionDialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          wallets={wallets}
          categories={categories}
          counterparties={counterparties}
          initialData={editingTransaction}
        />
      )}
    </>
  )
}
