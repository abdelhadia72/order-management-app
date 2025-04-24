"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { createOrder } from "@/lib/api/orders";
import { fetchProducts, type Product } from "@/lib/api/products";
import { logObject } from "@/utils/debug-console";

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const createOrderSchema = z.object({
  products: z.array(orderItemSchema).min(1, "At least one product is required"),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

export function CreateOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Fetching products...");
      try {
        const result = await fetchProducts();
        console.log("Products fetched successfully:", result.length);
        if (result.length > 0) {
          logObject("First product from API", result[0]);
        }
        return result;
      } catch (err) {
        console.error("Error fetching products:", err);
        toast({
          title: "Failed to load products",
          description: "Could not load the product list. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    enabled: open,
    staleTime: 30000,
  });

  useEffect(() => {
    if (products.length > 0) {
      console.log(`Loaded ${products.length} products for selection`);
    } else if (products.length === 0 && !productsLoading && open) {
      console.log("No products available to display");
    }
  }, [products, productsLoading, open]);

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      products: [{ productId: "", quantity: 1 }],
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        products: [{ productId: "", quantity: 1 }],
      });
    }
  }, [open, form]);

  const addProduct = () => {
    const currentProducts = form.getValues("products");
    form.setValue("products", [
      ...currentProducts,
      { productId: "", quantity: 1 },
    ]);
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getValues("products");
    if (currentProducts.length > 1) {
      form.setValue(
        "products",
        currentProducts.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (data: CreateOrderFormValues) => {
    setIsSubmitting(true);
    try {
      const validProducts = data.products.filter(
        (item) =>
          item.productId && item.productId.trim() !== "" && item.quantity > 0
      );

      if (validProducts.length === 0) {
        toast({
          title: "Invalid order",
          description: "Please select at least one valid product.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        items: validProducts.map((item) => ({
          productId: parseInt(item.productId, 10),
          quantity: Number(item.quantity),
        })),
      };

      await createOrder(orderData);

      toast({
        title: "Order created",
        description: "Your order has been created successfully.",
      });
      form.reset({
        products: [{ productId: "", quantity: 1 }],
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Failed to create order",
        description:
          "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Add products to your order. Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {form.watch("products").map((_, index) => (
                <div
                  key={`product-item-${index}`}
                  className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`products.${index}.productId`}
                    render={({ field }) => (
                      <FormItem
                        key={`product-field-${index}`}
                        className="flex-1">
                        <FormLabel>Product {index + 1}</FormLabel>
                        <Select
                          disabled={productsLoading}
                          value={field.value}
                          onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productsLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : productsError ? (
                              <div className="p-2 text-center text-sm text-red-500">
                                Error loading products
                              </div>
                            ) : products.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No products available
                              </div>
                            ) : (
                              products.map((product) => {
                                const productId =
                                  product.id?.toString() ||
                                  product._id?.toString() ||
                                  String(product.productId);

                                if (!productId) {
                                  console.warn(
                                    "Product with no ID found:",
                                    product
                                  );
                                  return null;
                                }

                                return (
                                  <SelectItem
                                    key={`product-option-${productId}`}
                                    value={productId}>
                                    {product.name} - $
                                    {product.price?.toFixed(2) || "0.00"}{" "}
                                    {product.stock > 0
                                      ? `(${product.stock} in stock)`
                                      : "(Out of stock)"}
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem
                        key={`quantity-field-${index}`}
                        className="w-24">
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(index)}
                    disabled={form.watch("products").length <= 1}
                    className="mb-2">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove product</span>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProduct}
                className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Order"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
