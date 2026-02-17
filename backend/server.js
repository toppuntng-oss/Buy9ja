import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { pool, testConnection, initializeDatabase, seedSampleData } from './database.js';
import { initializeTransaction, verifyTransaction, listTransactions, processRefund, verifyWebhookSignatureRaw, getBanks } from './payment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Food Delivery API is running' });
});

// ==================== RESTAURANT ENDPOINTS ====================

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM restaurants ORDER BY rating DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get single restaurant
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Search restaurants
app.get('/api/restaurants/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const [rows] = await pool.query(
      'SELECT * FROM restaurants WHERE name LIKE ? OR cuisine LIKE ? ORDER BY rating DESC',
      [`%${query}%`, `%${query}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
});

// ==================== MENU ENDPOINTS ====================

// Get menu items for a restaurant
app.get('/api/restaurants/:restaurantId/menu', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ?',
      [req.params.restaurantId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get specific menu item
app.get('/api/restaurants/:restaurantId/menu/:itemId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? AND id = ?',
      [req.params.restaurantId, req.params.itemId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// ==================== ORDER ENDPOINTS ====================

// Create new order
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { items, total, userId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }
    
    // Generate order ID
    const orderId = `ORD${Date.now().toString().slice(-6)}`;
    
    // Insert order
    await connection.query(
      'INSERT INTO orders (id, user_id, status, total, estimated_time) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId || null, 'preparing', total, '25-35 min']
    );
    
    // Insert order items
    const orderItemsData = items.map(item => [
      orderId,
      item.id,
      item.name,
      item.price,
      item.quantity
    ]);
    
    await connection.query(
      'INSERT INTO order_items (order_id, item_id, name, price, quantity) VALUES ?',
      [orderItemsData]
    );
    
    await connection.commit();
    
    // Fetch the created order with items
    const [orderRows] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    const [itemRows] = await connection.query(
      'SELECT item_id as id, name, price, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    const order = {
      ...orderRows[0],
      items: itemRows,
      estimatedTime: orderRows[0].estimated_time
    };
    
    res.status(201).json(order);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// Get all orders (optionally filtered by userId)
app.get('/api/orders', async (req, res) => {
  try {
    const userId = req.query.userId;
    let query = 'SELECT * FROM orders';
    let params = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [orderRows] = await pool.query(query, params);
    
    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orderRows.map(async (order) => {
        const [itemRows] = await pool.query(
          'SELECT item_id as id, name, price, quantity FROM order_items WHERE order_id = ?',
          [order.id]
        );
        
        return {
          ...order,
          items: itemRows,
          estimatedTime: order.estimated_time
        };
      })
    );
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const [orderRows] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.orderId]
    );
    
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [itemRows] = await pool.query(
      'SELECT item_id as id, name, price, quantity FROM order_items WHERE order_id = ?',
      [req.params.orderId]
    );
    
    const order = {
      ...orderRows[0],
      items: itemRows,
      estimatedTime: orderRows[0].estimated_time
    };
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['preparing', 'on-the-way', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.orderId]
    );
    
    const [orderRows] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.orderId]
    );
    
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [itemRows] = await pool.query(
      'SELECT item_id as id, name, price, quantity FROM order_items WHERE order_id = ?',
      [req.params.orderId]
    );
    
    const order = {
      ...orderRows[0],
      items: itemRows,
      estimatedTime: orderRows[0].estimated_time
    };
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ==================== PAYMENT ENDPOINTS ====================

// Initialize Paystack transaction
app.post('/api/initialize-payment', async (req, res) => {
  try {
    const { email, amount, orderId, items } = req.body;
    
    if (!email || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Email and valid amount required' });
    }
    
    const result = await initializeTransaction(email, amount, {
      orderId: orderId || '',
      itemCount: items?.length || 0,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    });
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
      reference: result.reference
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify Paystack transaction
app.get('/api/verify-payment/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference required' });
    }
    
    const result = await verifyTransaction(reference);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// List all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 50;
    const page = parseInt(req.query.page) || 1;
    
    const result = await listTransactions(perPage, page);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

// Process refund
app.post('/api/refund', async (req, res) => {
  try {
    const { reference, amount } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference required' });
    }
    
    const result = await processRefund(reference, amount);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get supported banks
app.get('/api/banks', async (req, res) => {
  try {
    const result = await getBanks();
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

// Paystack webhook endpoint
app.post('/api/webhook', express.json(), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (hash !== signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Handle the event
  const event = req.body;
  
  switch (event.event) {
    case 'charge.success':
      const transaction = event.data;
      console.log('✅ Payment succeeded:', transaction.reference);
      // Update order status in database if needed
      // You can get the order ID from transaction.metadata
      break;
    
    case 'charge.failed':
      console.log('❌ Payment failed:', event.data.reference);
      // Handle failed payment
      break;
    
    default:
      console.log(`Unhandled event type: ${event.event}`);
  }
  
  res.sendStatus(200);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  // Test database connection
  const connected = await testConnection();
  
  if (!connected) {
    console.error('Failed to connect to database. Please check your credentials.');
    process.exit(1);
  }
  
  // Initialize database tables
  await initializeDatabase();
  
  // Seed sample data
  await seedSampleData();
  
  // Start Express server
  app.listen(PORT, () => {
    console.log(`\n🚀 Food Delivery API Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n📚 Available Endpoints:`);
    console.log(`   GET    /api/restaurants`);
    console.log(`   GET    /api/restaurants/:id`);
    console.log(`   GET    /api/restaurants/:id/menu`);
    console.log(`   POST   /api/orders`);
    console.log(`   GET    /api/orders`);
    console.log(`   GET    /api/orders/:id`);
    console.log(`   PATCH  /api/orders/:id/status`);
    console.log(`   POST   /api/initialize-payment`);
    console.log(`   GET    /api/verify-payment/:reference`);
    console.log(`   GET    /api/transactions`);
    console.log(`   POST   /api/refund`);
    console.log(`   GET    /api/banks`);
    console.log(`   POST   /api/webhook`);
    console.log(`\n✨ Ready to accept requests!\n`);
  });
}

startServer();