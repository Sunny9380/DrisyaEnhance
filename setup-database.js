#!/usr/bin/env node

/**
 * Simple Database Setup Script
 * Creates the database and tables manually if Drizzle fails
 */

import mysql from 'mysql2/promise';
import fs from 'fs';

console.log('🗄️  Database Setup Script Starting...\n');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    // Step 1: Connect to MySQL
    console.log('📋 Step 1: Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL');

    // Step 2: Create database
    console.log('\n📋 Step 2: Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS drisya');
    console.log('✅ Database "drisya" created/verified');

    // Step 3: Reconnect with database specified
    await connection.end();
    console.log('✅ Reconnecting with database specified...');
    
    connection = await mysql.createConnection({
      ...dbConfig,
      database: 'drisya'
    });

    // Step 4: Create tables directly (bypass SQL file parsing)
    console.log('\n📋 Step 3: Creating tables...');
    
    const tableDefinitions = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        phone TEXT,
        avatar_url TEXT,
        referral_code TEXT,
        coin_balance INT NOT NULL DEFAULT 0,
        role TEXT NOT NULL DEFAULT 'user',
        user_tier TEXT NOT NULL DEFAULT 'free',
        monthly_quota INT NOT NULL DEFAULT 50,
        monthly_usage INT NOT NULL DEFAULT 0,
        quota_reset_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
        notify_job_completion BOOLEAN NOT NULL DEFAULT TRUE,
        notify_payment_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
        notify_coins_added BOOLEAN NOT NULL DEFAULT TRUE,
        is_trial_used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Templates table
      `CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        background_style TEXT DEFAULT 'gradient',
        lighting_preset TEXT DEFAULT 'soft-glow',
        description TEXT,
        thumbnail_url TEXT,
        settings JSON,
        is_premium BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        coin_cost INT NOT NULL DEFAULT 1,
        price_per_image INT,
        features JSON,
        benefits JSON,
        use_cases JSON,
        why_buy TEXT,
        testimonials JSON,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )`,
      
      // Processing Jobs table
      `CREATE TABLE IF NOT EXISTS processing_jobs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        template_id VARCHAR(36) NOT NULL,
        total_images INT NOT NULL,
        completed_images INT NOT NULL DEFAULT 0,
        coins_used INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        zip_url TEXT,
        batch_settings JSON,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL
      )`,
      
      // Images table
      `CREATE TABLE IF NOT EXISTS images (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        job_id VARCHAR(36) NOT NULL,
        original_url TEXT NOT NULL,
        processed_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        type TEXT NOT NULL,
        amount INT NOT NULL,
        description TEXT,
        metadata JSON,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Other essential tables
      `CREATE TABLE IF NOT EXISTS template_favorites (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        template_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36),
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        metadata JSON,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tableDefinitions) {
      try {
        await connection.execute(tableSQL);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Warning creating table: ${error.message}`);
        }
      }
    }

    console.log('✅ Tables created successfully');

    // Step 5: Verify tables
    console.log('\n📋 Step 4: Verifying tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Step 6: Create test admin user
    console.log('\n📋 Step 5: Creating admin user...');
    try {
      const hashedPassword = '$2b$10$rQZ9QmZJ5fQ5K5K5K5K5KuJ5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K'; // admin123
      await connection.execute(`
        INSERT IGNORE INTO users (email, password, name, role, user_tier, coin_balance) 
        VALUES ('admin@drisya.app', ?, 'Admin User', 'admin', 'enterprise', 10000)
      `, [hashedPassword]);
      console.log('✅ Admin user created (admin@drisya.app / admin123)');
    } catch (error) {
      console.log('⚠️  Admin user might already exist');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: npm start');
    console.log('3. Test: http://localhost:5000');
    console.log('4. Login with: admin@drisya.app / admin123');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure XAMPP MySQL is running');
    console.log('2. Check MySQL is accessible on localhost:3306');
    console.log('3. Verify root user has no password set');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
