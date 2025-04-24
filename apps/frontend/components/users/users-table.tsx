"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  RefreshCw,
  Search,
  PencilIcon,
  TrashIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type User, deleteUser } from "@/lib/api/users";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "@/components/ui/loader";
import { UserDetailsSheet } from "./user-details-sheet";
import { EditUserDialog } from "./edit-user-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onRefreshAction: () => void;
}

export function UsersTable({
  users,
  isLoading,
  onRefreshAction,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to safely format dates with a fallback
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";

    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    return name.includes(query) || email.includes(query);
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  const handleRequestDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser?.id) {
      toast({
        title: "Error",
        description: "Cannot delete user: Missing user ID",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      onRefreshAction();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Failed to delete user",
        description: "There was an error deleting the user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  // Function to generate user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshAction}
            className="h-9 gap-1"
            disabled={isLoading}>
            {isLoading ? (
              <Loader className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>Refresh</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchQuery
                        ? "No users matching your search"
                        : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id || user._id || `user-${Math.random()}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            {user.name || "Unnamed User"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || "No email"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.active ? "default" : "secondary"}
                          className="capitalize">
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleRequestDelete(user)}>
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedUser && (
        <>
          <UserDetailsSheet
            user={selectedUser}
            open={userDetailsOpen}
            onOpenChange={setUserDetailsOpen}
          />
          <EditUserDialog
            user={selectedUser}
            open={editUserOpen}
            onOpenChange={setEditUserOpen}
            onSuccess={onRefreshAction}
          />
          <ConfirmDialog
            title="Delete User"
            description={`Are you sure you want to delete ${
              selectedUser.name || "this user"
            }? This action cannot be undone.`}
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            onConfirm={handleConfirmDelete}
            loading={isDeleting}
          />
        </>
      )}
    </>
  );
}
