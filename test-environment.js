#!/usr/bin/env node

/**
 * Drisya Environment Testing Script
 * Verifies all components are running correctly
 */

import http from 'http';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Drisya Environment Testing Script');
console.log('=====================================\n');

// Test Results Storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to record test results
function recordTest(name, passed, message = '') {
  testResults.tests.push({
    name,
    passed,
    message,
    timestamp: new Date().toISOString()
  });
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  }
}

// Test 1: Check if server is running
async function testServerConnection() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      recordTest('Server Connection (Port 5000)', res.statusCode === 200 || res.statusCode === 404);
      resolve();
    });

    req.on('error', (err) => {
      recordTest('Server Connection (Port 5000)', false, `Server not responding: ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      recordTest('Server Connection (Port 5000)', false, 'Connection timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Test 2: Check database connection
async function testDatabaseConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya'
    });

    // Test if we can query the database
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    await connection.end();
    
    recordTest('Database Connection', true, `Connected successfully. Users table has ${rows[0].count} records`);
  } catch (error) {
    recordTest('Database Connection', false, error.message);
  }
}

// Test 3: Check required files exist
async function testRequiredFiles() {
  const requiredFiles = [
    'package.json',
    'server/index.ts',
    'server/storage.ts',
    'shared/schema.ts',
    '.env'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    recordTest(`Required File: ${file}`, exists, exists ? '' : 'File not found');
  }
}

// Test 4: Check environment variables
async function testEnvironmentVariables() {
  // Load .env file
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n').filter(line => line.includes('='));
    
    const requiredVars = ['DATABASE_URL', 'PORT'];
    
    for (const varName of requiredVars) {
      const hasVar = envVars.some(line => line.startsWith(`${varName}=`));
      recordTest(`Environment Variable: ${varName}`, hasVar, hasVar ? '' : 'Variable not set');
    }
  } else {
    recordTest('Environment File (.env)', false, 'File not found');
  }
}

// Test 5: Check database tables
async function testDatabaseTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya'
    });

    const requiredTables = [
      'users',
      'templates', 
      'processing_jobs',
      'images',
      'transactions',
      'coin_packages'
    ];

    for (const table of requiredTables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        recordTest(`Database Table: ${table}`, true, `${rows[0].count} records`);
      } catch (error) {
        recordTest(`Database Table: ${table}`, false, 'Table not found or inaccessible');
      }
    }

    await connection.end();
  } catch (error) {
    recordTest('Database Tables Check', false, 'Cannot connect to database');
  }
}

// Test 6: Check API endpoints
async function testAPIEndpoints() {
  const endpoints = [
    '/api/auth/me',
    '/api/templates',
    '/api/coin-packages'
  ];

  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: endpoint,
        method: 'GET',
        timeout: 5000
      }, (res) => {
        const success = res.statusCode < 500; // Accept 200, 401, 404 but not 500
        recordTest(`API Endpoint: ${endpoint}`, success, success ? `Status: ${res.statusCode}` : `Server error: ${res.statusCode}`);
        resolve();
      });

      req.on('error', (err) => {
        recordTest(`API Endpoint: ${endpoint}`, false, err.message);
        resolve();
      });

      req.on('timeout', () => {
        recordTest(`API Endpoint: ${endpoint}`, false, 'Timeout');
        req.destroy();
        resolve();
      });

      req.end();
    });
  }
}

// Main test execution
async function runAllTests() {
  console.log('Starting environment tests...\n');

  console.log('📁 Checking Required Files...');
  await testRequiredFiles();

  console.log('\n🔧 Checking Environment Variables...');
  await testEnvironmentVariables();

  console.log('\n🌐 Testing Server Connection...');
  await testServerConnection();

  console.log('\n🗄️  Testing Database Connection...');
  await testDatabaseConnection();

  console.log('\n📊 Checking Database Tables...');
  await testDatabaseTables();

  console.log('\n🔗 Testing API Endpoints...');
  await testAPIEndpoints();

  // Print summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  
  const passRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  console.log(`📈 Pass Rate: ${passRate}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Your environment is ready for testing.');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before proceeding with manual testing.');
    console.log('\nFailed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
  }

  // Save detailed results
  const reportPath = path.join(__dirname, 'environment-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Run tests
runAllTests().catch(console.error);
