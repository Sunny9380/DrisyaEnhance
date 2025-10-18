#!/usr/bin/env node

/**
 * Test GPT-Image-1 Model (After Organization Verification)
 * Testing if gpt-image-1 works now that organization is verified
 */

import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testGPTImage1Verified() {
  console.log('🎨 Testing "gpt-image-1" Model (After Verification)...');
  console.log('=' .repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }

  const prompt = "A high-end product photograph of Gold Diamond Spiral Earrings, placed on a matte blue velvet background with soft texture, cinematic lighting, realistic window shadows, and a premium look.";

  console.log('🎯 Prompt:', prompt.substring(0, 80) + '...');
  console.log('🤖 Model: gpt-image-1 (AFTER VERIFICATION)');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    console.log('🔄 Testing gpt-image-1 with verified organization...');
    
    const startTime = Date.now();
    
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'gpt-image-1',
      prompt: prompt,
      size: '1024x1024'
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });

    const processingTime = Date.now() - startTime;

    if (response.data.data && response.data.data.length > 0) {
      const imageUrl = response.data.data[0].url;
      const revisedPrompt = response.data.data[0].revised_prompt;
      
      console.log('✅ GPT-IMAGE-1 SUCCESS!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   🎭 Image URL: ${imageUrl}`);
      console.log(`   ⏱️ Processing Time: ${(processingTime / 1000).toFixed(1)}s`);
      console.log(`   💰 Estimated Cost: $0.04 (₹3.40)`);
      console.log('');
      console.log('📝 Revised Prompt:');
      console.log(`   ${revisedPrompt}`);
      
      // Download the image
      console.log('');
      console.log('📥 Downloading gpt-image-1 generated image...');
      
      try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const filename = `gpt-image-1-test-${Date.now()}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageResponse.data);
        
        console.log(`✅ Image saved: ${filepath}`);
        console.log(`📁 File size: ${(imageResponse.data.length / 1024 / 1024).toFixed(2)} MB`);
        
      } catch (downloadError) {
        console.error('❌ Failed to download image:', downloadError.message);
      }
      
    } else {
      console.error('❌ No image data received from gpt-image-1');
    }

  } catch (error) {
    console.log('❌ GPT-Image-1 Still Failed:');
    console.log('');
    console.log('📋 Error Response:');
    console.log(JSON.stringify(error.response?.data, null, 2));
    console.log('');
    console.log('🔍 Error Details:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Code: ${error.response?.data?.error?.code}`);
    console.log(`   Message: ${error.response?.data?.error?.message}`);
    console.log(`   Type: ${error.response?.data?.error?.type}`);
    
    if (error.response?.status === 403) {
      console.log('');
      console.log('💡 Possible Issues:');
      console.log('   - Verification may take up to 15 minutes to propagate');
      console.log('   - Try again in a few minutes');
      console.log('   - Check organization settings again');
    }
  }

  console.log('');
  console.log('🎉 Test Complete!');
  console.log('=' .repeat(60));
}

testGPTImage1Verified().catch(console.error);
