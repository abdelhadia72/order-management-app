"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Users,
  Settings,
  History,
  CreditCard,
  Lock,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === "admin"

  const menuItems = [
    {
      title: "Users",
      href: "/users",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: ShoppingCart,
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || isAdmin)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Sidebar variant="sidebar" className="border-r border-border bg-muted/40">
      <SidebarHeader className="py-6 px-5">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Order Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={pathname === item.href ? "bg-primary/10 text-primary font-medium" : ""}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
