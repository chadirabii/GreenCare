import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Lock,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { createOrder } from "@/services/orderService";
import { getProduct, type Product } from "@/services/productService";

interface CheckoutState {
  productId: string;
  quantity: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const state = location.state as CheckoutState | null;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Billing Information
  const [fullName, setFullName] = useState(
    user?.first_name + " " + user?.last_name || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");

  // Shipping Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state_, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  // Payment Information (fake for now)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Order Notes
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!state?.productId || !state?.quantity) {
      toast({
        title: "Invalid checkout",
        description: "Please select a product and quantity first.",
        variant: "destructive",
      });
      navigate("/products");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(state.productId);
        setProduct(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [state, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !state) return;

    // Validate form
    if (
      !fullName ||
      !email ||
      !address ||
      !city ||
      !state_ ||
      !zipCode ||
      !country
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast({
        title: "Payment information required",
        description: "Please enter your payment details.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const shippingAddress = `${address}, ${city}, ${state_} ${zipCode}, ${country}`;

      await createOrder({
        product: state.productId,
        quantity: state.quantity,
        shipping_address: shippingAddress,
        notes: notes || undefined,
      });

      toast({
        title: "Order placed successfully!",
        description: "You can view your order in the My Orders page.",
      });

      navigate("/my-orders");
    } catch (error: any) {
      toast({
        title: "Order failed",
        description:
          error.response?.data?.quantity?.[0] ||
          "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading checkout...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const subtotal = Number(product.price) * (state?.quantity || 1);
  const shipping = 10.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground">
                  Complete your purchase securely
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        Street Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">
                          State/Province <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="state"
                          value={state_}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">
                          ZIP/Postal Code{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="10001"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="United States"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Lock className="inline h-3 w-3 mr-1" />
                      Your payment information is secure (Demo mode - no real
                      charges)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">
                        Card Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          const formatted =
                            value.match(/.{1,4}/g)?.join(" ") || value;
                          setCardNumber(formatted);
                        }}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">
                        Cardholder Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">
                          Expiry Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="expiryDate"
                          value={expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value =
                                value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            setExpiryDate(value);
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">
                          CVV <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cvv"
                          type="password"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 4)
                            )
                          }
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Notes (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Place Order - ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {state?.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        ${Number(product.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      <Lock className="inline h-3 w-3 mr-1" />
                      Demo checkout - No real payment will be processed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Checkout;
