#!/usr/bin/env node

/**
 * Quick Database Setup Script for DrisyaEnhance
 * Creates the database if it doesn't exist
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  console.log('🚀 Setting up DrisyaEnhance database...');
  
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Default XAMPP password is empty
      port: 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS `drisya`');
    console.log('✅ Database "drisya" created or already exists');

    // Switch to the database
    await connection.execute('USE `drisya`');
    console.log('✅ Using database "drisya"');

    // Create sessions table for express-mysql-session
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS \`sessions\` (
        \`session_id\` varchar(128) COLLATE utf8mb4_bin NOT NULL,
        \`expires\` int unsigned NOT NULL,
        \`data\` mediumtext COLLATE utf8mb4_bin,
        PRIMARY KEY (\`session_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
    `;

    await connection.execute(createSessionsTable);
    console.log('✅ Sessions table created or already exists');

    await connection.end();
    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('🎉 You can now run: npm run dev');
    console.log('');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
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

setupDatabase();
