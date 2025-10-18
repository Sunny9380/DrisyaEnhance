#!/usr/bin/env node

/**
 * Fix RGBA Format for OpenAI
 * Ensures proper RGBA format with alpha channel
 */

import sharp from 'sharp';
import fs from 'fs';

async function fixRGBAFormat() {
  const inputFile = './your-earrings.jpg';
  const outputFile = './your-earrings.png';
  
  try {
    console.log('🔄 Converting to proper RGBA format for OpenAI...');
    
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ File not found: ${inputFile}`);
      return false;
    }

    // Convert to RGBA PNG with proper alpha channel
    await sharp(inputFile)
      .png()
      .toColourspace('srgb')
      .ensureAlpha(1.0) // Ensure full opacity alpha channel
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(outputFile);

    console.log(`✅ Converted to RGBA PNG: ${outputFile}`);
    
    // Verify the conversion
    const image = sharp(outputFile);
    const metadata = await image.metadata();
    
    console.log(`📊 Verification:`);
    console.log(`  Format: ${metadata.format}`);
    console.log(`  Channels: ${metadata.channels}`);
    console.log(`  Has Alpha: ${metadata.hasAlpha}`);
    console.log(`  Color Space: ${metadata.space}`);
    
    const stats = fs.statSync(outputFile);
    console.log(`  File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (metadata.format === 'png' && metadata.hasAlpha && metadata.channels === 4) {
      console.log(`🎉 SUCCESS: Ready for OpenAI (RGBA format)!`);
      return true;
    } else {
      console.log(`❌ FAILED: Still not in proper RGBA format`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`);
    return false;
  }
}

fixRGBAFormat();
