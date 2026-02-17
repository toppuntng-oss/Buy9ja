/**
 * Mock data for local development
 * Remove this file when you connect to your MariaDB backend
 */

export const mockRestaurants = [
  {
    id: "1",
    name: "Pizza Palace",
    cuisine: "Italian, Pizza",
    rating: 4.5,
    deliveryTime: "25-35 min",
    image: "https://images.unsplash.com/photo-1560750133-aafd1707f646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRpc2h8ZW58MXx8fHwxNzY3NjkwNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    name: "Burger Hut",
    cuisine: "Mixed Burger, Salads",
    rating: 4.7,
    deliveryTime: "20-30 min",
    image: "https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBtZWFsfGVufDF8fHx8MTc2NzcxODc3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    name: "Chinese Food",
    cuisine: "China",
    rating: 4.8,
    deliveryTime: "30-40 min",
    image: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzY3NjQyMzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    name: "Abacha Joint",
    cuisine: "Local Igbo Food",
    rating: 4.6,
    deliveryTime: "25-35 min",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzY3Njc3NjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "5",
    name: "Open sharaton",
    cuisine: "Local Nigerian Food",
    rating: 4.4,
    deliveryTime: "15-25 min",
    image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzY3NzM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "6",
    name: "Suya World",
    cuisine: "International, Mixed",
    rating: 4.3,
    deliveryTime: "30-45 min",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3Njc3NTg4MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export const mockMenuItems: Record<string, any[]> = {
  "1": [
    {
      id: "m1",
      name: "Margherita Pizza",
      description: "Classic tomato sauce, mozzarella, and basil",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1560750133-aafd1707f646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRpc2h8ZW58MXx8fHwxNzY3NjkwNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "1",
    },
    {
      id: "m2",
      name: "Pepperoni Deluxe",
      description: "Double pepperoni, extra cheese, and oregano",
      price: 15.99,
      image: "https://images.unsplash.com/photo-1560750133-aafd1707f646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRpc2h8ZW58MXx8fHwxNzY3NjkwNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "1",
    },
    {
      id: "m3",
      name: "Veggie Supreme",
      description: "Bell peppers, mushrooms, olives, and onions",
      price: 13.99,
      image: "https://images.unsplash.com/photo-1560750133-aafd1707f646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRpc2h8ZW58MXx8fHwxNzY3NjkwNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "1",
    },
  ],
  "2": [
    {
      id: "m4",
      name: "Classic Burger",
      description: "Beef patty, lettuce, tomato, onion, and special sauce",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBtZWFsfGVufDF8fHx8MTc2NzcxODc3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "2",
    },
    {
      id: "m5",
      name: "Bacon Cheeseburger",
      description: "Double beef, crispy bacon, and cheddar cheese",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBtZWFsfGVufDF8fHx8MTc2NzcxODc3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "2",
    },
  ],
  "3": [
    {
      id: "m6",
      name: "California Roll",
      description: "Crab, avocado, and cucumber",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzY3NjQyMzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "3",
    },
    {
      id: "m7",
      name: "Salmon Nigiri Set",
      description: "8 pieces of fresh salmon nigiri",
      price: 16.99,
      image: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzY3NjQyMzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "3",
    },
  ],
  "4": [
    {
      id: "m8",
      name: "Carbonara",
      description: "Creamy sauce with pancetta and parmesan",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzY3Njc3NjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "4",
    },
    {
      id: "m9",
      name: "Spaghetti Bolognese",
      description: "Rich meat sauce with Italian herbs",
      price: 13.99,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzY3Njc3NjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "4",
    },
  ],
  "5": [
    {
      id: "m10",
      name: "Caesar Salad",
      description: "Romaine lettuce, croutons, and parmesan",
      price: 10.99,
      image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzY3NzM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "5",
    },
    {
      id: "m11",
      name: "Greek Salad",
      description: "Tomatoes, cucumbers, feta, and olives",
      price: 11.99,
      image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzY3NzM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "5",
    },
  ],
  "6": [
    {
      id: "m12",
      name: "Mixed Grill Platter",
      description: "Chicken, beef, and lamb with sides",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3Njc3NTg4MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      restaurantId: "6",
    },
  ],
};
