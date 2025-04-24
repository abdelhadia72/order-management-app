"use client";

import { format } from "date-fns";
import { CalendarClock, MapPin, Mail, Phone, User2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type User } from "@/lib/api/users";

interface UserDetailsSheetProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsSheet({
  user,
  open,
  onOpenChange,
}: UserDetailsSheetProps) {
  // Helper function to safely format dates with a fallback
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";

    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.warn(`Invalid date format: ${dateString}`);
      return "Invalid date";
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>
            Detailed information about this user.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name || "User avatar"} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {user.name || "Unnamed User"}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-1 h-4 w-4" />
                {user.email || "No email provided"}
              </div>
              <Badge variant="outline" className="mt-1">
                {user.role || "User"}
              </Badge>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact Information</h4>
            {user.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {user.phone}
              </div>
            )}
            {user.address && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                {user.address}
              </div>
            )}

            <Separator className="my-4" />

            <h4 className="text-sm font-semibold">System Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-sm font-medium">User ID</span>
                <span className="text-sm">{user.id || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm">{formatDate(user.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={user.active ? "default" : "secondary"}>
                  {user.active ? "Active" : "Active"}
                </Badge>
              </div>
            </div>

            {user.notes && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Notes</h4>
                  <p className="text-sm text-muted-foreground">{user.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
