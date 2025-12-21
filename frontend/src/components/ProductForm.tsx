import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, X } from "lucide-react";
import { uploadProductImage } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import type { ProductImage } from "@/services/types";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity?: number;
  image?: string;
  images?: ProductImage[];
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: Product) => void;
  product?: Product;
}

const CATEGORIES = ["plants", "medicines", "tools", "fertilizers"];
const MAX_IMAGES = 5;

export const ProductForm = ({
  open,
  onOpenChange,
  onSubmit,
  product,
}: ProductFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "plants",
    stock_quantity: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData(product);
      // Set existing images from the product
      const existing =
        product.images?.map((img) => img.image_url) ||
        (product.image ? [product.image] : []);
      setExistingImages(existing);
      setImagePreviews(existing);
      setSelectedFiles([]);
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "plants",
        stock_quantity: 0,
      });
      setImagePreviews([]);
      setSelectedFiles([]);
      setExistingImages([]);
    }
    setErrors({});
  }, [product, open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = imagePreviews.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of ${MAX_IMAGES} images`,
        variant: "destructive",
      });
      return;
    }

    // Read and preview new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    if (index >= existingImages.length) {
      const fileIndex = index - existingImages.length;
      setSelectedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    } else {
      // Remove from existing images
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!product && imagePreviews.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setUploading(true);
      const imageUrls: string[] = [...existingImages];

      if (selectedFiles.length > 0) {
        try {
          for (const file of selectedFiles) {
            const url = await uploadProductImage(file);
            imageUrls.push(url);
          }
        } catch (error) {
          toast({
            title: "Image upload failed",
            description: "Failed to upload images. Please try again.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      const productData = {
        ...formData,
        image_urls: imageUrls,
        // Keep backward compatibility
        image: imageUrls[0] || "",
      };

      onSubmit(productData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="images">Product Images * (Max {MAX_IMAGES})</Label>

            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border-2"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs text-center py-1">
                      Main Image
                    </div>
                  )}
                </div>
              ))}

              {/* Add Image Button */}
              {imagePreviews.length < MAX_IMAGES && (
                <Label
                  htmlFor="images-upload"
                  className="w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Add Image</span>
                  <span className="text-xs">
                    {imagePreviews.length}/{MAX_IMAGES}
                  </span>
                </Label>
              )}
            </div>

            <input
              id="images-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Upload 1-{MAX_IMAGES} images. The first image will be the main
              product image.
            </p>
            {errors.images && (
              <p className="text-sm text-destructive">{errors.images}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter product description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
              {errors.stock_quantity && (
                <p className="text-sm text-destructive">
                  {errors.stock_quantity}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedFiles.length > 0 ? "Uploading..." : "Saving..."}
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
