#!/usr/bin/env node

/**
 * MariaDB SkySQL Connection Checker
 * This script helps diagnose connection issues with your MariaDB database
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

dotenv.config();

console.log('🔍 MariaDB SkySQL Connection Diagnostic Tool\n');
console.log('=' .repeat(60));

// Get current public IP
async function getCurrentIP() {
  try {
    const { stdout } = await execAsync('curl -s ifconfig.me');
    return stdout.trim();
  } catch (error) {
    try {
      const { stdout } = await execAsync('curl -s api.ipify.org');
      return stdout.trim();
    } catch {
      return 'Unable to detect';
    }
  }
}

// Test connection
async function testConnection() {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true
    },
    connectTimeout: 10000
  };

  console.log('\n📋 Configuration Check:');
  console.log('   Host:', config.host || '❌ MISSING');
  console.log('   Port:', config.port || '❌ MISSING');
  console.log('   User:', config.user || '❌ MISSING');
  console.log('   Password:', config.password ? '✓ Set' : '❌ MISSING');
  console.log('   Database:', config.database || '❌ MISSING');

  if (!config.host || !config.user || !config.password || !config.database) {
    console.log('\n❌ Configuration is incomplete!');
    console.log('   Please check your .env file');
    return false;
  }

  console.log('\n🌐 Network Information:');
  const currentIP = await getCurrentIP();
  console.log('   Your Public IP:', currentIP);
  console.log('   Target Server:', config.host);
  console.log('   Target Port:', config.port);

  console.log('\n🔌 Attempting to connect...');
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ SUCCESS! Connected to MariaDB SkySQL!\n');
    
    // Test database operations
    console.log('🧪 Testing database operations...');
    const [rows] = await connection.query('SELECT VERSION() as version, DATABASE() as db');
    console.log('   MySQL Version:', rows[0].version);
    console.log('   Current Database:', rows[0].db || '(none selected)');
    
    // List tables
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length > 0) {
      console.log('   Existing Tables:', tables.length);
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`      ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('   Existing Tables: None (will be created on first run)');
    }
    
    await connection.end();
    
    console.log('\n✅ All checks passed! Your database is ready to use.');
    console.log('\n📌 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Server will start on http://localhost:3000');
    console.log('   3. Tables will be created automatically\n');
    
    return true;
  } catch (error) {
    console.log('❌ FAILED! Cannot connect to database\n');
    console.log('Error Message:', error.message);
    console.log('Error Code:', error.code || 'N/A');
    
    console.log('\n🔍 Diagnosis:');
    
    if (error.message.includes('Access denied')) {
      console.log('   ⚠️  IP ADDRESS NOT WHITELISTED\n');
      console.log('   Your IP address is not allowed to connect to the database.');
      console.log('   This is the most common issue with MariaDB SkySQL.\n');
      console.log('   🛠️  How to fix:');
      console.log('   1. Go to: https://cloud.mariadb.com/');
      console.log('   2. Select your database');
      console.log('   3. Go to Security → Allowlist');
      console.log('   4. Add IP address:', currentIP);
      console.log('      OR add 0.0.0.0/0 (allows all - dev only!)');
      console.log('   5. Wait 1-2 minutes');
      console.log('   6. Run this script again\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   ⚠️  CANNOT RESOLVE HOSTNAME\n');
      console.log('   The database server hostname cannot be found.');
      console.log('   - Check your internet connection');
      console.log('   - Verify DB_HOST in .env file');
      console.log('   - Make sure the hostname is correct\n');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.log('   ⚠️  CONNECTION TIMEOUT\n');
      console.log('   Cannot reach the database server.');
      console.log('   - Check your firewall settings');
      console.log('   - Verify port 4099 is not blocked');
      console.log('   - Check if the database service is running\n');
    } else if (error.message.includes('Unknown database')) {
      console.log('   ⚠️  DATABASE DOES NOT EXIST\n');
      console.log('   The database "' + config.database + '" has not been created.');
      console.log('   - Create it in MariaDB SkySQL portal');
      console.log('   - Or create it via SQL: CREATE DATABASE ' + config.database + ';\n');
    } else if (error.message.includes('SSL')) {
      console.log('   ⚠️  SSL/TLS ERROR\n');
      console.log('   There is an issue with the SSL connection.');
      console.log('   - This is usually a certificate validation issue');
      console.log('   - For development, you can disable SSL verification');
      console.log('   - See TROUBLESHOOTING.md for details\n');
    } else {
      console.log('   ⚠️  UNKNOWN ERROR\n');
      console.log('   Please check:');
      console.log('   - Database credentials are correct');
      console.log('   - Database service is running');
      console.log('   - Network connectivity is working\n');
      console.log('   Full error details:');
      console.log('  ', error);
      console.log();
    }
    
    console.log('📚 For more help, see: /backend/TROUBLESHOOTING.md\n');
    
    return false;
  }
}

// Run the diagnostic
console.log('Starting diagnostic...\n');

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
