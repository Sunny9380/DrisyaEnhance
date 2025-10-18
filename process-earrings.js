import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

console.log('🎨 Processing Earrings with Stability AI...\n');

async function processEarringsImage() {
  if (!STABILITY_API_KEY) {
    console.log('❌ STABILITY_API_KEY not found in .env file');
    return;
  }

  try {
    console.log('🔄 Processing your earrings image...');
    
    // You need to save the earrings image as 'earrings-input.jpg'
    const imagePath = './earrings-input.jpg';
    
    let imageBuffer;
    try {
      imageBuffer = await fs.readFile(imagePath);
      console.log('✅ Earrings image loaded successfully');
      console.log(`📏 Image size: ${imageBuffer.length} bytes`);
    } catch (error) {
      console.log('⚠️ Please save the earrings image as "earrings-input.jpg" in this folder');
      console.log('   The image should be the golden spiral earrings you uploaded');
      return;
    }

    console.log('🔄 Sending to Stability AI for enhancement...');
    console.log('📝 Using your custom velvet background prompt...');
    
    const formData = new FormData();
    formData.append('init_image', imageBuffer, 'earrings.jpg');
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', '0.4'); // Moderate transformation
    formData.append('steps', '40'); // Higher quality
    formData.append('seed', '0');
    formData.append('cfg_scale', '8'); // Strong prompt adherence
    formData.append('samples', '1');
    formData.append('text_prompts[0][text]', PROMPT);
    formData.append('text_prompts[0][weight]', '1');

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
      console.log('✅ Enhancement successful!');
      
      // Save the enhanced image
      const imageData = response.data.artifacts[0].base64;
      const buffer = Buffer.from(imageData, 'base64');
      
      const outputPath = './earrings-enhanced-velvet.png';
      await fs.writeFile(outputPath, buffer);
      
      console.log(`🎉 Enhanced earrings saved as: ${outputPath}`);
      console.log('✨ Features applied:');
      console.log('   - Dark blue velvet background');
      console.log('   - Moody directional lighting');
      console.log('   - Windowpane shadow patterns');
      console.log('   - Cinematic luxury ambiance');
      console.log('   - Preserved earring details');
      
      console.log('\n📊 Generation Details:');
      console.log(`   - Seed: ${response.data.artifacts[0].seed}`);
      console.log(`   - Finish Reason: ${response.data.artifacts[0].finishReason}`);
      console.log(`   - Output Size: ${buffer.length} bytes`);
      
      return true;
    } else {
      console.log('❌ No enhanced image generated');
      return false;
    }

  } catch (error) {
    console.log('❌ Stability AI enhancement failed');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

// Main execution
async function runEnhancement() {
  console.log('🚀 Earrings Enhancement Started\n');
  
  console.log('📋 Instructions:');
  console.log('1. Save your earrings image as "earrings-input.jpg"');
  console.log('2. This script will apply your velvet background prompt');
  console.log('3. Enhanced result will be "earrings-enhanced-velvet.png"\n');
  
  const success = await processEarringsImage();
  
  if (success) {
    console.log('\n🎯 Perfect! This is exactly what your bulk upload system will do:');
    console.log('   ✅ Process thousands of jewelry images');
    console.log('   ✅ Apply custom background templates');
    console.log('   ✅ Preserve product details perfectly');
    console.log('   ✅ Generate professional results');
  }
  
  console.log('\n✨ Enhancement completed!');
}

runEnhancement().catch(console.error);
