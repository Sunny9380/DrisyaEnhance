#!/usr/bin/env node

/**
 * Convert JPG to PNG for OpenAI compatibility
 * Also resize if needed to keep under 4MB
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function convertImageForOpenAI(inputPath, outputPath) {
  try {
    console.log(`🔄 Converting ${inputPath} to PNG format...`);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Get input file stats
    const inputStats = fs.statSync(inputPath);
    console.log(`📁 Input file size: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);

    // Convert to PNG and resize if needed
    let image = sharp(inputPath);
    
    // Get image metadata
    const metadata = await image.metadata();
    console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);
    
    // Resize if image is too large (keep under 4MB)
    let width = metadata.width;
    let height = metadata.height;
    
    // If image is very large, resize to reasonable dimensions
    if (width > 2048 || height > 2048) {
      const maxDimension = 2048;
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      console.log(`📏 Resizing to: ${width}x${height}`);
      image = image.resize(width, height);
    }

    // Convert to PNG with good quality
    await image
      .png({ quality: 90, compressionLevel: 6 })
      .toFile(outputPath);

    // Check output file size
    const outputStats = fs.statSync(outputPath);
    const outputSizeMB = outputStats.size / 1024 / 1024;
    console.log(`📁 Output file size: ${outputSizeMB.toFixed(2)} MB`);

    if (outputSizeMB > 4) {
      console.log(`⚠️ File still too large, compressing further...`);
      
      // Try with lower quality and smaller size
      image = sharp(inputPath);
      if (width > 1024 || height > 1024) {
        const maxDimension = 1024;
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        image = image.resize(width, height);
      }
      
      await image
        .png({ quality: 70, compressionLevel: 9 })
        .toFile(outputPath);
        
      const finalStats = fs.statSync(outputPath);
      const finalSizeMB = finalStats.size / 1024 / 1024;
      console.log(`📁 Final file size: ${finalSizeMB.toFixed(2)} MB`);
    }

    console.log(`✅ Successfully converted to: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  const inputFile = './your-earrings.jpg';
  const outputFile = './your-earrings.png';
  
  try {
    await convertImageForOpenAI(inputFile, outputFile);
    console.log('\n🎉 Image conversion complete!');
    console.log('Now you can run: npm run test:earrings');
  } catch (error) {
    console.error('\n❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertImageForOpenAI };
