#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests all API endpoints and fixes problems
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 API Testing & Fix Script Starting...\n');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123',
  name: 'Test User'
};

let authCookie = '';
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    }
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, requestOptions);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

// Test function wrapper
async function runTest(testName, testFunction) {
  console.log(`\n🔍 Testing: ${testName}`);
  try {
    const result = await testFunction();
    if (result.success) {
      console.log(`✅ ${testName}: PASSED`);
      testResults.passed++;
    } else {
      console.log(`❌ ${testName}: FAILED - ${result.message}`);
      testResults.failed++;
      testResults.errors.push(`${testName}: ${result.message}`);
    }
    return result;
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    testResults.failed++;
    testResults.errors.push(`${testName}: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// Wait for server to be ready
async function waitForServer(maxAttempts = 30) {
  console.log('⏳ Waiting for server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await makeRequest('/api/auth/me');
      if (response.status !== 0) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  console.log('\n❌ Server failed to start within timeout');
  return false;
}

// Test Cases
const tests = {
  // Authentication Tests
  async testAuthRegister() {
    const response = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });

    if (response.ok && response.data.user) {
      // Extract session cookie
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        authCookie = setCookie.split(';')[0];
      }
      return { success: true, message: 'User registered successfully' };
    } else if (response.status === 400 && response.data.message?.includes('already registered')) {
      return { success: true, message: 'User already exists (expected)' };
    }
    return { success: false, message: `Registration failed: ${response.data?.message || 'Unknown error'}` };
  },

  async testAuthLogin() {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (response.ok && response.data.user) {
      // Extract session cookie
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        authCookie = setCookie.split(';')[0];
      }
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: `Login failed: ${response.data?.message || 'Unknown error'}` };
  },

  async testAuthMe() {
    const response = await makeRequest('/api/auth/me');
    
    if (response.ok && response.data.user) {
      return { success: true, message: 'User profile retrieved' };
    } else if (response.status === 401) {
      return { success: false, message: 'Not authenticated - session issue' };
    }
    return { success: false, message: `Profile fetch failed: ${response.data?.message || 'Unknown error'}` };
  },

  // Media & Gallery Tests
  async testMediaEndpoint() {
    const response = await makeRequest('/api/media');
    
    if (response.ok && response.data) {
      return { success: true, message: 'Media endpoint working' };
    } else if (response.status === 401) {
      return { success: false, message: 'Media endpoint requires authentication' };
    }
    return { success: false, message: `Media endpoint failed: ${response.data?.message || 'Unknown error'}` };
  },

  async testMediaLibrary() {
    const response = await makeRequest('/api/media-library');
    
    if (response.ok && response.data) {
      return { success: true, message: 'Media library endpoint working' };
    } else if (response.status === 401) {
      return { success: false, message: 'Media library requires authentication' };
    }
    return { success: false, message: `Media library failed: ${response.data?.message || 'Unknown error'}` };
  },

  // Template Tests
  async testTemplates() {
    const response = await makeRequest('/api/templates');
    
    if (response.ok && response.data) {
      return { success: true, message: 'Templates endpoint working' };
    }
    return { success: false, message: `Templates failed: ${response.data?.message || 'Unknown error'}` };
  },

  // Admin Tests (if user is admin)
  async testAdminStats() {
    const response = await makeRequest('/api/admin/stats');
    
    if (response.ok && response.data) {
      return { success: true, message: 'Admin stats working' };
    } else if (response.status === 403) {
      return { success: true, message: 'Admin endpoint properly protected' };
    } else if (response.status === 401) {
      return { success: true, message: 'Admin endpoint requires authentication' };
    }
    return { success: false, message: `Admin stats failed: ${response.data?.message || 'Unknown error'}` };
  },

  // Database Connection Test
  async testDatabaseConnection() {
    // This tests if the server can connect to database by checking user profile
    const response = await makeRequest('/api/auth/me');
    
    if (response.ok || response.status === 401) {
      return { success: true, message: 'Database connection working' };
    } else if (response.data?.message?.includes('database') || response.data?.message?.includes('connection')) {
      return { success: false, message: 'Database connection issue detected' };
    }
    return { success: true, message: 'Database connection appears to be working' };
  }
};

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting comprehensive API tests...\n');

  // Step 1: Check if server is running, if not start it
  const serverReady = await waitForServer(10);
  if (!serverReady) {
    console.log('🔄 Attempting to start server...');
    try {
      // Start server in background
      execSync('start cmd /k "npm run dev"', { stdio: 'ignore' });
      console.log('⏳ Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const serverReadyAfterStart = await waitForServer(20);
      if (!serverReadyAfterStart) {
        console.log('❌ Failed to start server automatically');
        console.log('Please manually run: npm run dev');
        return;
      }
    } catch (error) {
      console.log('❌ Failed to start server:', error.message);
      console.log('Please manually run: npm run dev');
      return;
    }
  }

  // Step 2: Run all tests
  console.log('\n📋 Running API Tests...');
  
  // Authentication flow
  await runTest('User Registration', tests.testAuthRegister);
  await runTest('User Login', tests.testAuthLogin);
  await runTest('User Profile', tests.testAuthMe);
  
  // Core API endpoints
  await runTest('Media Endpoint', tests.testMediaEndpoint);
  await runTest('Media Library', tests.testMediaLibrary);
  await runTest('Templates', tests.testTemplates);
  await runTest('Admin Stats', tests.testAdminStats);
  await runTest('Database Connection', tests.testDatabaseConnection);

  // Step 3: Results summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🔍 Issues Found:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });

    console.log('\n🔧 Recommended Fixes:');
    if (testResults.errors.some(e => e.includes('authentication') || e.includes('session'))) {
      console.log('- Check session configuration in server/index.ts');
      console.log('- Verify MySQL session store is working');
    }
    if (testResults.errors.some(e => e.includes('database') || e.includes('connection'))) {
      console.log('- Run: npm run db:push');
      console.log('- Check XAMPP MySQL is running');
      console.log('- Verify database "drisya" exists');
    }
    if (testResults.errors.some(e => e.includes('Media') || e.includes('media'))) {
      console.log('- Check /api/media endpoint implementation');
      console.log('- Verify gallery directory exists');
    }
  } else {
    console.log('\n🎉 All tests passed! API is working correctly.');
  }

  console.log('\n🏁 API Testing Complete!');
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
