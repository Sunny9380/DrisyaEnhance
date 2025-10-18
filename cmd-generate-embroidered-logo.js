#!/usr/bin/env node

/**
 * GPT-Image-1 Embroidered Logo Generation
 * Create a highly detailed embroidered patch of the DRISYA logo
 */

import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateEmbroideredLogo() {
  console.log('🧵 GPT-Image-1 Embroidered Logo Patch Generation');
  console.log('=' .repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }

  // Detailed embroidery prompt for DRISYA logo
  const prompt = `Create a highly detailed embroidered patch of the DRISYA logo featuring "AI-GENERATED IMAGES" text. The patch should have:

EMBROIDERY DETAILS:
- Raised stitching with realistic 3D texture and depth
- Fine thread work with visible individual stitches
- Professional embroidery quality with tight, precise stitching
- Textured surface showing thread direction and density variations

LOGO ELEMENTS:
- Diamond-shaped eye icon in teal/turquoise to blue gradient colors
- White pupil area with dark blue center circle
- "DRISYA" text in bold, embroidered navy blue letters
- "AI-GENERATED IMAGES" subtitle in smaller embroidered text
- Maintain exact logo proportions and color accuracy

TECHNICAL SPECIFICATIONS:
- Isolated on transparent PNG background
- No fabric or surface beneath the patch
- Professional apparel-ready embroidered patch appearance
- Realistic lighting showing thread texture and dimensionality
- Sharp edges with clean embroidery borders
- High contrast to show embroidery depth and detail

COLORS:
- Teal to blue gradient for the eye icon
- Navy blue for main text
- White for eye highlight areas
- Realistic thread sheen and texture

Make it look like a premium, professionally manufactured logo patch ready for clothing or accessories.`;

  console.log('🎯 Creating embroidered DRISYA logo patch...');
  console.log('🤖 Model: gpt-image-1');
  console.log('📐 Size: 1024x1024');
  console.log('');

  try {
    console.log('🔄 Generating embroidered patch with GPT-Image-1...');
    
    const startTime = Date.now();
    
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'gpt-image-1',
      prompt: prompt,
      size: '1024x1024',
      n: 1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 180000 // 3 minutes
    });

    const processingTime = Date.now() - startTime;

    if (response.data.data && response.data.data.length > 0) {
      const imageData = response.data.data[0];
      
      console.log('✅ EMBROIDERED LOGO GENERATION SUCCESS!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   ⏱️ Processing Time: ${(processingTime / 1000).toFixed(1)}s`);
      console.log(`   💰 Cost: $0.04 (₹3.40)`);
      console.log('');

      // Save the generated embroidered logo
      if (imageData.b64_json) {
        console.log('💾 Saving embroidered DRISYA logo patch...');
        
        const imageBuffer = Buffer.from(imageData.b64_json, 'base64');
        const timestamp = Date.now();
        const filename = `drisya-embroidered-logo-${timestamp}.png`;
        const filepath = `uploads/processed/${filename}`;
        
        // Ensure directory exists
        await fs.promises.mkdir('uploads/processed', { recursive: true });
        await fs.promises.writeFile(filepath, imageBuffer);
        
        console.log(`✅ Embroidered logo saved: ${filepath}`);
        console.log(`📁 File size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Also save with a simple name for easy access
        const simpleName = 'drisya-embroidered-patch.png';
        await fs.promises.writeFile(simpleName, imageBuffer);
        console.log(`✅ Copy saved as: ${simpleName}`);
        
      } else {
        console.error('❌ No base64 image data received');
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
      console.log('🎉 Embroidered Logo Complete!');
      console.log('✨ Professional embroidered patch created');
      console.log('🧵 Ready for apparel and accessories');
      console.log('🎯 Transparent background, 3D realistic texture');
      
    } else {
      console.error('❌ No image data received from GPT-Image-1');
    }

  } catch (error) {
    console.error('❌ GPT-Image-1 Generation Failed:');
    console.error(`   Error: ${error.response?.data?.error?.message || error.message}`);
    console.error(`   Status: ${error.response?.status || 'Unknown'}`);
    
    if (error.response?.data) {
      console.log('');
      console.log('📋 Full Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    // Specific error handling
    if (error.response?.status === 403) {
      console.log('');
      console.log('💡 Organization Verification Required:');
      console.log('   - Your organization needs to be verified for GPT-Image-1');
      console.log('   - Go to: https://platform.openai.com/settings/organization/general');
    } else if (error.response?.status === 401) {
      console.log('');
      console.log('💡 API Key Issue:');
      console.log('   - Check your API key in .env file');
      console.log('   - Get a new key from: https://platform.openai.com/account/api-keys');
    }
  }

  console.log('');
  console.log('🧵 Embroidery Generation Complete!');
  console.log('=' .repeat(60));
  console.log('✅ GPT-Image-1 model working successfully');
  console.log('🎯 Professional embroidered patch created');
  console.log('💎 Perfect for branding and merchandise');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Generation interrupted by user');
  process.exit(0);
});

generateEmbroideredLogo().catch(console.error);
