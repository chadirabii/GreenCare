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
import { Upload, Loader2 } from "lucide-react";
import { uploadProductImage } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: Product) => void;
  product?: Product;
}

const CATEGORIES = ["plants", "medicines", "tools", "fertilizers"];

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
    image: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.image);
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "plants",
        image: "",
      });
      setImagePreview("");
      setSelectedFile(null);
    }
    setErrors({});
  }, [product, open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    if (!product && !selectedFile && !formData.image) {
      newErrors.image = "Product image is required";
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
      let imageUrl = formData.image;

      // Upload image to Cloudinary if a new file is selected
      if (selectedFile) {
        try {
          imageUrl = await uploadProductImage(selectedFile);
        } catch (error) {
          toast({
            title: "Image upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      const productData = {
        ...formData,
        image: imageUrl,
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
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted border-2 border-dashed">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </span>
                  </Button>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Square image, at least 500x500px
                </p>
                {errors.image && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
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
              <Label htmlFor="category">Category *</Label>
              <Select
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
                  {selectedFile ? "Uploading..." : "Saving..."}
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
