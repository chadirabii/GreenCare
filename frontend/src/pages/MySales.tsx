import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Package, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMySales,
  updateOrderStatus,
  type Order,
} from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

const MySales = () => {
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await getMySales();
      setSales(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully.",
      });
      fetchSales(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = sales
    .filter((s) => s.status === "completed")
    .reduce((sum, sale) => sum + Number(sale.total_price), 0);

  const completedSales = sales.filter((s) => s.status === "completed").length;
  const pendingSales = sales.filter(
    (s) => s.status === "pending" || s.status === "processing"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
          <p className="text-muted-foreground mt-1">
            Track your sales and revenue
          </p>
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
                  <p className="text-2xl font-bold">
                    ${totalRevenue.toFixed(2)}
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Completed Sales
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Pending Orders
                  </p>
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
                          src={sale.product_image || "/placeholder.svg"}
                          alt={sale.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {sale.product_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Buyer: {sale.buyer_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Quantity: {sale.quantity}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            {Number(sale.total_price).toFixed(2)} TND
                          </span>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(sale.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={sale.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(sale.id, value)
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">
                                  Processing
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Badge className={getStatusColor(sale.status)}>
                              {sale.status.charAt(0).toUpperCase() +
                                sale.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {sale.shipping_address && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            <span className="font-semibold">Shipping: </span>
                            {sale.shipping_address}
                          </div>
                        )}

                        {sale.notes && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Notes: </span>
                            {sale.notes}
                          </div>
                        )}
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
