import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '@/components/ProductForm';
import { DeleteProductDialog } from '@/components/DeleteProductDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ownerId: string;
  ownerName: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Tomato Seeds',
    description: 'High-quality organic tomato seeds for home gardening',
    price: 4.99,
    category: 'plants',
    image: '/placeholder.svg',
    ownerId: 'user1',
    ownerName: 'GreenCare Store',
  },
  {
    id: '2',
    name: 'Garden Fertilizer Pro',
    description: 'Advanced NPK formula for all plants',
    price: 19.99,
    category: 'fertilizers',
    image: '/placeholder.svg',
    ownerId: 'user1',
    ownerName: 'GreenCare Store',
  },
  {
    id: '3',
    name: 'Plant Disease Medicine',
    description: 'Effective treatment for common plant diseases',
    price: 14.99,
    category: 'medicines',
    image: '/placeholder.svg',
    ownerId: 'user2',
    ownerName: 'Farm Supplies Co',
  },
  {
    id: '4',
    name: 'Premium Garden Tools Set',
    description: 'Complete set of essential gardening tools',
    price: 49.99,
    category: 'tools',
    image: '/placeholder.svg',
    ownerId: 'user2',
    ownerName: 'Farm Supplies Co',
  },
];

const CATEGORIES = ['all', 'plants', 'medicines', 'tools', 'fertilizers'];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call
    const storedProducts = localStorage.getItem('greencare_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem('greencare_products', JSON.stringify(MOCK_PRODUCTS));
      setProducts(MOCK_PRODUCTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;

    const updatedProducts = products.filter((p) => p.id !== deletingProduct.id);
    setProducts(updatedProducts);
    localStorage.setItem('greencare_products', JSON.stringify(updatedProducts));

    toast({
      title: 'Product deleted',
      description: 'The product has been removed successfully.',
    });

    setIsDeleteOpen(false);
    setDeletingProduct(undefined);
  };

  const handleFormSubmit = (product: Product) => {
    if (editingProduct) {
      const updatedProducts = products.map((p) => (p.id === product.id ? product : p));
      setProducts(updatedProducts);
      localStorage.setItem('greencare_products', JSON.stringify(updatedProducts));
      toast({
        title: 'Product updated',
        description: 'The product has been updated successfully.',
      });
    } else {
      const newProduct = { 
        ...product, 
        id: Date.now().toString(),
        ownerId: user?.email || 'unknown',
        ownerName: user?.name || 'Unknown Seller',
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('greencare_products', JSON.stringify(updatedProducts));
      toast({
        title: 'Product added',
        description: 'The product has been added successfully.',
      });
    }
    setIsFormOpen(false);
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
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Browse our collection of gardening products
            </p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card"
              >
                <div
                  className="relative h-48 bg-muted overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <span className="text-lg font-bold text-primary whitespace-nowrap">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {product.category}
                      </span>
                      {product.ownerId === user?.email && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">by {product.ownerName}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
        productName={deletingProduct?.name || ''}
      />
    </AppLayout>
  );
};

export default Products;
