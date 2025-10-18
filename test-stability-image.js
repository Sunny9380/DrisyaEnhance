import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

console.log('🧪 Testing Stability AI Image-to-Image Generation...\n');

async function testStabilityImageToImage() {
  if (!STABILITY_API_KEY) {
    console.log('❌ STABILITY_API_KEY not found in .env file');
    return;
  }

  try {
    console.log('🔄 Preparing image data...');
    
    // You'll need to save the uploaded earrings image as 'test-earrings.jpg' in the project folder
    // For now, let's create a placeholder that you can replace
    const imagePath = './test-earrings.jpg';
    
    let imageBuffer;
    try {
      imageBuffer = await fs.readFile(imagePath);
      console.log('✅ Image loaded successfully');
    } catch (error) {
      console.log('⚠️ Please save your earrings image as "test-earrings.jpg" in the project folder');
      console.log('   Then run this script again');
      return;
    }

    console.log('🔄 Sending request to Stability AI...');
    console.log(`📝 Prompt: ${PROMPT.substring(0, 100)}...`);
    console.log(`📏 Image size: ${imageBuffer.length} bytes`);
    
    const formData = new FormData();
    formData.append('init_image', imageBuffer, 'earrings.jpg');
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', '0.35'); // Keep original image structure
    formData.append('steps', '30');
    formData.append('seed', '0');
    formData.append('cfg_scale', '7');
    formData.append('samples', '1');
    formData.append('text_prompts[0][text]', PROMPT);
    formData.append('text_prompts[0][weight]', '1');
    // Note: width/height cannot be set for image-to-image, output will match input dimensions

    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`
        }
      }
    );

    if (response.data.artifacts && response.data.artifacts.length > 0) {
      console.log('✅ Image generation successful!');
      
      // Save the generated image
      const imageData = response.data.artifacts[0].base64;
      const buffer = Buffer.from(imageData, 'base64');
      
      const outputPath = './enhanced-earrings.png';
      await fs.writeFile(outputPath, buffer);
      
      console.log(`🎉 Enhanced image saved as: ${outputPath}`);
      console.log('📊 Generation Details:');
      console.log(`   - Seed: ${response.data.artifacts[0].seed}`);
      console.log(`   - Finish Reason: ${response.data.artifacts[0].finishReason}`);
      console.log(`   - Size: ${buffer.length} bytes`);
      
      return true;
    } else {
      console.log('❌ No image generated');
      return false;
    }

  } catch (error) {
    console.log('❌ Stability AI request failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Test account info first
async function testAccountInfo() {
  try {
    console.log('🔄 Checking Stability AI account...');
    
    const response = await axios.get(
      'https://api.stability.ai/v1/user/account',
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('✅ Account Info:');
    console.log(`   - ID: ${response.data.id}`);
    console.log(`   - Credits: ${response.data.credits || 'N/A'}`);
    console.log(`   - Email: ${response.data.email || 'N/A'}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.log('❌ Account check failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.message || 'Unknown error'}`);
    }
    return false;
  }
}

// Main execution
async function runTest() {
  console.log('🚀 Stability AI Test Started\n');
  
  const accountOk = await testAccountInfo();
  
  if (accountOk) {
    console.log('📋 Instructions:');
    console.log('1. Save your earrings image as "test-earrings.jpg" in this folder');
    console.log('2. The script will enhance it with your custom prompt');
    console.log('3. Output will be saved as "enhanced-earrings.png"\n');
    
    await testStabilityImageToImage();
  }
  
  console.log('\n✨ Test completed!');
}

runTest().catch(console.error);
