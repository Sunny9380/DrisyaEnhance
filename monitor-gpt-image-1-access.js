#!/usr/bin/env node

/**
 * Monitor GPT-Image-1 Access
 * Periodically checks if gpt-image-1 becomes available after verification
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function checkGPTImage1Access() {
  const prompt = "Test image generation";
  
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'gpt-image-1',
      prompt: prompt,
      size: '1024x1024'
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return { success: true, data: response.data };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message,
      status: error.response?.status
    };
  }
}

async function monitorAccess() {
  console.log('🔍 Monitoring GPT-Image-1 Access...');
  console.log('=' .repeat(50));
  console.log('⏰ Checking every 2 minutes for up to 20 minutes');
  console.log('🛑 Press Ctrl+C to stop monitoring');
  console.log('');

  let attempts = 0;
  const maxAttempts = 10; // 20 minutes total
  
  const checkInterval = setInterval(async () => {
    attempts++;
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`🕐 [${timestamp}] Attempt ${attempts}/${maxAttempts} - Checking gpt-image-1...`);
    
    const result = await checkGPTImage1Access();
    
    if (result.success) {
      console.log('');
      console.log('🎉 SUCCESS! GPT-Image-1 is now available!');
      console.log('✅ Your organization verification has propagated');
      console.log('🚀 You can now use model: "gpt-image-1" in your API calls');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Update your DrisyaEnhance platform to use gpt-image-1');
      console.log('   2. Test with your jewelry enhancement prompts');
      console.log('   3. Compare results with dall-e-3');
      clearInterval(checkInterval);
      return;
    }
    
    if (result.status === 403) {
      console.log(`   ⏳ Still waiting for verification to propagate...`);
    } else {
      console.log(`   ❌ Unexpected error: ${result.error}`);
    }
    
    if (attempts >= maxAttempts) {
      console.log('');
      console.log('⏰ Monitoring timeout reached (20 minutes)');
      console.log('💡 Suggestions:');
      console.log('   - Double-check your organization verification status');
      console.log('   - Contact OpenAI support if verification is complete but access still denied');
      console.log('   - Continue using dall-e-3 which works perfectly');
      clearInterval(checkInterval);
    }
    
  }, 120000); // Check every 2 minutes
  
  // Initial check
  console.log('🕐 [Initial] Checking gpt-image-1 access...');
  const initialResult = await checkGPTImage1Access();
  
  if (initialResult.success) {
    console.log('🎉 GPT-Image-1 is already available!');
    clearInterval(checkInterval);
  } else {
    console.log(`   ⏳ Not yet available: ${initialResult.error.substring(0, 80)}...`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Monitoring stopped by user');
  process.exit(0);
});

monitorAccess().catch(console.error);
