import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from './Products';

interface Sale {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const MOCK_SALES: Sale[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Organic Tomato Seeds',
    productImage: '/placeholder.svg',
    buyerName: 'John Doe',
    amount: 4.99,
    date: '2025-01-15',
    status: 'completed',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Garden Fertilizer Pro',
    productImage: '/placeholder.svg',
    buyerName: 'Jane Smith',
    amount: 19.99,
    date: '2025-01-14',
    status: 'completed',
  },
  {
    id: '3',
    productId: '1',
    productName: 'Organic Tomato Seeds',
    productImage: '/placeholder.svg',
    buyerName: 'Bob Wilson',
    amount: 4.99,
    date: '2025-01-13',
    status: 'pending',
  },
];

const MySales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const storedProducts = localStorage.getItem('greencare_products');
    const storedSales = localStorage.getItem('greencare_sales');

    if (storedProducts) {
      const allProducts: Product[] = JSON.parse(storedProducts);
      const userProducts = allProducts.filter((p) => p.ownerId === user?.email);
      setMyProducts(userProducts);

      if (storedSales) {
        const allSales: Sale[] = JSON.parse(storedSales);
        const userProductIds = userProducts.map((p) => p.id);
        const userSales = allSales.filter((s) => userProductIds.includes(s.productId));
        setSales(userSales);
      } else {
        // Initialize with mock sales for demo
        const userProductIds = userProducts.map((p) => p.id);
        const mockUserSales = MOCK_SALES.filter((s) => userProductIds.includes(s.productId));
        setSales(mockUserSales);
        localStorage.setItem('greencare_sales', JSON.stringify(MOCK_SALES));
      }
    }

    setLoading(false);
  }, [user?.email]);

  const totalRevenue = sales
    .filter((s) => s.status === 'completed')
    .reduce((sum, sale) => sum + sale.amount, 0);

  const completedSales = sales.filter((s) => s.status === 'completed').length;
  const pendingSales = sales.filter((s) => s.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Sales</h1>
          <p className="text-muted-foreground mt-1">Track your sales and revenue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Sales</p>
                  <p className="text-2xl font-bold">{completedSales}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{pendingSales}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your sales...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No sales yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Sales will appear here once customers purchase your products
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Sales</h2>
            <div className="grid grid-cols-1 gap-4">
              {sales.map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={sale.productImage}
                          alt={sale.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{sale.productName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Buyer: {sale.buyerName}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            ${sale.amount.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(sale.date).toLocaleDateString()}
                          </div>
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default MySales;
