/**
 * API Service for MariaDB Backend
 * 
 * Configure your API endpoint URL below
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: "preparing" | "on-the-way" | "delivered";
  estimatedTime: string;
  items: CartItem[];
  total: number;
  userId?: string;
  createdAt?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Generic fetch wrapper with error handling
  private async fetchWithError<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Restaurant endpoints
  async getRestaurants(): Promise<Restaurant[]> {
    return this.fetchWithError<Restaurant[]>('/restaurants');
  }

  async getRestaurantById(id: string): Promise<Restaurant> {
    return this.fetchWithError<Restaurant>(`/restaurants/${id}`);
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    return this.fetchWithError<Restaurant[]>(`/restaurants/search?q=${encodeURIComponent(query)}`);
  }

  // Menu endpoints
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return this.fetchWithError<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
  }

  async getMenuItem(restaurantId: string, itemId: string): Promise<MenuItem> {
    return this.fetchWithError<MenuItem>(`/restaurants/${restaurantId}/menu/${itemId}`);
  }

  // Order endpoints
  async createOrder(orderData: {
    items: CartItem[];
    total: number;
    userId?: string;
  }): Promise<Order> {
    return this.fetchWithError<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const endpoint = userId ? `/orders?userId=${userId}` : '/orders';
    return this.fetchWithError<Order[]>(endpoint);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return this.fetchWithError<Order>(`/orders/${orderId}`);
  }

  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<Order> {
    return this.fetchWithError<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // User endpoints (if needed)
  async getUser(userId: string): Promise<any> {
    return this.fetchWithError<any>(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return this.fetchWithError<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { Restaurant, MenuItem, CartItem, Order };
