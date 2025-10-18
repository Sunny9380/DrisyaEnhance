#!/usr/bin/env node

/**
 * Test Image Format for OpenAI Compatibility
 */

import sharp from 'sharp';
import fs from 'fs';

async function testImageFormat() {
  const files = ['./your-earrings.jpg', './your-earrings.png'];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`\n📁 Testing: ${file}`);
      
      try {
        const image = sharp(file);
        const metadata = await image.metadata();
        
        console.log(`  Format: ${metadata.format}`);
        console.log(`  Width: ${metadata.width}px`);
        console.log(`  Height: ${metadata.height}px`);
        console.log(`  Channels: ${metadata.channels}`);
        console.log(`  Color Space: ${metadata.space}`);
        console.log(`  Has Alpha: ${metadata.hasAlpha}`);
        
        const stats = fs.statSync(file);
        console.log(`  File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Check if it meets OpenAI requirements
        const isValidFormat = metadata.format === 'png';
        const isValidSize = stats.size < 4 * 1024 * 1024; // 4MB
        const hasAlpha = metadata.hasAlpha;
        
        console.log(`  ✅ PNG Format: ${isValidFormat ? 'YES' : 'NO'}`);
        console.log(`  ✅ Under 4MB: ${isValidSize ? 'YES' : 'NO'}`);
        console.log(`  ✅ Has Alpha: ${hasAlpha ? 'YES' : 'NO'}`);
        
        if (isValidFormat && isValidSize && hasAlpha) {
          console.log(`  🎉 READY for OpenAI!`);
        } else {
          console.log(`  ⚠️ Needs conversion`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error reading file: ${error.message}`);
      }
    } else {
      console.log(`\n📁 File not found: ${file}`);
    }
  }
}

testImageFormat();
