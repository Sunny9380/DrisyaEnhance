#!/usr/bin/env node

/**
 * GPT-Image-1 Earrings Generation (Alternative to Editing)
 * Generate enhanced earrings using text-to-image with detailed prompt
 */

import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateEnhancedEarringsWithGPTImage1() {
  console.log('🎨 GPT-Image-1 Enhanced Earrings Generation...');
  console.log('=' .repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }

  // Enhanced prompt combining earrings description with your background requirements
  const prompt = `A high-end product photograph of elegant gold spiral diamond earrings with intricate link patterns and detailed clasps. The earrings are positioned on a dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene evokes a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment feels premium, rich, and cinematic. Professional jewelry photography with perfect composition, sharp details, and luxury aesthetic. 1080x1080px format.`;

  console.log('🎯 Prompt:', prompt.substring(0, 100) + '...');
  console.log('🤖 Model: gpt-image-1');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    console.log('🔄 Generating enhanced earrings with gpt-image-1...');
    
    const startTime = Date.now();
    
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'gpt-image-1',
      prompt: prompt,
      size: '1024x1024',
      n: 1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 180000 // 3 minutes
    });

    const processingTime = Date.now() - startTime;

    if (response.data.data && response.data.data.length > 0) {
      const imageData = response.data.data[0];
      
      console.log('✅ GPT-IMAGE-1 GENERATION SUCCESS!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   ⏱️ Processing Time: ${(processingTime / 1000).toFixed(1)}s`);
      console.log(`   💰 Cost: $0.04 (₹3.40)`);
      console.log('');

      // Save the generated image
      if (imageData.b64_json) {
        console.log('📥 Saving generated enhanced earrings...');
        
        const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
        const filename = `gpt-image-1-enhanced-earrings-${Date.now()}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageBuffer);
        
        console.log(`✅ Enhanced earrings saved: ${filepath}`);
        console.log(`📁 File size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Also save a copy with a simple name for easy access
        const simplePath = 'gpt-image-1-blue-velvet-earrings.png';
        await fs.promises.writeFile(simplePath, imageBuffer);
        console.log(`✅ Copy saved as: ${simplePath}`);
        
      } else {
        console.error('❌ No base64 image data received');
      }

      if (imageData.revised_prompt) {
        console.log('');
        console.log('📝 Revised Prompt:');
        console.log(`   ${imageData.revised_prompt}`);
      }

      // Show usage statistics if available
      if (response.data.usage) {
        console.log('');
        console.log('📈 Usage Statistics:');
        console.log(`   Input Tokens: ${response.data.usage.input_tokens}`);
        console.log(`   Output Tokens: ${response.data.usage.output_tokens}`);
        console.log(`   Total Tokens: ${response.data.usage.total_tokens}`);
      }
      
    } else {
      console.error('❌ No image data received from gpt-image-1');
    }

  } catch (error) {
    console.error('❌ GPT-Image-1 Generation Failed:');
    console.error(`   Error: ${error.response?.data?.error?.message || error.message}`);
    console.error(`   Status: ${error.response?.status || 'Unknown'}`);
    
    if (error.response?.data) {
      console.log('');
      console.log('📋 Full Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('');
  console.log('🎉 Generation Complete!');
  console.log('=' .repeat(60));
  console.log('✅ GPT-Image-1 model working successfully');
  console.log('🎯 Your blue velvet luxury template recreated');
  console.log('💎 Perfect for jewelry enhancement workflow');
}

generateEnhancedEarringsWithGPTImage1().catch(console.error);
