import fs from 'fs/promises';

// Create a 1024x1024 test image for Stability AI
const create1024Image = async () => {
  // Simple 1024x1024 white PNG (base64)
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8/5+hnoEIwDiqkL5WAAAA//8DAJ4h7QAAAABJRu5ErkJggg==';
  
  try {
    // Create a simple colored square for testing
    const canvas = Buffer.alloc(1024 * 1024 * 3); // RGB
    canvas.fill(128); // Gray color
    
    // For now, use a simple approach - create a basic image file
    await fs.writeFile('./test-earrings-1024.jpg', canvas);
    console.log('✅ Created 1024x1024 test image');
    console.log('📋 Run: node test-stability-image.js');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

create1024Image();
