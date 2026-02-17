import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  MapPin,
  ArrowLeft,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { RestaurantCard } from "./components/RestaurantCard";
import { MenuItem } from "./components/MenuItem";
import { CartItem } from "./components/CartItem";
import { OrderTracking } from "./components/OrderTracking";
import { mockRestaurants, mockMenuItems } from "@/services/mockData";

// PaystackButton Component (inline)
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackButtonProps {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
  metadata?: any;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function PaystackButton({
  email,
  amount,
  reference,
  onSuccess,
  onClose,
  metadata = {},
  disabled = false,
  className = "",
  children = "Pay Now",
}: PaystackButtonProps) {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!window.PaystackPop) {
      alert("Paystack is still loading. Please try again in a moment.");
      return;
    }

    if (!publicKey || publicKey === "pk_test_YOUR_PUBLIC_KEY_HERE") {
      alert("Please configure your Paystack public key in .env file");
      console.error("VITE_PAYSTACK_PUBLIC_KEY not configured");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: Math.round(amount),
      currency: "NGN",
      ref: reference,
      metadata: metadata,
      callback: function (response: any) {
        onSuccess(response);
      },
      onClose: function () {
        onClose();
      },
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className={`
        w-full bg-orange-500 text-white py-3 rounded-lg 
        hover:bg-orange-600 transition-colors
        disabled:bg-gray-300 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {disabled ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
// End PaystackButton Component

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
}

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: "preparing" | "on-the-way" | "delivered";
  estimatedTime: string;
  items: CartItemType[];
  total: number;
}

// Use mock data or configure to fetch from your MariaDB API
// Set VITE_USE_MOCK_DATA=false in .env to use real API

const restaurants: Restaurant[] = mockRestaurants;

const menuItemsByRestaurant: Record<string, MenuItemType[]> = mockMenuItems;

type View = "home" | "restaurant" | "checkout" | "orders";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentView("restaurant");
  };

  const handleAddToCart = (item: MenuItemType) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prevCart,
        { id: item.id, name: item.name, price: item.price, quantity: 1 },
      ];
    });
  };

  const handleIncrementCart = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrementCart = (id: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD${Date.now().toString().slice(-6)}`,
      status: "preparing",
      estimatedTime: "25-35 min",
      items: [...cart],
      total: calculateTotal(),
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setCart([]);
    setShowCart(false);
    setCurrentView("orders");

    // Simulate order status updates
    setTimeout(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === newOrder.id ? { ...order, status: "on-the-way" } : order
        )
      );
    }, 5000);
  };

  const handlePaymentSuccess = async (response: any) => {
    console.log('Payment successful!', response);
    
    // You can verify the payment with your backend here
    // const verification = await fetch(`${import.meta.env.VITE_API_URL}/verify-payment/${response.reference}`);
    
    // Create the order after successful payment
    handleCheckout();
  };

  const handlePaymentClose = () => {
    console.log('Payment popup closed');
  };

  // Generate a unique payment reference whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      setPaymentReference(`PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [cart.length]);

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentView !== "home" && (
                <button
                  onClick={() => {
                    if (currentView === "restaurant") {
                      setCurrentView("home");
                      setSelectedRestaurant(null);
                    } else {
                      setCurrentView("home");
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-orange-500">NajiaGoChop</h1>
                {currentView === "home" && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>3 Osefoh Crescent New GRA Transekulu Enugu</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("orders")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === "orders"
                    ? "bg-orange-100 text-orange-600"
                    : "hover:bg-gray-100"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === "home" && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Restaurants Grid */}
            <div>
              <h2 className="mb-4">Restaurants We serve</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    {...restaurant}
                    onClick={() => handleRestaurantClick(restaurant)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === "restaurant" && selectedRestaurant && (
          <div>
            {/* Restaurant Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="mb-1">{selectedRestaurant.name}</h2>
              <p className="text-gray-600 mb-2">{selectedRestaurant.cuisine}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{selectedRestaurant.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🕐</span>
                  <span>{selectedRestaurant.deliveryTime}</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div>
              <h3 className="mb-4">Menu</h3>
              <div className="space-y-4">
                {menuItemsByRestaurant[selectedRestaurant.id]?.map((item) => (
                  <MenuItem
                    key={item.id}
                    {...item}
                    onAddToCart={() => handleAddToCart(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === "orders" && (
          <div>
            <h2 className="mb-6">Your Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <OrderTracking
                    key={order.id}
                    status={order.status}
                    orderId={order.id}
                    estimatedTime={order.status !== "delivered" ? order.estimatedTime : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3>Your Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Your cart is empty
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <CartItem
                        key={item.id}
                        {...item}
                        onIncrement={() => handleIncrementCart(item.id)}
                        onDecrement={() => handleDecrementCart(item.id)}
                        onRemove={() => handleRemoveFromCart(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">$2.99</span>
                  </div>
                  <div className="border-t pt-4 flex items-center justify-between">
                    <span>Total</span>
                    <span className="text-xl">${(calculateTotal() + 2.99).toFixed(2)}</span>
                  </div>
                  <PaystackButton
                    amount={(calculateTotal() + 2.99) * 100}
                    email="customer@example.com"
                    onSuccess={handlePaymentSuccess}
                    onClose={handlePaymentClose}
                    reference={paymentReference}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Checkout
                  </PaystackButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}