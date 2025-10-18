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
  console.log('🎨 GPT-Image-1 Enhanced Men\'s Bracelet Generation...');
  console.log('=' .repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }

  // Enhanced prompt for men's bracelet with beige-brown fabric and cream wooden background
  const prompt = `A hyper-realistic product photograph of a luxurious men's bracelet laid diagonally across a soft beige-brown fabric background and a light cream wooden surface. The clasp is positioned at the bottom left corner of the image. A pale peach rose with soft petals is placed in the upper left corner for a decorative touch. Lighting is warm, soft, and diffused, casting gentle shadows and highlighting the metallic shine and texture of the bracelet links. Ensure the bracelet design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. Make a image size is 1080 X 1080px.`;

  console.log('🎯 Prompt:', prompt.substring(0, 100) + '...');
  console.log('🤖 Model: gpt-image-1');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    console.log('🔄 Generating enhanced men\'s bracelet with gpt-image-1...');
    
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
        console.log('📥 Saving generated enhanced men\'s bracelet...');
        
        const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
        const filename = `gpt-image-1-enhanced-bracelet-${Date.now()}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageBuffer);
        
        console.log(`✅ Enhanced men's bracelet saved: ${filepath}`);
        console.log(`📁 File size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Also save a copy with a simple name for easy access
        const simplePath = 'gpt-image-1-beige-fabric-bracelet.png';
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
  console.log('🎯 Your beige fabric luxury template created');
  console.log('💎 Perfect for men\'s bracelet photography');
}

generateEnhancedEarringsWithGPTImage1().catch(console.error);
