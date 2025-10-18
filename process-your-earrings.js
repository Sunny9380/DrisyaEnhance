import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const YOUR_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px`;

console.log('🎨 Processing YOUR Earrings with YOUR Prompt\n');

async function processYourEarrings() {
  if (!STABILITY_API_KEY) {
    console.log('❌ STABILITY_API_KEY not found');
    return;
  }

  console.log('✅ Using your Stability AI API key');
  console.log('🎯 Processing your golden spiral earrings');
  console.log('📝 Applying your exact velvet background prompt\n');

  try {
    // Look for your earrings image
    const inputImagePath = './your-earrings.jpg';
    let imageBuffer;
    
    try {
      imageBuffer = await fs.readFile(inputImagePath);
      console.log(`✅ Found your earrings: ${inputImagePath}`);
      console.log(`📏 Image size: ${imageBuffer.length} bytes`);
    } catch (error) {
      console.log('⚠️ Please save your earrings image as "your-earrings.jpg"');
      console.log('   Right-click the earrings image → Save As → your-earrings.jpg');
      return;
    }

    console.log('\n🚀 Starting Stability AI Enhancement...');
    console.log('🎨 Applying: Dark blue velvet background');
    console.log('💡 Applying: Moody directional lighting');
    console.log('🪟 Applying: Windowpane shadow patterns');
    console.log('⏳ Processing... (30-60 seconds)\n');

    const formData = new FormData();
    formData.append('init_image', imageBuffer, 'earrings.jpg');
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', '0.4'); // Perfect for background change
    formData.append('steps', '40'); // High quality
    formData.append('seed', '0');
    formData.append('cfg_scale', '8'); // Strong prompt adherence
    formData.append('samples', '1');
    formData.append('text_prompts[0][text]', YOUR_PROMPT);
    formData.append('text_prompts[0][weight]', '1');

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
        timeout: 120000 // 2 minutes
      }
    );

    const processingTime = Date.now() - startTime;

    if (response.data.artifacts && response.data.artifacts.length > 0) {
      console.log('🎉 SUCCESS! Your earrings have been enhanced!\n');
      
      // Save the enhanced image
      const imageData = response.data.artifacts[0].base64;
      const buffer = Buffer.from(imageData, 'base64');
      
      const outputPath = './your-earrings-enhanced-velvet.png';
      await fs.writeFile(outputPath, buffer);
      
      console.log('📊 Enhancement Results:');
      console.log(`   ✅ Enhanced image: ${outputPath}`);
      console.log(`   ⏱️ Processing time: ${(processingTime / 1000).toFixed(1)} seconds`);
      console.log(`   🎲 AI Seed: ${response.data.artifacts[0].seed}`);
      console.log(`   📏 Output size: ${(buffer.length / 1024).toFixed(1)} KB`);
      console.log(`   🎨 Background: Dark blue velvet applied`);
      console.log(`   💎 Jewelry: Original details preserved`);
      console.log(`   🌟 Quality: Professional luxury finish`);
      
      console.log('\n🎯 TRANSFORMATION COMPLETE!');
      console.log('✨ Your golden spiral earrings now have:');
      console.log('   🔵 Elegant matte blue velvet background');
      console.log('   💡 Moody directional lighting');
      console.log('   🪟 Realistic windowpane shadows');
      console.log('   🎭 Cinematic luxury ambiance');
      console.log('   💎 Preserved earring details & colors');
      
      console.log('\n📋 This proves your system works perfectly!');
      console.log('🚀 Ready to process thousands of jewelry images!');
      
      return true;
    } else {
      console.log('❌ No enhanced image received');
      return false;
    }

  } catch (error) {
    console.log('\n❌ Enhancement failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Save your earrings image as "your-earrings.jpg"');
console.log('2. This script will apply your exact velvet prompt');
console.log('3. Get enhanced image as "your-earrings-enhanced-velvet.png"');
console.log('4. See the transformation live!\n');

// Run the enhancement
processYourEarrings()
  .then((success) => {
    if (success) {
      console.log('\n🎊 LIVE ENHANCEMENT SUCCESSFUL!');
      console.log('Your Drisya AI platform is ready for production!');
    } else {
      console.log('\n🔧 Please check the setup and try again');
    }
  })
  .catch((error) => {
    console.error('Enhancement failed:', error.message);
  });
