#!/usr/bin/env node

/**
 * Comprehensive API Testing Script for DrisyaEnhance
 * Tests all endpoints and identifies issues
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';
const TEST_IMAGE_PATH = './test-image.jpg';

// Create a simple test image if it doesn't exist
function createTestImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    // Create a minimal JPEG header for testing
    const buffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0xFF, 0xD9
    ]);
    fs.writeFileSync(TEST_IMAGE_PATH, buffer);
    console.log('✅ Created test image');
  }
}

class APITester {
  constructor() {
    this.results = [];
    this.sessionCookie = null;
  }

  async log(endpoint, method, status, message, error = null) {
    const result = {
      endpoint,
      method,
      status,
      message,
      error: error?.message || null,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${method} ${endpoint} - ${message}`);
    if (error) {
      console.log(`   Error: ${error.message}`);
    }
  }

  async makeRequest(method, endpoint, data = null, options = {}) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      if (this.sessionCookie) {
        config.headers.Cookie = this.sessionCookie;
      }

      if (data && method !== 'GET') {
        config.data = data;
      }

      const response = await axios(config);
      
      // Extract session cookie from response
      if (response.headers['set-cookie']) {
        this.sessionCookie = response.headers['set-cookie'][0];
      }
      
      return { success: true, data: response.data, status: response.status, headers: response.headers };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message, 
        status: error.response?.status || 500 
      };
    }
  }

  async testAuthEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints...');

    // Test registration
    const registerData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };

    const registerResult = await this.makeRequest('POST', '/api/auth/register', registerData);
    if (registerResult.success) {
      await this.log('/api/auth/register', 'POST', 'PASS', 'User registration successful');
      console.log(`   Session cookie: ${this.sessionCookie ? 'Set' : 'Not set'}`);
    } else {
      await this.log('/api/auth/register', 'POST', 'FAIL', 'User registration failed', registerResult.error);
    }

    // Test login
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    const loginResult = await this.makeRequest('POST', '/api/auth/login', loginData);
    if (loginResult.success) {
      await this.log('/api/auth/login', 'POST', 'PASS', 'User login successful');
    } else {
      await this.log('/api/auth/login', 'POST', 'FAIL', 'User login failed', loginResult.error);
    }

    // Test me endpoint
    const meResult = await this.makeRequest('GET', '/api/auth/me');
    if (meResult.success) {
      await this.log('/api/auth/me', 'GET', 'PASS', 'Get current user successful');
    } else {
      await this.log('/api/auth/me', 'GET', 'FAIL', 'Get current user failed', meResult.error);
    }
  }

  async testTemplateEndpoints() {
    console.log('\n🎨 Testing Template Endpoints...');

    // Test get templates
    const templatesResult = await this.makeRequest('GET', '/api/templates');
    if (templatesResult.success) {
      await this.log('/api/templates', 'GET', 'PASS', `Found ${templatesResult.data.templates?.length || 0} templates`);
    } else {
      await this.log('/api/templates', 'GET', 'FAIL', 'Get templates failed', templatesResult.error);
    }

    // Test template AI endpoints
    const backgroundsResult = await this.makeRequest('GET', '/api/template-ai/backgrounds');
    if (backgroundsResult.success) {
      await this.log('/api/template-ai/backgrounds', 'GET', 'PASS', `Found ${backgroundsResult.data.backgrounds?.length || 0} backgrounds`);
    } else {
      await this.log('/api/template-ai/backgrounds', 'GET', 'FAIL', 'Get backgrounds failed', backgroundsResult.error);
    }

    // Test template AI templates
    const aiTemplatesResult = await this.makeRequest('GET', '/api/template-ai/templates');
    if (aiTemplatesResult.success) {
      await this.log('/api/template-ai/templates', 'GET', 'PASS', `Found ${aiTemplatesResult.data.templates?.length || 0} AI templates`);
    } else {
      await this.log('/api/template-ai/templates', 'GET', 'FAIL', 'Get AI templates failed', aiTemplatesResult.error);
    }
  }

  async testAIEndpoints() {
    console.log('\n🤖 Testing AI Enhancement Endpoints...');

    // Test OpenAI status
    const openaiStatusResult = await this.makeRequest('GET', '/api/openai/status');
    if (openaiStatusResult.success) {
      await this.log('/api/openai/status', 'GET', 'PASS', 'OpenAI status check successful');
    } else {
      await this.log('/api/openai/status', 'GET', 'FAIL', 'OpenAI status check failed', openaiStatusResult.error);
    }

    // Test image upload endpoints (with test image)
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      // Test Dark Blue Velvet template
      const formData = new FormData();
      formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

      const velvetResult = await this.makeRequest('POST', '/api/template-ai/dark-blue-velvet', formData, {
        headers: {
          ...formData.getHeaders(),
          Cookie: this.sessionCookie || ''
        }
      });

      if (velvetResult.success) {
        await this.log('/api/template-ai/dark-blue-velvet', 'POST', 'PASS', 'Dark Blue Velvet enhancement successful');
      } else {
        await this.log('/api/template-ai/dark-blue-velvet', 'POST', 'FAIL', 'Dark Blue Velvet enhancement failed', velvetResult.error);
        console.log(`   Detailed error:`, JSON.stringify(velvetResult.error, null, 2));
        console.log(`   Status code:`, velvetResult.status);
      }

      // Test dynamic jewelry enhancement
      const jewelryFormData = new FormData();
      jewelryFormData.append('image', fs.createReadStream(TEST_IMAGE_PATH));
      jewelryFormData.append('jewelryName', 'Test Gold Ring');
      jewelryFormData.append('backgroundStyle', 'Velvet Blue');

      const jewelryResult = await this.makeRequest('POST', '/api/template-ai/jewelry-enhance', jewelryFormData, {
        headers: {
          ...jewelryFormData.getHeaders(),
          Cookie: this.sessionCookie || ''
        }
      });

      if (jewelryResult.success) {
        await this.log('/api/template-ai/jewelry-enhance', 'POST', 'PASS', 'Dynamic jewelry enhancement successful');
      } else {
        await this.log('/api/template-ai/jewelry-enhance', 'POST', 'FAIL', 'Dynamic jewelry enhancement failed', jewelryResult.error);
        console.log(`   Detailed error:`, JSON.stringify(jewelryResult.error, null, 2));
        console.log(`   Status code:`, jewelryResult.status);
      }
    }
  }

  async testMediaEndpoints() {
    console.log('\n📁 Testing Media Endpoints...');

    // Test get media
    const mediaResult = await this.makeRequest('GET', '/api/media');
    if (mediaResult.success) {
      await this.log('/api/media', 'GET', 'PASS', `Found ${mediaResult.data.jobs?.length || 0} media items`);
    } else {
      await this.log('/api/media', 'GET', 'FAIL', 'Get media failed', mediaResult.error);
    }

    // Test media library
    const mediaLibraryResult = await this.makeRequest('GET', '/api/media-library');
    if (mediaLibraryResult.success) {
      await this.log('/api/media-library', 'GET', 'PASS', `Found ${mediaLibraryResult.data.media?.length || 0} library items`);
    } else {
      await this.log('/api/media-library', 'GET', 'FAIL', 'Get media library failed', mediaLibraryResult.error);
    }
  }

  async testUserEndpoints() {
    console.log('\n👤 Testing User Endpoints...');

    // Test profile
    const profileResult = await this.makeRequest('GET', '/api/profile');
    if (profileResult.success) {
      await this.log('/api/profile', 'GET', 'PASS', 'Get profile successful');
    } else {
      await this.log('/api/profile', 'GET', 'FAIL', 'Get profile failed', profileResult.error);
    }

    // Test usage quota
    const quotaResult = await this.makeRequest('GET', '/api/usage/quota');
    if (quotaResult.success) {
      await this.log('/api/usage/quota', 'GET', 'PASS', 'Get usage quota successful');
    } else {
      await this.log('/api/usage/quota', 'GET', 'FAIL', 'Get usage quota failed', quotaResult.error);
    }

    // Test jobs
    const jobsResult = await this.makeRequest('GET', '/api/jobs');
    if (jobsResult.success) {
      await this.log('/api/jobs', 'GET', 'PASS', `Found ${jobsResult.data.jobs?.length || 0} jobs`);
    } else {
      await this.log('/api/jobs', 'GET', 'FAIL', 'Get jobs failed', jobsResult.error);
    }
  }

  async testWalletEndpoints() {
    console.log('\n💰 Testing Wallet Endpoints...');

    // Test coin packages
    const packagesResult = await this.makeRequest('GET', '/api/wallet/packages');
    if (packagesResult.success) {
      await this.log('/api/wallet/packages', 'GET', 'PASS', `Found ${packagesResult.data.packages?.length || 0} coin packages`);
    } else {
      await this.log('/api/wallet/packages', 'GET', 'FAIL', 'Get coin packages failed', packagesResult.error);
    }

    // Test transactions
    const transactionsResult = await this.makeRequest('GET', '/api/wallet/transactions');
    if (transactionsResult.success) {
      await this.log('/api/wallet/transactions', 'GET', 'PASS', `Found ${transactionsResult.data.transactions?.length || 0} transactions`);
    } else {
      await this.log('/api/wallet/transactions', 'GET', 'FAIL', 'Get transactions failed', transactionsResult.error);
    }
  }

  async generateReport() {
    console.log('\n📊 Test Summary Report');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`   ${r.method} ${r.endpoint} - ${r.message}`);
          if (r.error) console.log(`      Error: ${r.error}`);
        });
    }

    // Save detailed report
    const reportPath = './api-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive API Testing...');
    console.log(`Testing against: ${BASE_URL}`);
    
    createTestImage();

    try {
      await this.testAuthEndpoints();
      await this.testTemplateEndpoints();
      await this.testAIEndpoints();
      await this.testMediaEndpoints();
      await this.testUserEndpoints();
      await this.testWalletEndpoints();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }

    await this.generateReport();
  }
}

// Run the tests
const tester = new APITester();
tester.runAllTests().catch(console.error);
