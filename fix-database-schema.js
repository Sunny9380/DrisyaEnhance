#!/usr/bin/env node

/**
 * Fix Database Schema Issues
 * Handles column mismatches and table structure problems
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema issues...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
      database: 'drisya'
    });

    console.log('✅ Connected to MySQL database');

    // Check and fix coin_packages table structure
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'drisya' AND TABLE_NAME = 'coin_packages'
      `);
      
      const columnNames = columns.map(col => col.COLUMN_NAME);
      console.log(`📋 coin_packages columns: ${columnNames.join(', ')}`);
      
      // Add missing columns if they don't exist
      if (!columnNames.includes('discount_percentage')) {
        await connection.execute(`
          ALTER TABLE coin_packages 
          ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0.00
        `);
        console.log('✅ Added discount_percentage column to coin_packages');
      }
      
      if (!columnNames.includes('features')) {
        await connection.execute(`
          ALTER TABLE coin_packages 
          ADD COLUMN features JSON DEFAULT NULL
        `);
        console.log('✅ Added features column to coin_packages');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check coin_packages structure:', error.message);
    }

    // Check and fix manual_transactions table structure
    try {
      const [mtColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'drisya' AND TABLE_NAME = 'manual_transactions'
      `);
      
      const mtColumnNames = mtColumns.map(col => col.COLUMN_NAME);
      console.log(`📋 manual_transactions columns: ${mtColumnNames.join(', ')}`);
      
      // Add missing columns that the schema expects
      if (!mtColumnNames.includes('payment_reference')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN payment_reference TEXT DEFAULT NULL
          `);
          console.log('✅ Added missing payment_reference column');
        } catch (addError) {
          console.log('⚠️ Could not add payment_reference column:', addError.message);
        }
      } else {
        console.log('ℹ️ payment_reference column already exists');
      }

      // Add other missing columns that might be expected
      if (!mtColumnNames.includes('user_phone')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN user_phone TEXT DEFAULT NULL
          `);
          console.log('✅ Added missing user_phone column');
        } catch (addError) {
          console.log('⚠️ Could not add user_phone column:', addError.message);
        }
      }

      if (!mtColumnNames.includes('approved_at')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN approved_at DATETIME DEFAULT NULL
          `);
          console.log('✅ Added missing approved_at column');
        } catch (addError) {
          console.log('⚠️ Could not add approved_at column:', addError.message);
        }
      }

      if (!mtColumnNames.includes('completed_at')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN completed_at DATETIME DEFAULT NULL
          `);
          console.log('✅ Added missing completed_at column');
        } catch (addError) {
          console.log('⚠️ Could not add completed_at column:', addError.message);
        }
      }

      if (!mtColumnNames.includes('admin_id')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN admin_id VARCHAR(36) DEFAULT NULL
          `);
          console.log('✅ Added missing admin_id column');
        } catch (addError) {
          console.log('⚠️ Could not add admin_id column:', addError.message);
        }
      }

      if (!mtColumnNames.includes('admin_notes')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN admin_notes TEXT DEFAULT NULL
          `);
          console.log('✅ Added missing admin_notes column');
        } catch (addError) {
          console.log('⚠️ Could not add admin_notes column:', addError.message);
        }
      }

      if (!mtColumnNames.includes('payment_method')) {
        try {
          await connection.execute(`
            ALTER TABLE manual_transactions 
            ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'whatsapp'
          `);
          console.log('✅ Added missing payment_method column');
        } catch (addError) {
          console.log('⚠️ Could not add payment_method column:', addError.message);
        }
      }
      
    } catch (error) {
      console.log('⚠️ Could not check manual_transactions structure:', error.message);
    }

    // Check and fix ai_edits table structure
    try {
      const [aiColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'drisya' AND TABLE_NAME = 'ai_edits'
      `);
      
      const aiColumnNames = aiColumns.map(col => col.COLUMN_NAME);
      console.log(`📋 ai_edits columns: ${aiColumnNames.join(', ')}`);
      
      // Add missing columns if they don't exist
      if (!aiColumnNames.includes('quality')) {
        await connection.execute(`
          ALTER TABLE ai_edits 
          ADD COLUMN quality VARCHAR(20) DEFAULT 'standard'
        `);
        console.log('✅ Added quality column to ai_edits');
      }
      
      if (!aiColumnNames.includes('size')) {
        await connection.execute(`
          ALTER TABLE ai_edits 
          ADD COLUMN size VARCHAR(20) DEFAULT '1024x1024'
        `);
        console.log('✅ Added size column to ai_edits');
      }
      
      if (!aiColumnNames.includes('background_style')) {
        await connection.execute(`
          ALTER TABLE ai_edits 
          ADD COLUMN background_style VARCHAR(50) DEFAULT NULL
        `);
        console.log('✅ Added background_style column to ai_edits');
      }
      
      if (!aiColumnNames.includes('jewelry_name')) {
        await connection.execute(`
          ALTER TABLE ai_edits 
          ADD COLUMN jewelry_name VARCHAR(255) DEFAULT NULL
        `);
        console.log('✅ Added jewelry_name column to ai_edits');
      }
      
      if (!aiColumnNames.includes('completed_at')) {
        await connection.execute(`
          ALTER TABLE ai_edits 
          ADD COLUMN completed_at DATETIME DEFAULT NULL
        `);
        console.log('✅ Added completed_at column to ai_edits');
      }
      
      if (!aiColumnNames.includes('updated_at')) {
        await connection.execute(`
          ALTER TABLE ai_edits 
          ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
        console.log('✅ Added updated_at column to ai_edits');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check ai_edits structure:', error.message);
    }

    // Insert default coin packages if table is empty
    try {
      const [packageCount] = await connection.execute('SELECT COUNT(*) as count FROM coin_packages');
      
      if (packageCount[0].count === 0) {
        const insertPackages = `
          INSERT INTO coin_packages (
            id, name, coin_amount, price_in_inr, is_popular, is_active, description
          ) VALUES 
          ('pkg-starter-001', 'Starter Pack', 100, 99.00, FALSE, TRUE, 'Perfect for trying out our AI enhancement features'),
          ('pkg-popular-002', 'Popular Pack', 500, 399.00, TRUE, TRUE, 'Most popular choice for regular users'),
          ('pkg-premium-003', 'Premium Pack', 1000, 699.00, FALSE, TRUE, 'Best value for power users and businesses')
        `;
        
        await connection.execute(insertPackages);
        console.log('✅ Inserted default coin packages');
      } else {
        console.log('ℹ️ Coin packages already exist, skipping insertion');
      }
    } catch (insertError) {
      console.log('⚠️ Could not insert coin packages:', insertError.message);
    }

    // Verify all critical tables exist and check their structure
    const criticalTables = [
      'users', 'templates', 'processing_jobs', 'media_library', 
      'ai_usage_ledger', 'ai_edits', 'manual_transactions', 'coin_packages', 'sessions'
    ];

    // Also check for common missing columns that cause API errors
    const columnChecks = [
      { table: 'ai_edits', column: 'quality' },
      { table: 'ai_edits', column: 'size' },
      { table: 'ai_edits', column: 'background_style' },
      { table: 'ai_edits', column: 'jewelry_name' },
      { table: 'ai_edits', column: 'completed_at' },
      { table: 'ai_edits', column: 'updated_at' },
      { table: 'coin_packages', column: 'discount_percentage' },
      { table: 'manual_transactions', column: 'payment_reference' },
      { table: 'manual_transactions', column: 'user_phone' },
      { table: 'manual_transactions', column: 'approved_at' },
      { table: 'manual_transactions', column: 'completed_at' },
      { table: 'manual_transactions', column: 'admin_id' },
      { table: 'manual_transactions', column: 'admin_notes' },
      { table: 'manual_transactions', column: 'payment_method' }
    ];

    console.log('\n📊 Table Status Check:');
    for (const tableName of criticalTables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${result[0].count} records`);
      } catch (error) {
        console.log(`❌ ${tableName}: Missing or error (${error.message})`);
      }
    }

    console.log('\n🔍 Column Verification:');
    for (const check of columnChecks) {
      try {
        const [columns] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'drisya' AND TABLE_NAME = ? AND COLUMN_NAME = ?
        `, [check.table, check.column]);
        
        if (columns.length > 0) {
          console.log(`✅ ${check.table}.${check.column}: EXISTS`);
        } else {
          console.log(`❌ ${check.table}.${check.column}: MISSING`);
        }
      } catch (error) {
        console.log(`⚠️ ${check.table}.${check.column}: Could not verify`);
      }
    }

    await connection.end();
    console.log('\n✅ Database schema fix completed!');
    console.log('🎉 Your database should now work properly with the API tests!');

  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    process.exit(1);
  }
}

fixDatabaseSchema();
