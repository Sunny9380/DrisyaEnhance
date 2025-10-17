import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

async function addJewelryTemplates() {
  let connection;
  
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'drisya'
    });

    console.log('Connected to MySQL database');

    // Jewelry-specific template prompts
    const jewelryTemplates = [
      {
        id: randomUUID(),
        name: 'Ivory Silk Luxury Scene',
        category: 'jewelry',
        backgroundStyle: 'silk',
        lightingPreset: 'soft-glow',
        description: 'A soft ivory silk fabric background with smooth folds and diffused natural light. Gentle highlights emphasize jewelry shine without glare.',
        coinCost: 3,
        isPremium: true,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a soft ivory silk fabric background with gentle folds, warm lighting, and cinematic contrast. Maintain exact jewelry color and design with no alterations. Premium luxury scene with natural shadows.',
          shadowIntensity: 0.3,
          vignetteStrength: 0.2,
          colorGrading: 'luxury'
        })
      },
      {
        id: randomUUID(),
        name: 'Charcoal Velvet Noir',
        category: 'jewelry',
        backgroundStyle: 'velvet',
        lightingPreset: 'moody',
        description: 'Deep charcoal gray velvet surface with subtle shadows and directional spotlight, cinematic contrast and depth.',
        coinCost: 3,
        isPremium: true,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a deep charcoal gray velvet surface with subtle shadows and directional spotlight. Cinematic contrast and depth. Preserve exact jewelry details and metallic shine.',
          shadowIntensity: 0.5,
          vignetteStrength: 0.4,
          colorGrading: 'dramatic'
        })
      },
      {
        id: randomUUID(),
        name: 'Champagne Satin Glow',
        category: 'jewelry',
        backgroundStyle: 'satin',
        lightingPreset: 'soft-glow',
        description: 'Warm champagne satin background with golden lighting, luxurious and refined.',
        coinCost: 3,
        isPremium: true,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a warm champagne satin background with golden lighting, luxurious and refined. Maintain jewelry authenticity with enhanced reflections.',
          shadowIntensity: 0.25,
          vignetteStrength: 0.15,
          colorGrading: 'warm'
        })
      },
      {
        id: randomUUID(),
        name: 'White Marble Luxe',
        category: 'jewelry',
        backgroundStyle: 'marble',
        lightingPreset: 'studio',
        description: 'Premium white marble with fine gray veins, daylight tone, minimal and elegant.',
        coinCost: 2,
        isPremium: false,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on premium white marble with fine gray veins, daylight tone, minimal and elegant. Keep jewelry colors and details unchanged.',
          shadowIntensity: 0.2,
          vignetteStrength: 0.1,
          colorGrading: 'neutral'
        })
      },
      {
        id: randomUUID(),
        name: 'Black Onyx Surface',
        category: 'jewelry',
        backgroundStyle: 'onyx',
        lightingPreset: 'spotlight',
        description: 'Matte black onyx background with focused light, dramatic and rich.',
        coinCost: 3,
        isPremium: true,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a matte black onyx background with focused light, dramatic and rich. Preserve jewelry shine and metallic properties.',
          shadowIntensity: 0.6,
          vignetteStrength: 0.5,
          colorGrading: 'dramatic'
        })
      },
      {
        id: randomUUID(),
        name: 'Dusty Rose Velvet',
        category: 'jewelry',
        backgroundStyle: 'velvet',
        lightingPreset: 'moody',
        description: 'Muted pink velvet backdrop with soft, moody lighting and gentle shadows.',
        coinCost: 2,
        isPremium: false,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a muted pink velvet backdrop with soft, moody lighting and gentle shadows. Maintain exact jewelry appearance.',
          shadowIntensity: 0.3,
          vignetteStrength: 0.25,
          colorGrading: 'warm'
        })
      },
      {
        id: randomUUID(),
        name: 'Emerald Stone Studio',
        category: 'jewelry',
        backgroundStyle: 'stone',
        lightingPreset: 'studio',
        description: 'Polished emerald-green surface with soft reflections and premium tone.',
        coinCost: 3,
        isPremium: true,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a polished emerald-green surface with soft reflections and premium tone. Keep jewelry design and colors authentic.',
          shadowIntensity: 0.35,
          vignetteStrength: 0.2,
          colorGrading: 'cool'
        })
      },
      {
        id: randomUUID(),
        name: 'Pearl White Texture',
        category: 'jewelry',
        backgroundStyle: 'pearl',
        lightingPreset: 'soft-glow',
        description: 'Smooth pearl-white backdrop with iridescent glow and clean lighting.',
        coinCost: 2,
        isPremium: false,
        isActive: true,
        settings: JSON.stringify({
          diffusionPrompt: 'Use the uploaded jewelry image. Place it on a smooth pearl-white backdrop with iridescent glow and clean lighting. Preserve jewelry details exactly.',
          shadowIntensity: 0.15,
          vignetteStrength: 0.1,
          colorGrading: 'neutral'
        })
      }
    ];

    // Insert jewelry templates
    for (const template of jewelryTemplates) {
      await connection.execute(
        `INSERT INTO templates (
          id, name, category, background_style, lighting_preset, description,
          coin_cost, is_premium, is_active, settings, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          settings = VALUES(settings)`,
        [
          template.id,
          template.name,
          template.category,
          template.backgroundStyle,
          template.lightingPreset,
          template.description,
          template.coinCost,
          template.isPremium,
          template.isActive,
          template.settings
        ]
      );
      
      console.log(`✅ Added jewelry template: ${template.name}`);
    }

    // Show all jewelry templates
    const [jewelryTemplatesList] = await connection.execute(
      'SELECT id, name, category, background_style, coin_cost, is_premium FROM templates WHERE category = "jewelry" ORDER BY created_at DESC'
    );
    
    console.log('\n📋 Jewelry templates in database:');
    jewelryTemplatesList.forEach((template, index) => {
      const premium = template.is_premium ? '👑 Premium' : '🆓 Free';
      console.log(`${index + 1}. ${template.name} (${template.background_style}) - ${template.coin_cost} coins - ${premium}`);
    });

    console.log('\n🎉 Jewelry Background Generator templates added successfully!');
    console.log('✨ Features:');
    console.log('- 8 premium jewelry-specific background templates');
    console.log('- AI-powered prompts for realistic background generation');
    console.log('- Preserves jewelry details and authenticity');
    console.log('- Professional lighting and shadow effects');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
addJewelryTemplates();
