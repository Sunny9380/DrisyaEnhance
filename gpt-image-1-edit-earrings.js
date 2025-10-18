#!/usr/bin/env node

/**
 * GPT-Image-1 Earrings Enhancement
 * Using OpenAI's image editing API with gpt-image-1 model
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function enhanceEarringsWithGPTImage1() {
  console.log('🎨 GPT-Image-1 Earrings Enhancement...');
  console.log('=' .repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }

  // Your exact prompt for the blue velvet background
  const prompt = "A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.";

  // Use your specific earrings image
  const imagePath = 'your-earrings.png';
  
  console.log('🎯 Prompt:', prompt.substring(0, 100) + '...');
  console.log('🖼️ Input Image:', imagePath);
  console.log('🤖 Model: gpt-image-1');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image not found: ${imagePath}`);
      console.log('💡 Available images:');
      const images = fs.readdirSync('.').filter(f => f.match(/\.(jpg|jpeg|png)$/i));
      images.forEach(img => console.log(`   - ${img}`));
      return;
    }

    console.log('🔄 Enhancing earrings with gpt-image-1...');
    
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
      
      console.log('✅ GPT-IMAGE-1 EDITING SUCCESS!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   ⏱️ Processing Time: ${(processingTime / 1000).toFixed(1)}s`);
      console.log(`   💰 Estimated Cost: $0.04 (₹3.40)`);
      console.log('');

      // Handle base64 response (gpt-image-1 default)
      if (imageData.b64_json) {
        console.log('📥 Saving enhanced image from base64...');
        
        const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
        const filename = `gpt-image-1-enhanced-earrings-${Date.now()}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageBuffer);
        
        console.log(`✅ Enhanced image saved: ${filepath}`);
        console.log(`📁 File size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
      } else if (imageData.url) {
        console.log('📥 Downloading enhanced image from URL...');
        
        const imageResponse = await axios.get(imageData.url, { responseType: 'arraybuffer' });
        const filename = `gpt-image-1-enhanced-earrings-${Date.now()}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageResponse.data);
        
        console.log(`✅ Enhanced image saved: ${filepath}`);
        console.log(`📁 File size: ${(imageResponse.data.length / 1024 / 1024).toFixed(2)} MB`);
      }

      if (imageData.revised_prompt) {
        console.log('');
        console.log('📝 Revised Prompt:');
        console.log(`   ${imageData.revised_prompt}`);
      }
      
    } else {
      console.error('❌ No image data received from gpt-image-1');
    }

  } catch (error) {
    console.error('❌ GPT-Image-1 Editing Failed:');
    console.error(`   Error: ${error.response?.data?.error?.message || error.message}`);
    console.error(`   Status: ${error.response?.status || 'Unknown'}`);
    
    if (error.response?.data) {
      console.log('');
      console.log('📋 Full Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 400) {
      console.log('');
      console.log('💡 Common Issues:');
      console.log('   - Image format not supported (use PNG/JPEG)');
      console.log('   - Image too large (max 4MB)');
      console.log('   - Invalid parameters for image editing');
    }
  }

  console.log('');
  console.log('🎉 Enhancement Complete!');
  console.log('=' .repeat(60));
}

enhanceEarringsWithGPTImage1().catch(console.error);
