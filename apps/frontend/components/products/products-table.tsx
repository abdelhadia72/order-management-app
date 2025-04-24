"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { Edit, MoreHorizontal, Trash, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { type Product, deleteProduct } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { EditProductDialog } from "./edit-product-dialog"
import { ProductDetailsSheet } from "./product-details-sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductsTableProps {
  products: Product[]
  isLoading: boolean
  onRefreshAction: () => void
}

export function ProductsTable({ products, isLoading, onRefreshAction }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "description",
        header: "DESCRIPTION",
        cell: ({ row }) => {
          const description = row.getValue("description") as string
          return <div className="max-w-[200px] truncate">{description}</div>
        },
      },
      {
        accessorKey: "price",
        header: "PRICE",
        cell: ({ row }) => {
          const price = Number.parseFloat(row.getValue("price"))
          return <div>${price.toFixed(2)}</div>
        },
      },
      {
        accessorKey: "stock",
        header: "STOCK",
        cell: ({ row }) => {
          return <div>{row.getValue("stock")}</div>
        },
      },
      {
        accessorKey: "createdAt",
        header: "CREATED",
        cell: ({ row }) => {
          try {
            const dateValue = row.getValue("createdAt");
            if (!dateValue) return "N/A";

            const date = new Date(dateValue as string | number | Date);

            if (isNaN(date.getTime())) {
              return "Invalid date";
            }

            return format(date, "dd MMM, yyyy HH:mm");
          } catch (error) {
            console.error("Date formatting error:", error);
            return "Invalid date";
          }
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(product)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => confirmDelete(product.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete)
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      })
      onRefreshAction()
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the product.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border-t">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} of {products.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <>
          <EditProductDialog
            product={selectedProduct}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={onRefreshAction}
          />
          <ProductDetailsSheet
            product={selectedProduct}
            open={isDetailsSheetOpen}
            onOpenChangeAction={setIsDetailsSheetOpen}
          />
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
