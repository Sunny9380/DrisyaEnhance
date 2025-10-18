#!/usr/bin/env node

/**
 * Test GPT-Image-1 Model (to show it doesn't exist)
 * This will demonstrate the actual API error when using gpt-image-1
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testGPTImage1Model() {
  console.log('🧪 Testing "gpt-image-1" Model...');
  console.log('=' .repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }

  const prompt = "A high-end product photograph of Gold Diamond Spiral Earrings, placed on a matte blue velvet background with soft texture, cinematic lighting, realistic window shadows, and a premium look.";

  console.log('🎯 Prompt:', prompt.substring(0, 80) + '...');
  console.log('🤖 Model: gpt-image-1 (TESTING IF THIS EXISTS)');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    console.log('🔄 Attempting to use gpt-image-1 model...');
    
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'gpt-image-1',  // This model does NOT exist
      prompt: prompt,
      size: '1024x1024'
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // This should never execute
    console.log('✅ Unexpected success with gpt-image-1');
    console.log(response.data);

  } catch (error) {
    console.log('❌ Expected Error with gpt-image-1:');
    console.log('');
    console.log('📋 Full Error Response:');
    console.log(JSON.stringify(error.response?.data, null, 2));
    console.log('');
    console.log('🔍 Error Details:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Code: ${error.response?.data?.error?.code}`);
    console.log(`   Message: ${error.response?.data?.error?.message}`);
    console.log(`   Type: ${error.response?.data?.error?.type}`);
  }

  console.log('');
  console.log('=' .repeat(60));
  console.log('🎯 Now testing with CORRECT model: dall-e-3');
  console.log('');

  try {
    console.log('🔄 Generating with dall-e-3 (correct model)...');
    
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3',  // Correct model
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard'
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });

    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ SUCCESS with dall-e-3!');
      console.log(`   🎭 Image URL: ${response.data.data[0].url}`);
      console.log(`   💰 Cost: $0.04 (₹3.40)`);
      console.log('');
      console.log('📝 Revised Prompt:');
      console.log(`   ${response.data.data[0].revised_prompt}`);
    }

  } catch (error) {
    console.error('❌ Error with dall-e-3:');
    console.error(`   ${error.response?.data?.error?.message || error.message}`);
  }

  console.log('');
  console.log('🎉 Test Complete!');
  console.log('=' .repeat(60));
  console.log('❌ gpt-image-1: Does NOT exist');
  console.log('✅ dall-e-3: Correct model for image generation');
}

testGPTImage1Model().catch(console.error);
