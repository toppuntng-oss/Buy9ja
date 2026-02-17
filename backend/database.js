import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // SSL configuration for SkySQL
  ssl: {
    rejectUnauthorized: true
  }
});

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MariaDB SkySQL!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n🔍 Troubleshooting Tips:');
    
    if (error.message.includes('Access denied')) {
      console.error('   ⚠️  ACCESS DENIED - Your IP address needs to be whitelisted!');
      console.error('   📌 Your IP appears to be rejected by MariaDB SkySQL');
      console.error('   \n   Steps to fix:');
      console.error('   1. Go to https://mariadb.com/products/skysql/');
      console.error('   2. Navigate to your database dashboard');
      console.error('   3. Go to Security > Allowlist');
      console.error('   4. Add your current IP address');
      console.error('   5. OR add 0.0.0.0/0 to allow all IPs (development only!)');
      console.error('   6. Wait 1-2 minutes for changes to propagate');
      console.error('   7. Restart this server\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('   ⚠️  Cannot reach the database server');
      console.error('   - Check your internet connection');
      console.error('   - Verify the DB_HOST in .env file');
      console.error('   - Check if port 4061 is accessible\n');
    } else if (error.message.includes('Unknown database')) {
      console.error('   ⚠️  Database does not exist');
      console.error('   - Create the database in MariaDB:');
      console.error('   - CREATE DATABASE food_delivery;\n');
    } else {
      console.error('   Full error:', error);
    }
    
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create restaurants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cuisine VARCHAR(255),
        rating DECIMAL(2,1),
        delivery_time VARCHAR(50),
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create menu_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(50) PRIMARY KEY,
        restaurant_id VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      )
    `);

    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        status ENUM('preparing', 'on-the-way', 'delivered') DEFAULT 'preparing',
        total DECIMAL(10,2) NOT NULL,
        estimated_time VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50),
        item_id VARCHAR(50),
        name VARCHAR(255),
        price DECIMAL(10,2),
        quantity INT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

// Seed sample data
async function seedSampleData() {
  try {
    const connection = await pool.getConnection();
    
    // Check if data already exists
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
    if (existing[0].count > 0) {
      console.log('ℹ️  Sample data already exists, skipping seed...');
      connection.release();
      return;
    }

    // Insert sample restaurants
    const restaurants = [
      ['1', 'Pizza Palace', 'Italian, Pizza', 4.5, '25-35 min', 'https://images.unsplash.com/photo-1560750133-aafd1707f646?w=400'],
      ['2', 'Burger Hut', 'Mixed Burger, Salads', 4.7, '20-30 min', 'https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?w=400'],
      ['3', 'Chinese Food', 'China', 4.8, '30-40 min', 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?w=400'],
      ['4', 'Abacha Joint', 'Local Igbo Food', 4.6, '25-35 min', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'],
      ['5', 'Open sharaton', 'Local Nigerian Food', 4.4, '15-25 min', 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400'],
      ['6', 'Suya World', 'International, Mixed', 4.3, '30-45 min', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400']
    ];

    await connection.query(
      'INSERT INTO restaurants (id, name, cuisine, rating, delivery_time, image) VALUES ?',
      [restaurants]
    );

    // Insert sample menu items
    const menuItems = [
      ['m1', '1', 'Margherita Pizza', 'Classic tomato sauce, mozzarella, and basil', 12.99, 'https://images.unsplash.com/photo-1560750133-aafd1707f646?w=400'],
      ['m2', '1', 'Pepperoni Deluxe', 'Double pepperoni, extra cheese, and oregano', 15.99, 'https://images.unsplash.com/photo-1560750133-aafd1707f646?w=400'],
      ['m3', '1', 'Veggie Supreme', 'Bell peppers, mushrooms, olives, and onions', 13.99, 'https://images.unsplash.com/photo-1560750133-aafd1707f646?w=400'],
      ['m4', '2', 'Classic Burger', 'Beef patty, lettuce, tomato, onion, and special sauce', 9.99, 'https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?w=400'],
      ['m5', '2', 'Bacon Cheeseburger', 'Double beef, crispy bacon, and cheddar cheese', 12.99, 'https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?w=400'],
      ['m6', '3', 'California Roll', 'Crab, avocado, and cucumber', 8.99, 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?w=400'],
      ['m7', '3', 'Salmon Nigiri Set', '8 pieces of fresh salmon nigiri', 16.99, 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?w=400'],
      ['m8', '4', 'Carbonara', 'Creamy sauce with pancetta and parmesan', 14.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'],
      ['m9', '4', 'Spaghetti Bolognese', 'Rich meat sauce with Italian herbs', 13.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'],
      ['m10', '5', 'Caesar Salad', 'Romaine lettuce, croutons, and parmesan', 10.99, 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400'],
      ['m11', '5', 'Greek Salad', 'Tomatoes, cucumbers, feta, and olives', 11.99, 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400'],
      ['m12', '6', 'Mixed Grill Platter', 'Chicken, beef, and lamb with sides', 18.99, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400']
    ];

    await connection.query(
      'INSERT INTO menu_items (id, restaurant_id, name, description, price, image) VALUES ?',
      [menuItems]
    );

    console.log('✅ Sample data seeded successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

export { pool, testConnection, initializeDatabase, seedSampleData };