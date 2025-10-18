#!/usr/bin/env node

/**
 * Command Line GPT-Image-1 Enhancement for your-earrings.png
 * Enhance your specific earrings image with blue velvet background
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function enhanceYourEarrings() {
  console.log('🎨 GPT-Image-1 Enhancement: your-earrings.png');
  console.log('=' .repeat(60));
  
  // Check API key
  if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log('🔑 Key:', OPENAI_API_KEY.substring(0, 20) + '...');

  // Your exact blue velvet enhancement prompt
  const prompt = "A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.";

  const imagePath = 'your-earrings.png';
  
  console.log('');
  console.log('🖼️ Input Image:', imagePath);
  console.log('🎯 Enhancement: Dark Blue Velvet Luxury Background');
  console.log('🤖 Model: gpt-image-1 (Image Editing)');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Error: Image not found: ${imagePath}`);
      console.log('💡 Make sure your-earrings.png is in the current directory');
      process.exit(1);
    }

    console.log('✅ Image file found');
    const stats = fs.statSync(imagePath);
    console.log(`📁 Original size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    console.log('🔄 Enhancing with GPT-Image-1...');
    console.log('⏳ This may take 30-60 seconds...');
    
    const startTime = Date.now();
    
    // Create form data for image editing
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('prompt', prompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');
    formData.append('n', '1');

    const response = await axios.post('https://api.openai.com/v1/images/edits', formData, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      timeout: 180000 // 3 minutes for image editing
    });

    const processingTime = Date.now() - startTime;

    if (response.data.data && response.data.data.length > 0) {
      const imageData = response.data.data[0];
      
      console.log('✅ GPT-IMAGE-1 ENHANCEMENT SUCCESS!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   ⏱️ Processing Time: ${(processingTime / 1000).toFixed(1)}s`);
      console.log(`   💰 Cost: $0.04 (₹3.40)`);
      console.log('');

      // Save the enhanced image
      if (imageData.b64_json) {
        console.log('💾 Saving enhanced earrings...');
        
        const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
        const timestamp = Date.now();
        const filename = `your-earrings-enhanced-${timestamp}.png`;
        
        await fs.promises.writeFile(filename, imageBuffer);
        
        console.log(`✅ Enhanced image saved: ${filename}`);
        console.log(`📁 File size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Also save with a simple name for easy access
        const simpleName = 'your-earrings-blue-velvet.png';
        await fs.promises.writeFile(simpleName, imageBuffer);
        console.log(`✅ Copy saved as: ${simpleName}`);
        
      } else if (imageData.url) {
        console.log('📥 Downloading enhanced image from URL...');
        
        const imageResponse = await axios.get(imageData.url, { responseType: 'arraybuffer' });
        const timestamp = Date.now();
        const filename = `your-earrings-enhanced-${timestamp}.png`;
        
        await fs.promises.writeFile(filename, imageResponse.data);
        
        console.log(`✅ Enhanced image saved: ${filename}`);
        console.log(`📁 File size: ${(imageResponse.data.length / 1024 / 1024).toFixed(2)} MB`);
        
      } else {
        console.log('⚠️ No image data received');
      }

      // Show usage statistics if available
      if (response.data.usage) {
        console.log('');
        console.log('📈 Token Usage:');
        console.log(`   Input: ${response.data.usage.input_tokens}`);
        console.log(`   Output: ${response.data.usage.output_tokens}`);
        console.log(`   Total: ${response.data.usage.total_tokens}`);
      }

      console.log('');
      console.log('🎉 Enhancement Complete!');
      console.log('✨ Your earrings now have a luxurious blue velvet background');
      console.log('🎯 Perfect for e-commerce, social media, or marketing');
      
    } else {
      console.error('❌ No image data received from GPT-Image-1');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ GPT-Image-1 Enhancement Failed:');
    console.error(`   Error: ${error.response?.data?.error?.message || error.message}`);
    console.error(`   Status: ${error.response?.status || 'Unknown'}`);
    
    if (error.response?.data) {
      console.log('');
      console.log('📋 Full Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    // Specific error handling
    if (error.response?.status === 400) {
      console.log('');
      console.log('💡 Image Format Issue:');
      console.log('   - Make sure your-earrings.png is a valid PNG file');
      console.log('   - Image should be less than 4MB');
      console.log('   - Try converting to PNG format if needed');
    } else if (error.response?.status === 403) {
      console.log('');
      console.log('💡 Organization Verification Required:');
      console.log('   - Your organization needs to be verified for GPT-Image-1');
      console.log('   - Go to: https://platform.openai.com/settings/organization/general');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Enhancement interrupted by user');
  process.exit(0);
});

// Run the enhancement
enhanceYourEarrings().catch((error) => {
  console.error('💥 Unexpected error:', error.message);
  process.exit(1);
});
