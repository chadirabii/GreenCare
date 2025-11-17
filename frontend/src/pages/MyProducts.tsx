import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "@/components/ProductForm";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product as ProductType,
} from "@/services/productService";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const MyProducts = () => {
  const [myProducts, setMyProducts] = useState<ProductType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deletingProduct, setDeletingProduct] = useState<
    ProductType | undefined
  >();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const products = await getMyProducts();
      setMyProducts(products);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "seller") {
      toast({
        title: "Access Denied",
        description: "Only sellers can manage products",
        variant: "destructive",
      });
      navigate("/products");
      return;
    }
    fetchMyProducts();
  }, [user]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductType) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: ProductType) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      await fetchMyProducts();
      toast({
        title: "Product deleted",
        description: "Your product has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setDeletingProduct(undefined);
    }
  };

  const handleFormSubmit = async (product: Product) => {
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, product);
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        });
      } else {
        await createProduct(product);
        toast({
          title: "Product added",
          description: "Your product has been added successfully.",
        });
      }
      await fetchMyProducts();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your listed products
            </p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your products...</p>
          </div>
        ) : myProducts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              You haven't listed any products yet
            </p>
            <Button onClick={handleAddProduct}>Add Your First Product</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myProducts.map((product, index) => {
              const fallbackImage = product.image || "/placeholder.svg";

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-32 flex-shrink-0">
                      <ProductImageCarousel
                        images={product.images}
                        fallbackImage={fallbackImage}
                        productName={product.name}
                        autoPlayInterval={3000}
                        className="rounded-lg overflow-hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-primary whitespace-nowrap">
                          ${product.price}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {product.category}
                        </span>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        product={editingProduct}
      />

      <DeleteProductDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        productName={deletingProduct?.name || ""}
      />
    </AppLayout>
  );
};

export default MyProducts;
