"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { fetchOrders } from "@/lib/api/orders"
import { fetchProducts } from "@/lib/api/products"
// import { DashboardStats } from "@/components/dashboard/dashboard-stats"
// import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
// import { ProductsOverview } from "@/components/dashboard/products-overview"

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: !!user,
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: !!user,
  })

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "User"}</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats
            orders={orders || []}
            products={products || []}
            isLoading={ordersLoading || productsLoading}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your most recent orders</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrdersTable orders={orders?.slice(0, 5) || []} isLoading={ordersLoading} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Products Overview</CardTitle>
                <CardDescription>Your product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductsOverview products={products || []} isLoading={productsLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Manage and view all your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentOrdersTable orders={orders || []} isLoading={ordersLoading} showPagination />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsOverview products={products || []} isLoading={productsLoading} showActions showPagination />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
