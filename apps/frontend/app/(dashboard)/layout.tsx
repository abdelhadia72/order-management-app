"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // This ensures we only run client-side code after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only redirect if we're on the client and not loading
    if (isClient && !isLoading && !isAuthenticated && !pathname.includes("/login") && !pathname.includes("/register")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, pathname, isClient])

  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If not authenticated and not on auth pages, don't render anything
  // This prevents flashing content before redirect
  if (!isAuthenticated && !pathname.includes("/login") && !pathname.includes("/register")) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
