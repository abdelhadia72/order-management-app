"use client"

import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Order } from "@/lib/api/orders"

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80"
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id.substring(0, 8)} - Created on {format(new Date(order.createdAt), "MMMM dd, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-medium">Products</h3>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="font-medium">Total</p>
            <p className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
