"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Order } from "@/lib/api/orders"

interface UpdateOrderStatusDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (orderId: string, status: Order["status"]) => Promise<void>
}

export function UpdateOrderStatusDialog({ order, open, onOpenChange, onUpdate }: UpdateOrderStatusDialogProps) {
  const [status, setStatus] = useState<Order["status"]>(order.status)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (status === order.status) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate(order.id, status)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>Change the status for order #{order.id.substring(0, 8)}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={status} onValueChange={(value) => setStatus(value as Order["status"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || status === order.status}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
