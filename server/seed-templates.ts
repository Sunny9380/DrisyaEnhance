import { db } from "./db";
import { templates } from "@shared/schema";

const premiumTemplates = [
  // Velvet Background Templates
  {
    name: "Dark Velvet Luxury",
    category: "jewelry",
    backgroundStyle: "velvet",
    lightingPreset: "moody",
    description: "Dark velvet background with cinematic window light, perfect for luxury jewelry",
    isPremium: true,
    settings: {
      diffusionPrompt: "Dark velvet background, cinematic window light, luxury jewelry ambience, soft depth shadows, high realism",
      shadowIntensity: 0.7,
      vignetteStrength: 0.3,
      colorGrading: "warm",
    },
  },
  {
    name: "Blue Velvet Elegance",
    category: "jewelry",
    backgroundStyle: "velvet",
    lightingPreset: "soft-glow",
    description: "Elegant blue velvet with soft directional lighting for premium jewelry photography",
    isPremium: true,
    settings: {
      diffusionPrompt: "Deep blue velvet texture, soft directional light, elegant jewelry backdrop, professional studio quality",
      shadowIntensity: 0.5,
      vignetteStrength: 0.2,
      colorGrading: "cool",
    },
  },
  {
    name: "Crimson Velvet Drama",
    category: "jewelry",
    backgroundStyle: "velvet",
    lightingPreset: "spotlight",
    description: "Rich crimson velvet with dramatic spotlight for statement pieces",
    isPremium: true,
    settings: {
      diffusionPrompt: "Rich crimson velvet, dramatic spotlight effect, luxury jewelry display, high contrast shadows",
      shadowIntensity: 0.8,
      vignetteStrength: 0.4,
      colorGrading: "dramatic",
    },
  },

  // Marble Background Templates
  {
    name: "White Marble Classic",
    category: "jewelry",
    backgroundStyle: "marble",
    lightingPreset: "studio",
    description: "Clean white marble surface with professional studio lighting",
    isPremium: true,
    settings: {
      diffusionPrompt: "White marble surface, clean professional lighting, luxury product photography, subtle veining texture",
      shadowIntensity: 0.4,
      vignetteStrength: 0.1,
      colorGrading: "neutral",
    },
  },
  {
    name: "Black Marble Prestige",
    category: "jewelry",
    backgroundStyle: "marble",
    lightingPreset: "moody",
    description: "Sophisticated black marble with moody atmospheric lighting",
    isPremium: true,
    settings: {
      diffusionPrompt: "Black marble with gold veining, moody atmospheric light, premium jewelry backdrop, luxury ambience",
      shadowIntensity: 0.6,
      vignetteStrength: 0.3,
      colorGrading: "luxury",
    },
  },

  // Minimal Background Templates
  {
    name: "Pure White Minimal",
    category: "jewelry",
    backgroundStyle: "minimal",
    lightingPreset: "studio",
    description: "Clean white minimal background for e-commerce product shots",
    isPremium: false,
    settings: {
      diffusionPrompt: "Pure white background, even studio lighting, professional product photography, clean minimal aesthetic",
      shadowIntensity: 0.2,
      vignetteStrength: 0,
      colorGrading: "neutral",
    },
  },
  {
    name: "Soft Gray Minimal",
    category: "jewelry",
    backgroundStyle: "minimal",
    lightingPreset: "soft-glow",
    description: "Subtle gray background with soft diffused lighting",
    isPremium: false,
    settings: {
      diffusionPrompt: "Soft gray background, diffused lighting, professional product shot, clean minimal design",
      shadowIntensity: 0.3,
      vignetteStrength: 0.1,
      colorGrading: "neutral",
    },
  },

  // Gradient Background Templates
  {
    name: "Sunset Gradient",
    category: "jewelry",
    backgroundStyle: "gradient",
    lightingPreset: "soft-glow",
    description: "Warm sunset gradient for romantic jewelry pieces",
    isPremium: true,
    settings: {
      diffusionPrompt: "Warm sunset gradient from orange to pink, soft glowing light, romantic jewelry photography",
      shadowIntensity: 0.4,
      vignetteStrength: 0.2,
      colorGrading: "warm",
      gradientColors: ["#FF6B35", "#F7931E", "#FDC830"],
    },
  },
  {
    name: "Ocean Blue Gradient",
    category: "jewelry",
    backgroundStyle: "gradient",
    lightingPreset: "moody",
    description: "Deep ocean blue gradient with mysterious lighting",
    isPremium: true,
    settings: {
      diffusionPrompt: "Deep ocean blue gradient, mysterious moody lighting, luxury jewelry ambience, depth and dimension",
      shadowIntensity: 0.6,
      vignetteStrength: 0.3,
      colorGrading: "cool",
      gradientColors: ["#0F2027", "#203A43", "#2C5364"],
    },
  },
  {
    name: "Royal Purple Gradient",
    category: "jewelry",
    backgroundStyle: "gradient",
    lightingPreset: "spotlight",
    description: "Regal purple gradient with dramatic spotlight effect",
    isPremium: true,
    settings: {
      diffusionPrompt: "Royal purple gradient background, dramatic spotlight, luxury jewelry display, regal atmosphere",
      shadowIntensity: 0.7,
      vignetteStrength: 0.3,
      colorGrading: "luxury",
      gradientColors: ["#360033", "#0B8793"],
    },
  },

  // Festive Background Templates
  {
    name: "Golden Festive",
    category: "jewelry",
    backgroundStyle: "festive",
    lightingPreset: "soft-glow",
    description: "Festive golden background perfect for holiday jewelry campaigns",
    isPremium: true,
    settings: {
      diffusionPrompt: "Golden festive background with soft bokeh lights, holiday jewelry photography, celebration ambience",
      shadowIntensity: 0.3,
      vignetteStrength: 0.2,
      colorGrading: "warm",
      festiveElements: ["bokeh", "sparkle", "gold-accents"],
    },
  },
  {
    name: "Winter Sparkle",
    category: "jewelry",
    backgroundStyle: "festive",
    lightingPreset: "studio",
    description: "Winter-themed sparkle background for seasonal collections",
    isPremium: true,
    settings: {
      diffusionPrompt: "Winter sparkle background with ice crystals, soft studio lighting, festive jewelry display",
      shadowIntensity: 0.4,
      vignetteStrength: 0.2,
      colorGrading: "cool",
      festiveElements: ["snowflakes", "ice-crystals", "silver-accents"],
    },
  },
];

async function seedTemplates() {
  console.log("🌱 Seeding premium templates...");

  for (const template of premiumTemplates) {
    try {
      await db.insert(templates).values(template);
      console.log(`✅ Added: ${template.name}`);
    } catch (error) {
      console.log(`⚠️  Skipped (already exists): ${template.name}`);
    }
  }

  console.log("✨ Template seeding complete!");
}

seedTemplates().catch(console.error);
