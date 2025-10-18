#!/usr/bin/env node

/**
 * Simple Image Converter for OpenAI
 * Converts JPG to PNG and ensures it's under 4MB
 */

import sharp from 'sharp';
import fs from 'fs';

async function convertEarringsImage() {
  const inputFile = './your-earrings.jpg';
  const outputFile = './your-earrings.png';
  
  try {
    console.log('🔄 Converting earrings image to PNG...');
    
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ File not found: ${inputFile}`);
      console.log('Please make sure your earrings image is saved as "your-earrings.jpg"');
      return false;
    }

    // Get file size
    const stats = fs.statSync(inputFile);
    console.log(`📁 Input size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Convert to PNG with RGBA format (required by OpenAI)
    await sharp(inputFile)
      .png({ quality: 90 })
      .ensureAlpha() // Add alpha channel for RGBA format
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFile(outputFile);

    // Check output size
    const outputStats = fs.statSync(outputFile);
    const outputSizeMB = outputStats.size / 1024 / 1024;
    console.log(`📁 Output size: ${outputSizeMB.toFixed(2)} MB`);

    if (outputSizeMB > 4) {
      console.log('⚠️ Still too large, compressing more...');
      await sharp(inputFile)
        .png({ quality: 70 })
        .ensureAlpha() // Add alpha channel for RGBA format
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toFile(outputFile);
        
      const finalStats = fs.statSync(outputFile);
      console.log(`📁 Final size: ${(finalStats.size / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log(`✅ Successfully converted to: ${outputFile}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`);
    return false;
  }
}

convertEarringsImage();
