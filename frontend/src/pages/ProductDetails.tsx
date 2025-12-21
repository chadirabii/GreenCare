import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ShoppingCart,
  Store,
  Calendar,
  Package,
  Check,
  Star,
} from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
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

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to purchase products.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (product && product.stock_quantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    setIsPurchaseOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!product || !id) return;

    if (quantity < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.stock_quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stock_quantity} items available.`,
        variant: "destructive",
      });
      return;
    }

    // Navigate to checkout page with product and quantity
    navigate("/checkout", {
      state: {
        productId: id,
        quantity: quantity,
      },
    });
  };

  const productImages = product?.images?.length
    ? product.images.map((img) => img.image_url)
    : product?.image
    ? [product.image]
    : [];

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
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header Navigation */}
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {productImages.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {productImages.map((imageUrl, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-square rounded-xl overflow-hidden bg-muted border shadow-lg">
                            <img
                              src={imageUrl}
                              alt={`${product.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                ) : (
                  <div className="aspect-square rounded-xl overflow-hidden bg-muted border shadow-lg">
                    <img
                      src={productImages[0] || "/placeholder-product.png"}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                {productImages.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      {productImages.length} images available
                    </Badge>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              <Badge className="text-xs uppercase tracking-wide">
                {product.category}
              </Badge>

              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-muted text-muted" />
                  <span className="ml-1">(4.0)</span>
                </div>
              </div>

              {/* Price */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <span className="text-muted-foreground">USD</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {product.stock_quantity > 0 ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          {product.stock_quantity} in Stock
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-600">Out of Stock</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Button */}
              {!isOwner && (
                <Button
                  size="lg"
                  className="w-full gap-2 text-lg h-14"
                  onClick={handlePurchase}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock_quantity > 0 ? "Purchase Now" : "Out of Stock"}
                </Button>
              )}

              {isOwner && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      You own this product
                    </p>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <Separator />

              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Seller Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seller:</span>
                      <span className="font-medium">{product.owner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{product.owner_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listed:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product ID:</span>
                      <span className="font-mono text-xs">{product.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Updated:
                      </span>
                      <span className="text-xs">
                        {new Date(product.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  On orders over $50
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Quality Guaranteed</h3>
                <p className="text-sm text-muted-foreground">
                  100% satisfaction guarantee
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Trusted Seller</h3>
                <p className="text-sm text-muted-foreground">
                  Verified marketplace seller
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

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

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Quantity</DialogTitle>
            <DialogDescription>
              Choose how many items you'd like to purchase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Available: {product.stock_quantity} items
              </p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span className="text-primary">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Shipping and taxes will be calculated at checkout
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Proceed to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProductDetails;
