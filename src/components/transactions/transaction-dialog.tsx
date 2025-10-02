"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Sparkles } from "lucide-react"
import { parseCurrencyInput } from "@/lib/currency"
import type { Wallet, Category, Counterparty, TransactionType } from "@/lib/types"

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallets: Wallet[]
  categories: Category[]
  counterparties: Counterparty[]
  initialData?: any
}

export function TransactionDialog({
  open,
  onOpenChange,
  wallets,
  categories,
  counterparties,
  initialData,
}: TransactionDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAISuggesting, setIsAISuggesting] = useState(false)
  const [formData, setFormData] = useState({
    type: (initialData?.type as TransactionType) || ("expense" as TransactionType),
    amount: initialData?.amount ? String(initialData.amount / 100) : "",
    txn_date: initialData?.txn_date || new Date().toISOString().split("T")[0],
    wallet_id: initialData?.wallet_id || "",
    category_id: initialData?.category_id || "",
    counterparty_id: initialData?.counterparty_id || "",
    description: initialData?.description || "",
    tags: initialData?.tags || [],
    from_wallet_id: initialData?.from_wallet_id || "",
    to_wallet_id: initialData?.to_wallet_id || "",
    currency: initialData?.currency || "IDR",
  })

  const filteredCategories = categories.filter((cat) => {
    if (formData.type === "expense") return cat.kind === "expense"
    if (formData.type === "income") return cat.kind === "income"
    if (formData.type === "investment") return cat.kind === "investment"
    return false
  })

  const handleAISuggest = async () => {
    if (!formData.description) return

    setIsAISuggesting(true)

    try {
      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          type: formData.type,
          categories: filteredCategories.map((c) => ({ id: c.id, name: c.name })),
        }),
      })

      if (response.ok) {
        const { categoryId } = await response.json()
        if (categoryId) {
          setFormData({ ...formData, category_id: categoryId })
        }
      }
    } catch (error) {
      console.error("AI categorization error:", error)
    } finally {
      setIsAISuggesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        amount: parseCurrencyInput(formData.amount),
        wallet_id: formData.wallet_id || null,
        category_id: formData.category_id || null,
        counterparty_id: formData.counterparty_id || null,
        from_wallet_id: formData.from_wallet_id || null,
        to_wallet_id: formData.to_wallet_id || null,
        tags: [],
        attachment_url: null,
        meta: {},
      }

      const response = await fetch("/api/transactions", {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialData ? { id: initialData.id, ...payload } : payload),
      })

      if (!response.ok) throw new Error("Failed to save transaction")

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving transaction:", error)
      alert("Failed to save transaction")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            Enter the transaction details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as TransactionType, category_id: "" })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="txn_date">Date</Label>
              <Input
                id="txn_date"
                type="date"
                value={formData.txn_date}
                onChange={(e) => setFormData({ ...formData, txn_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="flex gap-2">
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this transaction for?"
                rows={2}
              />
              {formData.type !== "transfer" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAISuggest}
                  disabled={!formData.description || isAISuggesting}
                  className="whitespace-nowrap"
                >
                  {isAISuggesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (IDR)</Label>
            <Input
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          {formData.type === "transfer" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_wallet_id">From Wallet</Label>
                <Select
                  value={formData.from_wallet_id}
                  onValueChange={(value) => setFormData({ ...formData, from_wallet_id: value })}
                >
                  <SelectTrigger id="from_wallet_id">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_wallet_id">To Wallet</Label>
                <Select
                  value={formData.to_wallet_id}
                  onValueChange={(value) => setFormData({ ...formData, to_wallet_id: value })}
                >
                  <SelectTrigger id="to_wallet_id">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="wallet_id">Wallet</Label>
                <Select
                  value={formData.wallet_id}
                  onValueChange={(value) => setFormData({ ...formData, wallet_id: value })}
                >
                  <SelectTrigger id="wallet_id">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="counterparty_id">Counterparty (Optional)</Label>
            <Select
              value={formData.counterparty_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, counterparty_id: value === "none" ? "" : value })}
            >
              <SelectTrigger id="counterparty_id">
                <SelectValue placeholder="Select counterparty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {counterparties.map((cp) => (
                  <SelectItem key={cp.id} value={cp.id}>
                    {cp.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
