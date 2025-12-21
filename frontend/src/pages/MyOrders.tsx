import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShoppingBag, Package, Calendar, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyOrders, cancelOrder, type Order } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;

    try {
      await cancelOrder(cancellingOrder);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
      setCancellingOrder(null);
      fetchOrders(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const totalSpent = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, order) => sum + Number(order.total_price), 0);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const canCancelOrder = (status: string) => {
    return status === "pending" || status === "processing";
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
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track your purchases and order history
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
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
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
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Completed Orders
                  </p>
                  <p className="text-2xl font-bold">{completedOrders}</p>
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
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Order History</h2>
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={order.product_image || "/placeholder.svg"}
                          alt={order.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {order.product_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Seller: {order.seller_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Quantity: {order.quantity} × $
                              {Number(order.product_price).toFixed(2)}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            ${Number(order.total_price).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                            {canCancelOrder(order.status) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setCancellingOrder(order.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>

                        {order.shipping_address && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            <span className="font-semibold">Shipping: </span>
                            {order.shipping_address}
                          </div>
                        )}

                        {order.notes && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Notes: </span>
                            {order.notes}
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

      {/* Cancel Order Dialog */}
      <AlertDialog
        open={!!cancellingOrder}
        onOpenChange={() => setCancellingOrder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone. The product stock will be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder}>
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default MyOrders;
