"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products/products-table"
import { CreateProductDialog } from "@/components/products/create-product-dialog"
import { fetchProducts, fetchMyProducts } from "@/lib/api/products"
import { useAuth } from "@/hooks/use-auth"

export default function ProductsPage() {
  const { user } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const isAdmin = user?.role === "admin"
  const fetchFunction = isAdmin ? fetchProducts : fetchMyProducts

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products", isAdmin ? "all" : "my"],
    queryFn: fetchFunction,
  })

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span>Products</span>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <ProductsTable products={products || []} isLoading={isLoading} onRefresh={() => refetch()} />
      </div>

      <CreateProductDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={() => refetch()} />
    </div>
  )
}
