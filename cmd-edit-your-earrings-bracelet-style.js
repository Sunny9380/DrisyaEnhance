#!/usr/bin/env node

/**
 * GPT-Image-1 Image Editing: Transform your-earrings.png with Men's Bracelet Styling
 * Apply beige fabric background and cream wooden surface to your existing earrings
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function editYourEarringsWithBraceletStyle() {
  console.log('🎨 GPT-Image-1 Editing: your-earrings.png → Bracelet Style');
  console.log('=' .repeat(65));
  
  // Check API key
  if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log('🔑 Key:', OPENAI_API_KEY.substring(0, 20) + '...');

  // Transform your earrings with the men's bracelet styling
  const prompt = "Transform this jewelry image to have a hyper-realistic product photograph styling with a soft beige-brown fabric background and a light cream wooden surface. Position the jewelry diagonally across the scene. Add a pale peach rose with soft petals in the upper left corner for a decorative touch. Apply warm, soft, and diffused lighting that casts gentle shadows and highlights the metallic shine and texture of the jewelry. Ensure the jewelry design, link pattern, clasp details, colors, and metallic properties remain exactly the same with no changes or alterations to the jewelry itself. Only modify the background, surface, and lighting. Make the image size 1080 X 1080px.";

  const imagePath = 'your-earrings.png';
  
  console.log('');
  console.log('🖼️ Input Image:', imagePath);
  console.log('🎯 Style: Men\'s Bracelet with Beige Fabric & Cream Wood');
  console.log('🤖 Model: gpt-image-1 (Image Editing)');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Error: Image not found: ${imagePath}`);
      console.log('💡 Make sure your-earrings.png is in the current directory');
      process.exit(1);
    }

    console.log('✅ Image file found');
    const stats = fs.statSync(imagePath);
    console.log(`📁 Original size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    console.log('🔄 Applying bracelet styling with GPT-Image-1...');
    console.log('⏳ This may take 30-60 seconds...');
    
    const startTime = Date.now();
    
    // Create form data for image editing
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('prompt', prompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');
    formData.append('n', '1');

    const response = await axios.post('https://api.openai.com/v1/images/edits', formData, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      timeout: 180000 // 3 minutes for image editing
    });

    const processingTime = Date.now() - startTime;

    if (response.data.data && response.data.data.length > 0) {
      const imageData = response.data.data[0];
      
      console.log('✅ GPT-IMAGE-1 EDITING SUCCESS!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   ⏱️ Processing Time: ${(processingTime / 1000).toFixed(1)}s`);
      console.log(`   💰 Cost: $0.04 (₹3.40)`);
      console.log('');

      // Save the edited image
      if (imageData.b64_json) {
        console.log('💾 Saving your earrings with bracelet styling...');
        
        const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
        const timestamp = Date.now();
        const filename = `your-earrings-bracelet-style-${timestamp}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageBuffer);
        
        console.log(`✅ Styled earrings saved: ${filepath}`);
        console.log(`📁 File size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Also save with a simple name for easy access
        const simpleName = 'your-earrings-beige-fabric-style.png';
        await fs.promises.writeFile(simpleName, imageBuffer);
        console.log(`✅ Copy saved as: ${simpleName}`);
        
      } else if (imageData.url) {
        console.log('📥 Downloading styled image from URL...');
        
        const imageResponse = await axios.get(imageData.url, { responseType: 'arraybuffer' });
        const timestamp = Date.now();
        const filename = `your-earrings-bracelet-style-${timestamp}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageResponse.data);
        
        console.log(`✅ Styled earrings saved: ${filepath}`);
        console.log(`📁 File size: ${(imageResponse.data.length / 1024 / 1024).toFixed(2)} MB`);
        
      } else {
        console.log('⚠️ No image data received');
      }

      // Show usage statistics if available
      if (response.data.usage) {
        console.log('');
        console.log('📈 Token Usage:');
        console.log(`   Input: ${response.data.usage.input_tokens}`);
        console.log(`   Output: ${response.data.usage.output_tokens}`);
        console.log(`   Total: ${response.data.usage.total_tokens}`);
      }

      console.log('');
      console.log('🎉 Styling Complete!');
      console.log('✨ Your earrings now have luxurious beige fabric background');
      console.log('🎯 Perfect for men\'s bracelet style product photography');
      console.log('🌟 Warm lighting with cream wooden surface and peach rose accent');
      
    } else {
      console.error('❌ No image data received from GPT-Image-1');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ GPT-Image-1 Editing Failed:');
    console.error(`   Error: ${error.response?.data?.error?.message || error.message}`);
    console.error(`   Status: ${error.response?.status || 'Unknown'}`);
    
    if (error.response?.data) {
      console.log('');
      console.log('📋 Full Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    // Specific error handling
    if (error.response?.status === 400) {
      console.log('');
      console.log('💡 Image Format Issue:');
      console.log('   - Make sure your-earrings.png is a valid PNG file');
      console.log('   - Image should be less than 4MB');
      console.log('   - Try converting to PNG format if needed');
    } else if (error.response?.status === 403) {
      console.log('');
      console.log('💡 Organization Verification Required:');
      console.log('   - Your organization needs to be verified for GPT-Image-1');
      console.log('   - Go to: https://platform.openai.com/settings/organization/general');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Editing interrupted by user');
  process.exit(0);
});

// Run the editing
editYourEarringsWithBraceletStyle().catch((error) => {
  console.error('💥 Unexpected error:', error.message);
  process.exit(1);
});
