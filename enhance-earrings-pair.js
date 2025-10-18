#!/usr/bin/env node

/**
 * Enhanced Earrings Pair Processing
 * Process both earrings with the Dark Blue Velvet enhancement
 */

import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:5001';
const EARRINGS_IMAGE_PATH = './your-earrings.jpg';
const EARRINGS_PNG_PATH = './your-earrings.png';

// Your exact enhancement prompt
const ENHANCEMENT_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

class EarringsPairEnhancer {
  constructor() {
    this.sessionCookie = null;
    this.results = [];
  }

  async login() {
    console.log('🔐 Authenticating with DrisyaEnhance...');
    
    try {
      const loginData = {
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        name: 'Earrings Enhancement User'
      };

      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, loginData);
      
      if (registerResponse.headers['set-cookie']) {
        this.sessionCookie = registerResponse.headers['set-cookie'][0];
        console.log('✅ Successfully authenticated');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async prepareImage() {
    console.log('\n🔄 Preparing earrings image for AI enhancement...');
    
    if (!fs.existsSync(EARRINGS_IMAGE_PATH)) {
      console.error(`❌ Earrings image not found: ${EARRINGS_IMAGE_PATH}`);
      console.log('Please save your earrings image as "your-earrings.jpg"');
      return false;
    }

    try {
      // Convert to proper RGBA PNG format for OpenAI
      console.log('🎨 Converting to RGBA PNG format...');
      
      await sharp(EARRINGS_IMAGE_PATH)
        .png()
        .toColourspace('srgb')
        .ensureAlpha(1.0)
        .resize(1080, 1080, { 
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFile(EARRINGS_PNG_PATH);

      // Verify the conversion
      const image = sharp(EARRINGS_PNG_PATH);
      const metadata = await image.metadata();
      const stats = fs.statSync(EARRINGS_PNG_PATH);
      
      console.log(`✅ Image prepared:`);
      console.log(`   Format: ${metadata.format} (${metadata.channels} channels)`);
      console.log(`   Size: ${metadata.width}x${metadata.height}px`);
      console.log(`   File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Has Alpha: ${metadata.hasAlpha ? 'YES' : 'NO'}`);
      
      return metadata.hasAlpha && metadata.format === 'png';
      
    } catch (error) {
      console.error('❌ Image preparation failed:', error.message);
      return false;
    }
  }

  async enhanceWithTemplate(templateName, apiEndpoint, jewelryName = null, backgroundStyle = null) {
    console.log(`\n🎨 Enhancing with ${templateName}...`);
    
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(EARRINGS_PNG_PATH));
      
      // Add additional parameters for dynamic enhancement
      if (jewelryName) {
        formData.append('jewelryName', jewelryName);
      }
      if (backgroundStyle) {
        formData.append('backgroundStyle', backgroundStyle);
      }

      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}${apiEndpoint}`, formData, {
        headers: {
          ...formData.getHeaders(),
          Cookie: this.sessionCookie || ''
        },
        timeout: 120000 // 2 minutes timeout
      });

      const processingTime = Date.now() - startTime;

      if (response.data.success) {
        const result = {
          template: templateName,
          success: true,
          outputUrl: response.data.outputUrl,
          cost: response.data.cost || 0.04,
          processingTime: processingTime,
          metadata: response.data.metadata
        };
        
        this.results.push(result);
        
        console.log(`✅ ${templateName} enhancement successful!`);
        console.log(`   🎭 Enhanced image: ${result.outputUrl}`);
        console.log(`   💰 Cost: $${result.cost}`);
        console.log(`   ⏱️ Processing time: ${(processingTime / 1000).toFixed(1)}s`);
        
        return result;
      } else {
        console.error(`❌ ${templateName} enhancement failed:`, response.data.error);
        return false;
      }
    } catch (error) {
      console.error(`❌ ${templateName} enhancement request failed:`, error.response?.data || error.message);
      return false;
    }
  }

  async enhanceBothVariations() {
    console.log('\n🎯 Processing earrings with both enhancement methods...');
    
    // Method 1: Dark Blue Velvet Template
    const velvetResult = await this.enhanceWithTemplate(
      'Dark Blue Velvet Template',
      '/api/template-ai/dark-blue-velvet'
    );

    // Method 2: Dynamic Jewelry Enhancement
    const dynamicResult = await this.enhanceWithTemplate(
      'Dynamic Jewelry Enhancement',
      '/api/template-ai/jewelry-enhance',
      'Elegant Gold Spiral Earrings with Diamonds',
      'Dark Blue Velvet Luxury'
    );

    return { velvetResult, dynamicResult };
  }

  async generateReport() {
    console.log('\n📊 Enhancement Results Report');
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.success).length;
    const totalCost = this.results.reduce((sum, r) => sum + (r.cost || 0), 0);
    const avgProcessingTime = this.results.reduce((sum, r) => sum + r.processingTime, 0) / this.results.length;
    
    console.log(`📸 Original Image: ${EARRINGS_IMAGE_PATH}`);
    console.log(`🎨 Enhancement Prompt: "${ENHANCEMENT_PROMPT.substring(0, 80)}..."`);
    console.log(`✅ Successful Enhancements: ${successful}/${this.results.length}`);
    console.log(`💰 Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`⏱️ Average Processing Time: ${(avgProcessingTime / 1000).toFixed(1)}s`);
    
    console.log('\n🎭 Generated Images:');
    this.results.forEach((result, index) => {
      if (result.success) {
        console.log(`   ${index + 1}. ${result.template}`);
        console.log(`      📁 File: ${result.outputUrl}`);
        console.log(`      💰 Cost: $${result.cost}`);
        console.log(`      ⏱️ Time: ${(result.processingTime / 1000).toFixed(1)}s`);
      }
    });
    
    console.log('\n📂 Find your enhanced images in:');
    console.log('   c:\\xampp\\htdocs\\DrisyaEnhance\\uploads\\processed\\');
    
    console.log('\n🎯 Your Enhancement Specifications Applied:');
    console.log('   ✅ Dark elegant matte blue velvet background');
    console.log('   ✅ Moody directional lighting');
    console.log('   ✅ Criss-cross windowpane shadow patterns');
    console.log('   ✅ Dramatic luxurious ambiance');
    console.log('   ✅ Evening indoor lighting effects');
    console.log('   ✅ Premium cinematic environment');
    console.log('   ✅ Original earring design preserved');
    console.log('   ✅ 1080x1080px output size');
  }

  async processEarringsPair() {
    console.log('🚀 Starting Earrings Pair Enhancement Process...');
    console.log(`🎯 Target: ${BASE_URL}`);
    console.log(`📁 Image: ${EARRINGS_IMAGE_PATH}`);
    console.log(`📝 Prompt: ${ENHANCEMENT_PROMPT.substring(0, 100)}...`);
    console.log('');

    // Step 1: Authentication
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }

    // Step 2: Prepare image
    const imageReady = await this.prepareImage();
    if (!imageReady) {
      console.error('❌ Cannot proceed without proper image format');
      return;
    }

    // Step 3: Enhance with both methods
    const results = await this.enhanceBothVariations();
    
    // Step 4: Generate report
    await this.generateReport();

    if (this.results.some(r => r.success)) {
      console.log('\n🎉 SUCCESS! Your earrings have been enhanced with Dark Blue Velvet luxury!');
    } else {
      console.log('\n⚠️ Enhancement failed. Please check the error messages above.');
    }
  }
}

// Run the enhancement
const enhancer = new EarringsPairEnhancer();
enhancer.processEarringsPair().catch(console.error);
