"use client"

import { format } from "date-fns"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/api/products"

interface ProductDetailsSheetProps {
  product: Product
  open: boolean
  onOpenChangeAction: (open: boolean) => void
}

const formatDateSafely = (dateValue: string | number | Date | null | undefined): string => {
  if (!dateValue) return "N/A";

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "PPP");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export function ProductDetailsSheet({ product, open, onOpenChangeAction }: ProductDetailsSheetProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChangeAction(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Product Details</SheetTitle>
          <SheetDescription>Viewing details for {product.name}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Product Information</h3>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Name</span>
                <span className="text-sm">{product.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Description</span>
                <p className="mt-1 text-sm">{product.description}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Price</span>
                <span className="text-sm">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Stock</span>
                <span className="text-sm">{product.stock}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Product ID</span>
                <span className="text-sm font-mono">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created By</span>
                <span className="text-sm font-mono">{product.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm">{formatDateSafely(product.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm">{formatDateSafely(product.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
