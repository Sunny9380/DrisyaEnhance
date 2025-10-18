#!/usr/bin/env node

/**
 * Debug GPT-Image-1 Response Structure
 * Check what the actual response looks like from gpt-image-1
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function debugGPTImage1Response() {
  console.log('🔍 Debugging GPT-Image-1 Response Structure...');
  console.log('=' .repeat(60));
  
  const prompt = "A simple test image of a gold ring on white background";

  try {
    console.log('🔄 Generating with gpt-image-1...');
    
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

    console.log('✅ Response received!');
    console.log('');
    console.log('📋 Full Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    
    if (response.data.data && response.data.data.length > 0) {
      const imageData = response.data.data[0];
      console.log('🎭 Image Data Keys:', Object.keys(imageData));
      
      if (imageData.url) {
        console.log(`✅ Image URL: ${imageData.url}`);
      } else if (imageData.b64_json) {
        console.log('✅ Base64 data received (length:', imageData.b64_json.length, 'chars)');
      } else {
        console.log('❓ Unknown image format in response');
      }
      
      if (imageData.revised_prompt) {
        console.log(`📝 Revised Prompt: ${imageData.revised_prompt}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugGPTImage1Response().catch(console.error);
