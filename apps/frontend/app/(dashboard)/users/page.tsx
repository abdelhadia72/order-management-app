"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/shell";
import { DashboardHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { fetchUsers } from "@/lib/api/users";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "@/components/ui/loader";

export default function UsersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        return await fetchUsers();
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error fetching users",
          description: "Failed to load the user list. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Users"
        description="View and manage your users.">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader className="h-6 w-6" />
          <span className="ml-2">Loading users...</span>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center p-8 text-red-500">
          <p>
            Error loading users:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button variant="outline" className="ml-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <UsersTable users={users} isLoading={false} onRefreshAction={refetch} />
      )}

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </DashboardShell>
  );
}
