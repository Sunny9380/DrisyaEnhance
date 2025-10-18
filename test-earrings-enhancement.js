#!/usr/bin/env node

/**
 * Test AI Enhancement with Earrings Image
 * Uses the real OpenAI API key to enhance the earrings with Dark Blue Velvet background
 */

import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { convertImageForOpenAI } from './convert-image.js';

const BASE_URL = 'http://localhost:5001'; // Updated port
const EARRINGS_IMAGE_PATH = './your-earrings.jpg';
const EARRINGS_PNG_PATH = './your-earrings.png';

// Your specific enhancement prompt
const ENHANCEMENT_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

class EarringsEnhancementTest {
  constructor() {
    this.sessionCookie = null;
  }

  async login() {
    console.log('🔐 Logging in to get session...');
    
    try {
      const loginData = {
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        name: 'Test User'
      };

      // Register first
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, loginData);
      
      if (registerResponse.headers['set-cookie']) {
        this.sessionCookie = registerResponse.headers['set-cookie'][0];
        console.log('✅ Successfully logged in');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    }
  }

  async prepareImage() {
    console.log('\n🔄 Preparing image for OpenAI...');
    
    if (!fs.existsSync(EARRINGS_IMAGE_PATH)) {
      console.error(`❌ Earrings image not found at: ${EARRINGS_IMAGE_PATH}`);
      console.log('Please save your earrings image as "your-earrings.jpg" in the project root');
      return false;
    }

    try {
      // Convert JPG to PNG if needed
      if (!fs.existsSync(EARRINGS_PNG_PATH)) {
        console.log('🔄 Converting JPG to PNG for OpenAI compatibility...');
        await convertImageForOpenAI(EARRINGS_IMAGE_PATH, EARRINGS_PNG_PATH);
      } else {
        console.log('✅ PNG version already exists');
      }
      return true;
    } catch (error) {
      console.error('❌ Image preparation failed:', error.message);
      return false;
    }
  }

  async testDarkBlueVelvetEnhancement() {
    console.log('\n🎨 Testing Dark Blue Velvet Enhancement...');
    
    const imageReady = await this.prepareImage();
    if (!imageReady) {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(EARRINGS_PNG_PATH));

      const response = await axios.post(`${BASE_URL}/api/template-ai/dark-blue-velvet`, formData, {
        headers: {
          ...formData.getHeaders(),
          Cookie: this.sessionCookie || ''
        }
      });

      if (response.data.success) {
        console.log('✅ Enhancement successful!');
        console.log(`📸 Original image: ${EARRINGS_IMAGE_PATH}`);
        console.log(`🎭 Enhanced image: ${response.data.outputUrl}`);
        console.log(`💰 Cost: $${response.data.cost}`);
        console.log(`⏱️ Processing time: ${response.data.processingTime}ms`);
        
        if (response.data.metadata) {
          console.log(`🤖 AI Model: ${response.data.metadata.model || 'OpenAI DALL-E 3'}`);
        }
        
        return response.data;
      } else {
        console.error('❌ Enhancement failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Enhancement request failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testJewelryEnhancement() {
    console.log('\n💎 Testing Dynamic Jewelry Enhancement...');
    
    const imageReady = await this.prepareImage();
    if (!imageReady) {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(EARRINGS_PNG_PATH));
      formData.append('jewelryName', 'Elegant Gold Spiral Earrings');
      formData.append('backgroundStyle', 'Dark Blue Velvet Luxury');

      const response = await axios.post(`${BASE_URL}/api/template-ai/jewelry-enhance`, formData, {
        headers: {
          ...formData.getHeaders(),
          Cookie: this.sessionCookie || ''
        }
      });

      if (response.data.success) {
        console.log('✅ Dynamic enhancement successful!');
        console.log(`📸 Original image: ${EARRINGS_IMAGE_PATH}`);
        console.log(`🎭 Enhanced image: ${response.data.outputUrl}`);
        console.log(`💰 Cost: $${response.data.cost}`);
        console.log(`⏱️ Processing time: ${response.data.processingTime}ms`);
        
        return response.data;
      } else {
        console.error('❌ Dynamic enhancement failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Dynamic enhancement request failed:', error.response?.data || error.message);
      return false;
    }
  }

  async runTest() {
    console.log('🚀 Starting Earrings AI Enhancement Test...');
    console.log(`🎯 Target: ${BASE_URL}`);
    console.log(`📁 Image: ${EARRINGS_IMAGE_PATH}`);
    console.log(`📝 Prompt: ${ENHANCEMENT_PROMPT.substring(0, 100)}...`);
    console.log('');

    // Step 1: Login
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }

    // Step 2: Test Dark Blue Velvet Enhancement
    const velvetResult = await this.testDarkBlueVelvetEnhancement();
    
    // Step 3: Test Dynamic Jewelry Enhancement
    const dynamicResult = await this.testJewelryEnhancement();

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Dark Blue Velvet: ${velvetResult ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Dynamic Enhancement: ${dynamicResult ? 'SUCCESS' : 'FAILED'}`);
    
    if (velvetResult || dynamicResult) {
      console.log('\n🎉 AI Enhancement is working with your OpenAI API key!');
      console.log('🔍 Check the output files in your uploads/processed/ directory');
    } else {
      console.log('\n⚠️ AI Enhancement tests failed. Check your server logs for details.');
    }
  }
}

// Create a simple earrings image placeholder if the file doesn't exist
function createPlaceholderImage() {
  if (!fs.existsSync(EARRINGS_IMAGE_PATH)) {
    console.log('📝 Creating placeholder image...');
    console.log('Please replace this with your actual earrings image');
    
    // Create a minimal JPEG header for testing
    const buffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0xFF, 0xD9
    ]);
    fs.writeFileSync(EARRINGS_IMAGE_PATH, buffer);
  }
}

// Run the test
createPlaceholderImage();
const tester = new EarringsEnhancementTest();
tester.runTest().catch(console.error);
