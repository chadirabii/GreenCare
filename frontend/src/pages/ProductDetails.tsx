import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProduct,
  deleteProduct,
  type Product,
} from "@/services/productService";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const isOwner = product?.owner === user?.id;

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        navigate("/products");
        return;
      }

      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate, toast]);

  const handleDeleteConfirm = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id);

      toast({
        title: "Product deleted",
        description: "The product has been removed successfully.",
      });

      navigate("/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (updatedProduct: Product) => {
    setProduct(updatedProduct);

    toast({
      title: "Product updated",
      description: "The product has been updated successfully.",
    });

    setIsFormOpen(false);
  };

  if (loading || !product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="aspect-square rounded-lg overflow-hidden bg-muted"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                ${product.price}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Product Details</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category:</dt>
                  <dd className="font-medium capitalize">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Seller:</dt>
                  <dd className="font-medium">{product.owner_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Product ID:</dt>
                  <dd className="font-medium">{product.id}</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        product={product}
      />

      <DeleteProductDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        productName={product.name}
      />
    </AppLayout>
  );
};

export default ProductDetails;
