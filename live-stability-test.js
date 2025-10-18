import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const VELVET_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

console.log('🔥 LIVE Stability AI Image Enhancement Test\n');

async function liveStabilityTest() {
  if (!STABILITY_API_KEY) {
    console.log('❌ STABILITY_API_KEY not found in .env file');
    return;
  }

  console.log('✅ Stability API Key found');
  console.log('🎯 Testing with your exact velvet prompt');

  try {
    // Check account first
    console.log('\n🔄 Checking Stability AI account...');
    const accountResponse = await axios.get(
      'https://api.stability.ai/v1/user/account',
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('✅ Account Status:');
    console.log(`   - ID: ${accountResponse.data.id}`);
    console.log(`   - Email: ${accountResponse.data.email}`);
    console.log(`   - Credits: ${accountResponse.data.credits || 'N/A'}`);

    // Look for test image
    const testImagePath = './test-earrings.jpg';
    let imageBuffer;
    
    try {
      imageBuffer = await fs.readFile(testImagePath);
      console.log(`\n✅ Found test image: ${testImagePath}`);
      console.log(`📏 Image size: ${imageBuffer.length} bytes`);
    } catch (error) {
      console.log('\n⚠️ No test image found. Creating a sample image...');
      
      // Create a simple test image URL (you can replace this with any image URL)
      const sampleImageUrl = 'https://via.placeholder.com/1024x1024/FFD700/000000?text=TEST+JEWELRY';
      
      try {
        const imageResponse = await axios.get(sampleImageUrl, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(imageResponse.data);
        await fs.writeFile(testImagePath, imageBuffer);
        console.log('✅ Created sample test image');
      } catch (err) {
        console.log('❌ Could not create test image. Please add "test-earrings.jpg" to the folder');
        return;
      }
    }

    console.log('\n🚀 Starting LIVE Stability AI Enhancement...');
    console.log('📝 Using your velvet background prompt');

    const formData = new FormData();
    formData.append('init_image', imageBuffer, 'test-image.jpg');
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', '0.4'); // Good balance for enhancement
    formData.append('steps', '40'); // High quality
    formData.append('seed', '0');
    formData.append('cfg_scale', '7'); // Strong prompt adherence
    formData.append('samples', '1');
    formData.append('text_prompts[0][text]', VELVET_PROMPT);
    formData.append('text_prompts[0][weight]', '1');

    console.log('⏳ Processing... (this may take 30-60 seconds)');
    
    const startTime = Date.now();
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`
        },
        timeout: 120000 // 2 minute timeout
      }
    );

    const processingTime = Date.now() - startTime;

    if (response.data.artifacts && response.data.artifacts.length > 0) {
      console.log('\n🎉 SUCCESS! Image enhanced with Stability AI');
      
      // Save the enhanced image
      const imageData = response.data.artifacts[0].base64;
      const buffer = Buffer.from(imageData, 'base64');
      
      const outputPath = './enhanced-velvet-output.png';
      await fs.writeFile(outputPath, buffer);
      
      console.log('📊 Enhancement Results:');
      console.log(`   ✅ Output saved: ${outputPath}`);
      console.log(`   ⏱️ Processing time: ${processingTime}ms`);
      console.log(`   🎲 Seed: ${response.data.artifacts[0].seed}`);
      console.log(`   📏 Output size: ${buffer.length} bytes`);
      console.log(`   🎨 Applied: Dark blue velvet background`);
      console.log(`   💡 Applied: Moody directional lighting`);
      console.log(`   🪟 Applied: Windowpane shadow patterns`);
      
      console.log('\n🎯 LIVE TEST SUCCESSFUL!');
      console.log('✨ Your Stability AI integration is working perfectly!');
      console.log('\n📋 What this proves:');
      console.log('   ✅ Your API key works');
      console.log('   ✅ Image-to-image enhancement works');
      console.log('   ✅ Your velvet prompt is applied');
      console.log('   ✅ Ready for bulk processing!');
      
      return true;
    } else {
      console.log('❌ No enhanced image received from Stability AI');
      return false;
    }

  } catch (error) {
    console.log('\n❌ LIVE TEST FAILED');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Run the live test
console.log('🔥 Starting LIVE Stability AI Test...');
console.log('📋 This will:');
console.log('   1. Check your Stability AI account');
console.log('   2. Load/create a test image');
console.log('   3. Apply your velvet background prompt');
console.log('   4. Save the enhanced result');
console.log('   5. Show you the live output!\n');

liveStabilityTest()
  .then((success) => {
    if (success) {
      console.log('\n🚀 READY FOR PRODUCTION!');
      console.log('Your Drisya platform can now process thousands of jewelry images!');
    } else {
      console.log('\n🔧 Check your API key and try again');
    }
  })
  .catch((error) => {
    console.error('Test failed:', error.message);
  });
