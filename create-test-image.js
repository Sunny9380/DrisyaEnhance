import fs from 'fs/promises';

// Create a simple test image (1x1 pixel PNG) for testing
const createTestImage = async () => {
  // Base64 encoded 1x1 transparent PNG
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  try {
    const buffer = Buffer.from(base64PNG, 'base64');
    await fs.writeFile('./test-earrings.jpg', buffer);
    console.log('✅ Created test-earrings.jpg (placeholder image)');
    console.log('📋 Now run: node test-stability-image.js');
    console.log('');
    console.log('💡 For real testing:');
    console.log('   1. Replace test-earrings.jpg with your actual earrings image');
    console.log('   2. Run the test again');
  } catch (error) {
    console.error('❌ Failed to create test image:', error);
  }
};

createTestImage();
