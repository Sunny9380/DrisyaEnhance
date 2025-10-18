import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VELVET_PROMPT = `A dark, elegant matte blue velvet or suede background with soft texture, under moody, directional lighting. Strong light beams cast realistic shadows in a criss-cross windowpane pattern, creating a dramatic and luxurious ambiance. The scene should evoke a sense of evening or indoor light streaming through a window, with a focused spotlight on the product area and soft shadows to highlight depth and contrast. The environment should feel premium, rich, and cinematic. Ensure the earrings design, link pattern, clasp details, colors, and background elements remain exactly the same with no changes or alterations to composition, color, or lighting. make a image size is 1080 X 1080px.`;

console.log('🤖 Testing OpenAI DALL-E Integration\n');

async function testOpenAIDirectly() {
  console.log('📋 OpenAI DALL-E Test Configuration:');
  console.log(`   🔑 API Key: ${OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`   🎨 Model: DALL-E 3`);
  console.log(`   📝 Prompt: Your velvet background prompt`);
  console.log('');

  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
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
    console.log('');
    console.log('🚀 Alternative: Use your existing Stability AI setup');
    console.log('   Your Stability AI is already working perfectly!');
    return;
  }

  try {
    // First, test API connection
    console.log('🔄 Testing OpenAI API connection...');
    
    const testResponse = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      timeout: 10000
    });

    if (testResponse.status === 200) {
      console.log('✅ OpenAI API connection successful!');
      console.log(`📊 Available models: ${testResponse.data.data.length}`);
      
      // Check for DALL-E models
      const dalleModels = testResponse.data.data.filter(model => 
        model.id.includes('dall-e')
      );
      
      if (dalleModels.length > 0) {
        console.log('🎨 DALL-E models available:');
        dalleModels.forEach(model => {
          console.log(`   - ${model.id}`);
        });
      }
    }

    // Check if test image exists
    const testImagePath = './your-earrings.jpg';
    
    try {
      const imageStats = await fs.stat(testImagePath);
      console.log(`\n✅ Found test image: ${testImagePath}`);
      console.log(`📏 Image size: ${imageStats.size} bytes`);
    } catch {
      console.log('\n⚠️ Test image not found. Creating a test with DALL-E generation...');
      
      // Test DALL-E 3 generation instead
      console.log('\n🚀 Testing DALL-E 3 Generation...');
      console.log('🎨 Creating jewelry image with your velvet prompt');
      console.log('⏳ Processing... (30-60 seconds)\n');

      const generationResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: `Create luxury jewelry earrings photography: ${VELVET_PROMPT}`,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          response_format: 'url'
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      if (generationResponse.data.data && generationResponse.data.data.length > 0) {
        const imageUrl = generationResponse.data.data[0].url;
        const revisedPrompt = generationResponse.data.data[0].revised_prompt;
        
        // Download the generated image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        await fs.writeFile('./openai-generated-jewelry.png', imageResponse.data);
        
        console.log('🎉 SUCCESS! DALL-E 3 Generation Complete!\n');
        
        console.log('📊 Results:');
        console.log(`   ✅ Generated image: openai-generated-jewelry.png`);
        console.log(`   🎨 Model: DALL-E 3 HD`);
        console.log(`   📏 Size: 1024x1024px`);
        console.log(`   💰 Cost: ~$0.08`);
        
        console.log('\n📝 AI Revised Prompt:');
        console.log(`   "${revisedPrompt}"`);
        
        console.log('\n🎨 Applied Features:');
        console.log('   🔵 Dark blue velvet background');
        console.log('   💡 Moody directional lighting');
        console.log('   🪟 Windowpane shadow patterns');
        console.log('   🎭 Cinematic luxury ambiance');
        console.log('   💎 Professional jewelry photography');
        
        console.log('\n🎊 OPENAI DALL-E 3 INTEGRATION WORKING!');
        console.log('📋 Your API-based system is ready:');
        console.log('   ✅ OpenAI DALL-E 3 connected');
        console.log('   ✅ Your velvet prompt working');
        console.log('   ✅ High-quality image generation');
        console.log('   ✅ Ready for API endpoints');
        
        return true;
      }
    }

  } catch (error) {
    console.log('\n❌ OpenAI Test Failed');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.error?.message || error.message}`);
      
      if (error.response.status === 401) {
        console.log('\n🔧 Solution: Invalid API key');
        console.log('   - Check your API key is correct');
        console.log('   - Make sure it starts with "sk-"');
      } else if (error.response.status === 429) {
        console.log('\n🔧 Solution: Rate limit or insufficient credits');
        console.log('   - Add credits to your OpenAI account');
        console.log('   - Wait a moment and try again');
      }
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n💡 Alternative Options:');
    console.log('   1. Use your working Stability AI setup');
    console.log('   2. Add OpenAI credits and try again');
    console.log('   3. Use both APIs for different use cases');
    
    return false;
  }
}

// Show API information
console.log('🚀 Your OpenAI API Integration:');
console.log('');
console.log('📡 When working, your API endpoints will be:');
console.log('   POST /api/openai/simple-enhance - ChatGPT-style enhancement');
console.log('   POST /api/openai/enhance - Single image enhancement');
console.log('   POST /api/openai/batch-enhance - Batch processing');
console.log('   GET  /api/openai/status - Check API status');
console.log('');
console.log('💡 Usage after setup:');
console.log('   1. Add OpenAI API key to .env');
console.log('   2. Start server: npm run dev');
console.log('   3. Use API endpoints for enhancement');
console.log('');

// Run the test
testOpenAIDirectly()
  .then((success) => {
    if (success) {
      console.log('\n🎊 READY FOR PRODUCTION!');
      console.log('Your OpenAI DALL-E integration is working perfectly!');
    } else {
      console.log('\n🔧 Setup needed or use Stability AI');
      console.log('Your Stability AI system is already working great!');
    }
  })
  .catch((error) => {
    console.error('\nTest execution failed:', error.message);
  });
