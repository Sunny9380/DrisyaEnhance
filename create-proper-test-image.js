import axios from 'axios';
import fs from 'fs/promises';

async function createProperTestImage() {
  console.log('🖼️ Creating proper 1024x1024 test image...');
  
  try {
    // Download a proper test image from a placeholder service
    const imageUrl = 'https://picsum.photos/1024/1024';
    
    console.log('📥 Downloading test image...');
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const imageBuffer = Buffer.from(response.data);
    await fs.writeFile('./test-earrings.jpg', imageBuffer);
    
    console.log('✅ Test image created successfully!');
    console.log(`📏 Size: ${imageBuffer.length} bytes`);
    console.log('📋 Now run: node live-stability-test.js');
    
  } catch (error) {
    console.error('❌ Failed to create test image:', error.message);
    console.log('\n💡 Alternative: Save any 1024x1024 image as "test-earrings.jpg"');
  }
}

createProperTestImage();
