#!/usr/bin/env node

/**
 * Fix Database Tables Script
 * Creates missing tables that are causing errors
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabaseTables() {
  console.log('🔧 Fixing missing database tables...');
  
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Default XAMPP password is empty
      port: 3306,
      database: 'drisya'
    });

    console.log('✅ Connected to MySQL database');

    // Create ai_usage_ledger table
    const createAIUsageLedger = `
      CREATE TABLE IF NOT EXISTS \`ai_usage_ledger\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`month\` varchar(7) NOT NULL COMMENT 'YYYY-MM format',
        \`free_requests\` int NOT NULL DEFAULT 0,
        \`paid_requests\` int NOT NULL DEFAULT 0,
        \`total_cost\` decimal(10,4) NOT NULL DEFAULT 0.0000,
        \`last_reset\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`user_month_unique\` (\`user_id\`, \`month\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createAIUsageLedger);
    console.log('✅ Created ai_usage_ledger table');

    // Create ai_edits table
    const createAIEdits = `
      CREATE TABLE IF NOT EXISTS \`ai_edits\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`job_id\` varchar(36) DEFAULT NULL,
        \`image_id\` varchar(36) DEFAULT NULL,
        \`template_id\` varchar(36) DEFAULT NULL,
        \`ai_model\` varchar(50) NOT NULL DEFAULT 'openai',
        \`prompt\` text NOT NULL,
        \`input_image_url\` varchar(500) NOT NULL,
        \`output_image_url\` varchar(500) DEFAULT NULL,
        \`status\` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
        \`processing_time\` int DEFAULT NULL COMMENT 'Processing time in milliseconds',
        \`cost\` decimal(8,4) NOT NULL DEFAULT 0.0000,
        \`error_message\` text DEFAULT NULL,
        \`metadata\` json DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createAIEdits);
    console.log('✅ Created ai_edits table');

    // Create processing_jobs table if it doesn't exist
    const createProcessingJobs = `
      CREATE TABLE IF NOT EXISTS \`processing_jobs\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`template_id\` varchar(36) NOT NULL,
        \`status\` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
        \`total_images\` int NOT NULL DEFAULT 0,
        \`processed_images\` int NOT NULL DEFAULT 0,
        \`coins_used\` int NOT NULL DEFAULT 0,
        \`batch_settings\` json DEFAULT NULL,
        \`zip_url\` varchar(500) DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`completed_at\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createProcessingJobs);
    console.log('✅ Created processing_jobs table');

    // Create media_library table if it doesn't exist
    const createMediaLibrary = `
      CREATE TABLE IF NOT EXISTS \`media_library\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`file_name\` varchar(255) NOT NULL,
        \`original_name\` varchar(255) NOT NULL,
        \`file_path\` varchar(500) NOT NULL,
        \`file_size\` bigint NOT NULL,
        \`mime_type\` varchar(100) NOT NULL,
        \`template_used\` varchar(100) DEFAULT NULL,
        \`is_favorite\` boolean NOT NULL DEFAULT FALSE,
        \`metadata\` json DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createMediaLibrary);
    console.log('✅ Created media_library table');

    // Create templates table if it doesn't exist
    const createTemplates = `
      CREATE TABLE IF NOT EXISTS \`templates\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`category\` varchar(50) NOT NULL,
        \`background_style\` varchar(50) NOT NULL,
        \`lighting_preset\` varchar(50) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`thumbnail_url\` varchar(500) DEFAULT NULL,
        \`settings\` json DEFAULT NULL,
        \`is_premium\` boolean NOT NULL DEFAULT FALSE,
        \`is_active\` boolean NOT NULL DEFAULT TRUE,
        \`coin_cost\` int NOT NULL DEFAULT 1,
        \`price_per_image\` int NOT NULL DEFAULT 1,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_category\` (\`category\`),
        KEY \`idx_is_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTemplates);
    console.log('✅ Created templates table');

    // Insert default template if none exist
    const checkTemplates = await connection.execute('SELECT COUNT(*) as count FROM templates');
    const templateCount = checkTemplates[0][0].count;

    if (templateCount === 0) {
      const insertDefaultTemplate = `
        INSERT INTO \`templates\` (
          \`id\`, \`name\`, \`category\`, \`background_style\`, \`lighting_preset\`,
          \`description\`, \`is_premium\`, \`is_active\`, \`coin_cost\`, \`price_per_image\`
        ) VALUES (
          '04eb164d-bf68-42c8-af9d-c5b8e8f12345',
          'Dark Blue Velvet Luxury',
          'jewelry',
          'velvet',
          'moody',
          'Elegant matte blue velvet background with cinematic lighting',
          FALSE,
          TRUE,
          2,
          2
        );
      `;

      await connection.execute(insertDefaultTemplate);
      console.log('✅ Inserted default Dark Blue Velvet Luxury template');
    }

    // Create users table if it doesn't exist (basic structure)
    const createUsers = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
        \`coin_balance\` int NOT NULL DEFAULT 0,
        \`is_trial_used\` boolean NOT NULL DEFAULT FALSE,
        \`avatar_url\` varchar(500) DEFAULT NULL,
        \`email_notifications\` boolean NOT NULL DEFAULT TRUE,
        \`notify_job_completion\` boolean NOT NULL DEFAULT TRUE,
        \`notify_payment_confirmed\` boolean NOT NULL DEFAULT TRUE,
        \`notify_coins_added\` boolean NOT NULL DEFAULT TRUE,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`email_unique\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createUsers);
    console.log('✅ Created/verified users table');

    // Create manual_transactions table
    const createManualTransactions = `
      CREATE TABLE IF NOT EXISTS \`manual_transactions\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`package_id\` varchar(36) DEFAULT NULL,
        \`coin_amount\` int NOT NULL,
        \`price_in_inr\` decimal(10,2) NOT NULL,
        \`payment_method\` varchar(50) NOT NULL,
        \`transaction_id\` varchar(100) DEFAULT NULL,
        \`payment_screenshot\` varchar(500) DEFAULT NULL,
        \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`admin_notes\` text DEFAULT NULL,
        \`approved_by\` varchar(36) DEFAULT NULL,
        \`approved_at\` datetime DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createManualTransactions);
    console.log('✅ Created manual_transactions table');

    // Create coin_packages table
    const createCoinPackages = `
      CREATE TABLE IF NOT EXISTS \`coin_packages\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`coin_amount\` int NOT NULL,
        \`price_in_inr\` decimal(10,2) NOT NULL,
        \`discount_percentage\` decimal(5,2) DEFAULT 0.00,
        \`is_popular\` boolean NOT NULL DEFAULT FALSE,
        \`is_active\` boolean NOT NULL DEFAULT TRUE,
        \`description\` text DEFAULT NULL,
        \`features\` json DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_is_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createCoinPackages);
    console.log('✅ Created coin_packages table');

    // Insert default coin packages if none exist
    const checkPackages = await connection.execute('SELECT COUNT(*) as count FROM coin_packages');
    const packageCount = checkPackages[0][0].count;

    if (packageCount === 0) {
      try {
        const insertDefaultPackages = `
          INSERT INTO \`coin_packages\` (
            \`id\`, \`name\`, \`coin_amount\`, \`price_in_inr\`, \`discount_percentage\`, \`is_popular\`, \`is_active\`, \`description\`
          ) VALUES 
          ('pkg-starter-001', 'Starter Pack', 100, 99.00, 0.00, FALSE, TRUE, 'Perfect for trying out our AI enhancement features'),
          ('pkg-popular-002', 'Popular Pack', 500, 399.00, 20.00, TRUE, TRUE, 'Most popular choice for regular users'),
          ('pkg-premium-003', 'Premium Pack', 1000, 699.00, 30.00, FALSE, TRUE, 'Best value for power users and businesses');
        `;

        await connection.execute(insertDefaultPackages);
        console.log('✅ Inserted default coin packages');
      } catch (insertError) {
        console.log('⚠️ Could not insert default coin packages (table structure may be different)');
        console.log(`   Error: ${insertError.message}`);
        
        // Try a simpler insert without discount_percentage
        try {
          const simpleInsert = `
            INSERT INTO \`coin_packages\` (
              \`id\`, \`name\`, \`coin_amount\`, \`price_in_inr\`, \`is_popular\`, \`is_active\`, \`description\`
            ) VALUES 
            ('pkg-starter-001', 'Starter Pack', 100, 99.00, FALSE, TRUE, 'Perfect for trying out our AI enhancement features'),
            ('pkg-popular-002', 'Popular Pack', 500, 399.00, TRUE, TRUE, 'Most popular choice for regular users'),
            ('pkg-premium-003', 'Premium Pack', 1000, 699.00, FALSE, TRUE, 'Best value for power users and businesses');
          `;
          
          await connection.execute(simpleInsert);
          console.log('✅ Inserted default coin packages (simplified)');
        } catch (simpleError) {
          console.log('⚠️ Skipping coin package insertion - table may have different structure');
        }
      }
    }

    await connection.end();
    console.log('✅ Database tables fixed successfully!');
    console.log('');
    console.log('🎉 Your database is now ready for testing!');
    console.log('');

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure XAMPP is running');
    console.log('2. Start Apache and MySQL in XAMPP Control Panel');
    console.log('3. Check if MySQL is running on port 3306');
    console.log('4. Try accessing http://localhost/phpmyadmin');
    console.log('');
    process.exit(1);
  }
}

fixDatabaseTables();
