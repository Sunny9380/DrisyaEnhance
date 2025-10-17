import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Test configuration
const TEST_CONFIG = {
  replicate: {
    token: process.env.REPLICATE_API_TOKEN,
    url: 'https://api.replicate.com/v1/predictions'
  },
  stability: {
    key: process.env.STABILITY_API_KEY,
    url: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image'
  }
};

console.log('🧪 Testing AI API Connections...\n');

// Test Replicate API
async function testReplicateConnection() {
  console.log('🔄 Testing Replicate API...');
  
  if (!TEST_CONFIG.replicate.token || TEST_CONFIG.replicate.token === 'replicate_image_to_image') {
    console.log('❌ Replicate: Invalid API token (placeholder detected)');
    console.log('   Please get a real token from: https://replicate.com/account/api-tokens\n');
    return false;
  }

  try {
    // Test with a simple text-to-image model first
    const response = await axios.post(
      TEST_CONFIG.replicate.url,
      {
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // SDXL model
        input: {
          prompt: "a beautiful sunset over mountains",
          num_outputs: 1,
          width: 512,
          height: 512
        }
      },
      {
        headers: {
          'Authorization': `Token ${TEST_CONFIG.replicate.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 201) {
      console.log('✅ Replicate: Connection successful!');
      console.log(`   Prediction ID: ${response.data.id}`);
      console.log(`   Status: ${response.data.status}`);
      
      // Poll for result (optional)
      if (response.data.status === 'starting' || response.data.status === 'processing') {
        console.log('   ⏳ Prediction is processing... (this may take a minute)');
        const result = await pollReplicateResult(response.data.id);
        if (result) {
          console.log('   🎉 Image generation completed successfully!');
        }
      }
      console.log('');
      return true;
    }
  } catch (error) {
    console.log('❌ Replicate: Connection failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.detail || error.response.data?.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

// Poll Replicate result
async function pollReplicateResult(predictionId, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${TEST_CONFIG.replicate.token}`
          }
        }
      );

      const status = response.data.status;
      console.log(`   Status check ${i + 1}: ${status}`);

      if (status === 'succeeded') {
        return response.data.output;
      } else if (status === 'failed') {
        console.log(`   ❌ Prediction failed: ${response.data.error}`);
        return null;
      }

      // Wait 3 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`   ⚠️ Status check failed: ${error.message}`);
    }
  }
  
  console.log('   ⏰ Polling timeout - prediction may still be processing');
  return null;
}

// Test Stability AI
async function testStabilityConnection() {
  console.log('🔄 Testing Stability AI...');
  
  if (!TEST_CONFIG.stability.key || TEST_CONFIG.stability.key.length < 10) {
    console.log('❌ Stability AI: Invalid API key');
    console.log('   Please get a real key from: https://platform.stability.ai/account/keys\n');
    return false;
  }

  try {
    // Test with account info endpoint first (simpler test)
    const response = await axios.get(
      'https://api.stability.ai/v1/user/account',
      {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.stability.key}`,
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log('✅ Stability AI: Connection successful!');
      console.log(`   Account ID: ${response.data.id}`);
      console.log(`   Credits: ${response.data.credits || 'N/A'}`);
      console.log('');
      return true;
    }
  } catch (error) {
    console.log('❌ Stability AI: Connection failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
    return false;
  }
}

// Test image-to-image with sample image
async function testImageToImage() {
  console.log('🖼️ Testing Image-to-Image Generation...');
  
  // Create a simple test image (base64 encoded 1x1 pixel)
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  if (TEST_CONFIG.replicate.token && TEST_CONFIG.replicate.token !== 'replicate_image_to_image') {
    try {
      console.log('   🔄 Testing Replicate image-to-image...');
      
      const response = await axios.post(
        TEST_CONFIG.replicate.url,
        {
          version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b", // ESRGAN
          input: {
            image: testImageBase64,
            prompt: "enhance this image, make it beautiful and detailed",
            num_outputs: 1
          }
        },
        {
          headers: {
            'Authorization': `Token ${TEST_CONFIG.replicate.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        console.log('   ✅ Replicate image-to-image: Request successful!');
        console.log(`   Prediction ID: ${response.data.id}`);
      }
    } catch (error) {
      console.log('   ❌ Replicate image-to-image failed');
      console.log(`   Error: ${error.response?.data?.detail || error.message}`);
    }
  }
  
  console.log('');
}

// Main test function
async function runTests() {
  console.log('🚀 AI API Connection Test Started\n');
  console.log('Configuration:');
  console.log(`   Replicate Token: ${TEST_CONFIG.replicate.token ? '✓ Present' : '❌ Missing'}`);
  console.log(`   Stability Key: ${TEST_CONFIG.stability.key ? '✓ Present' : '❌ Missing'}`);
  console.log('');

  const results = {
    replicate: false,
    stability: false
  };

  // Test connections
  results.replicate = await testReplicateConnection();
  results.stability = await testStabilityConnection();

  // Test image-to-image if any service works
  if (results.replicate || results.stability) {
    await testImageToImage();
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`   Replicate API: ${results.replicate ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Stability AI: ${results.stability ? '✅ Working' : '❌ Failed'}`);
  
  if (results.replicate || results.stability) {
    console.log('\n🎉 At least one AI service is working! Your bulk upload feature should work.');
  } else {
    console.log('\n⚠️ No AI services are working. Please check your API keys.');
    console.log('\nNext steps:');
    console.log('1. Get valid API keys from:');
    console.log('   - Replicate: https://replicate.com/account/api-tokens');
    console.log('   - Stability AI: https://platform.stability.ai/account/keys');
    console.log('2. Update your .env file with the real keys');
    console.log('3. Run this test again');
  }
  
  console.log('\n✨ Test completed!');
}

// Run the tests
runTests().catch(console.error);
