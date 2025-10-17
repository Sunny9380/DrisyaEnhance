#!/usr/bin/env node

/**
 * Database Fix Test Script
 * Systematically tests and fixes Drizzle database issues
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Database Fix Test Script Starting...\n');

// Step 1: Check Environment
console.log('📋 Step 1: Environment Check');
try {
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found, copying from .env.example');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created');
  } else {
    console.log('✅ .env file exists');
  }

  // Check DATABASE_URL in .env
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('DATABASE_URL=mysql://root:@localhost:3306/drisya')) {
    console.log('✅ DATABASE_URL is configured');
  } else {
    console.log('⚠️  DATABASE_URL might not be configured correctly');
  }
} catch (error) {
  console.log('❌ Environment check failed:', error.message);
}

// Step 2: Check MySQL Connection
console.log('\n📋 Step 2: MySQL Connection Test');
try {
  // Test if MySQL is running (Windows XAMPP)
  const mysqlProcess = execSync('tasklist /FI "IMAGENAME eq mysqld.exe"', { encoding: 'utf8' });
  if (mysqlProcess.includes('mysqld.exe')) {
    console.log('✅ MySQL service is running');
  } else {
    console.log('⚠️  MySQL service might not be running. Please start XAMPP MySQL.');
  }
} catch (error) {
  console.log('⚠️  Could not check MySQL service status');
}

// Step 3: Check Drizzle Configuration
console.log('\n📋 Step 3: Drizzle Configuration Test');
try {
  if (fs.existsSync('drizzle.config.ts')) {
    console.log('✅ drizzle.config.ts exists');
    
    const configContent = fs.readFileSync('drizzle.config.ts', 'utf8');
    if (configContent.includes('dialect: "mysql"')) {
      console.log('✅ MySQL dialect configured');
    } else {
      console.log('❌ MySQL dialect not found in config');
    }
  } else {
    console.log('❌ drizzle.config.ts not found');
  }
} catch (error) {
  console.log('❌ Drizzle config check failed:', error.message);
}

// Step 4: Schema Validation
console.log('\n📋 Step 4: Schema Validation');
try {
  if (fs.existsSync('shared/schema.ts')) {
    console.log('✅ Schema file exists');
    
    // Check for common issues
    const schemaContent = fs.readFileSync('shared/schema.ts', 'utf8');
    if (schemaContent.includes('mysqlTable')) {
      console.log('✅ MySQL table definitions found');
    }
    if (schemaContent.includes('sql`(UUID())`')) {
      console.log('✅ UUID() functions found');
    }
  } else {
    console.log('❌ Schema file not found');
  }
} catch (error) {
  console.log('❌ Schema validation failed:', error.message);
}

// Step 5: Attempt Drizzle Push with Better Error Handling
console.log('\n📋 Step 5: Attempting Drizzle Push');
try {
  console.log('🔄 Running drizzle-kit push...');
  const result = execSync('npx drizzle-kit push', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ Drizzle push successful!');
  console.log(result);
} catch (error) {
  console.log('❌ Drizzle push failed:');
  console.log('Error:', error.message);
  console.log('Stdout:', error.stdout);
  console.log('Stderr:', error.stderr);
  
  console.log('\n🔧 Attempting alternative solutions...');
  
  // Try generating migration first
  try {
    console.log('🔄 Trying drizzle-kit generate...');
    const generateResult = execSync('npx drizzle-kit generate', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ Migration generation successful!');
    console.log(generateResult);
  } catch (generateError) {
    console.log('❌ Migration generation also failed');
    console.log('Generate Error:', generateError.message);
  }
}

// Step 6: Manual Database Creation Fallback
console.log('\n📋 Step 6: Manual Database Creation Option');
console.log('If Drizzle continues to fail, you can manually create the database:');
console.log('1. Open phpMyAdmin (http://localhost/phpmyadmin)');
console.log('2. Create database "drisya" if it doesn\'t exist');
console.log('3. Run the SQL commands from test-db-fix.md');
console.log('4. Test the application');

// Step 7: Verification
console.log('\n📋 Step 7: Next Steps');
console.log('After fixing the database:');
console.log('1. Run: npm run build');
console.log('2. Run: npm start');
console.log('3. Test: http://localhost:5000');
console.log('4. Check: http://localhost:5000/api/media');

console.log('\n🏁 Database Fix Test Script Complete!');
console.log('Check the output above for any issues that need to be addressed.');
