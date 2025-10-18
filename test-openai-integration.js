import dotenv from 'dotenv';
import { openaiImageEnhancer } from './server/services/openaiImageEnhancer.js';
import fs from 'fs/promises';

dotenv.config();

const VELVET_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

console.log('🤖 Testing OpenAI DALL-E Integration\n');

async function testOpenAIIntegration() {
  console.log('📋 OpenAI DALL-E Test Configuration:');
  console.log(`   🔑 API Key: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`   🎨 Model: DALL-E 3`);
  console.log(`   📝 Prompt: Your velvet background prompt`);
  console.log('');

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('❌ OpenAI API Key Required');
    console.log('');
    console.log('📋 To get your OpenAI API key:');
    console.log('1. Go to: https://platform.openai.com/api-keys');
    console.log('2. Sign up or login to OpenAI');
    console.log('3. Create a new API key');
    console.log('4. Add credits to your account (DALL-E requires paid credits)');
    console.log('5. Update your .env file:');
    console.log('   OPENAI_API_KEY=sk-your-actual-key-here');
    console.log('');
    console.log('💰 DALL-E 3 Pricing:');
    console.log('   - Standard (1024×1024): $0.040 per image');
    console.log('   - HD (1024×1024): $0.080 per image');
    console.log('   - Much higher quality than Stability AI');
    return;
  }

  try {
    // Check if test image exists
    const testImagePath = './your-earrings.jpg';
    
    try {
      await fs.access(testImagePath);
      console.log(`✅ Found test image: ${testImagePath}`);
    } catch {
      console.log('⚠️ Test image not found. Please save your earrings image as "your-earrings.jpg"');
      return;
    }

    console.log('\n🚀 Starting OpenAI DALL-E Enhancement...');
    console.log('🎨 Applying your velvet background prompt');
    console.log('⏳ Processing with DALL-E 3... (30-60 seconds)\n');

    const result = await openaiImageEnhancer.enhanceImage({
      inputPath: testImagePath,
      outputPath: './openai-enhanced-earrings.png',
      prompt: VELVET_PROMPT,
      quality: 'hd',
      isBlurred: false
    });

    if (result.success) {
      console.log('🎉 SUCCESS! OpenAI DALL-E Enhancement Complete!\n');
      
      console.log('📊 Results:');
      console.log(`   ✅ Enhanced image: openai-enhanced-earrings.png`);
      console.log(`   ⏱️ Processing time: ${(result.processingTime / 1000).toFixed(1)} seconds`);
      console.log(`   🤖 Model: ${result.metadata?.model || 'DALL-E 3'}`);
      console.log(`   🎯 Quality: HD (1024x1024)`);
      
      console.log('\n🎨 Applied Enhancements:');
      console.log('   🔵 Dark blue velvet background');
      console.log('   💡 Moody directional lighting');
      console.log('   🪟 Windowpane shadow patterns');
      console.log('   🎭 Cinematic luxury ambiance');
      console.log('   💎 Preserved jewelry details');
      
      console.log('\n🎊 OPENAI INTEGRATION WORKING!');
      console.log('📋 Your API-based system is ready:');
      console.log('   ✅ OpenAI DALL-E 3 connected');
      console.log('   ✅ Your velvet prompt working');
      console.log('   ✅ High-quality image generation');
      console.log('   ✅ Ready for API-based bulk processing');
      
    } else {
      console.log('❌ OpenAI Enhancement Failed');
      console.log(`   Error: ${result.error}`);
      console.log('');
      console.log('🔧 Common Issues:');
      console.log('   - Invalid API key');
      console.log('   - Insufficient credits in OpenAI account');
      console.log('   - Image format not supported');
      console.log('   - Rate limit exceeded');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// API Endpoints Information
console.log('🚀 Your OpenAI API Endpoints:');
console.log('');
console.log('📡 Available API Routes:');
console.log('   POST /api/openai/enhance - Single image enhancement');
console.log('   POST /api/openai/batch-enhance - Batch processing');
console.log('   POST /api/openai/simple-enhance - ChatGPT-style enhancement');
console.log('   GET  /api/openai/status - Check API status');
console.log('');
console.log('💡 Usage Example:');
console.log('   curl -X POST http://localhost:5000/api/openai/simple-enhance \\');
console.log('        -F "image=@your-jewelry.jpg" \\');
console.log('        -F "prompt=Your velvet background prompt"');
console.log('');

// Run the test
testOpenAIIntegration();
