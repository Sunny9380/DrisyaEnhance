import { storage } from "./storage";

const templates = [
  {
    name: "Premium Dark Fabric",
    category: "Elegant",
    thumbnailUrl: null,
    settings: {
      background: "dark-fabric",
      lighting: "professional",
    },
    isActive: true,
  },
  {
    name: "White Studio",
    category: "Studio",
    thumbnailUrl: null,
    settings: {
      background: "white-studio",
      lighting: "bright",
    },
    isActive: true,
  },
  {
    name: "Blue Gradient",
    category: "Minimal",
    thumbnailUrl: null,
    settings: {
      background: "blue-gradient",
      lighting: "soft",
    },
    isActive: true,
  },
  {
    name: "Rose Gold",
    category: "Elegant",
    thumbnailUrl: null,
    settings: {
      background: "rose-gold",
      lighting: "warm",
    },
    isActive: true,
  },
  {
    name: "Wooden Table",
    category: "Natural",
    thumbnailUrl: null,
    settings: {
      background: "wooden-table",
      lighting: "natural",
    },
    isActive: true,
  },
  {
    name: "Marble Surface",
    category: "Luxury",
    thumbnailUrl: null,
    settings: {
      background: "marble",
      lighting: "professional",
    },
    isActive: true,
  },
  {
    name: "Black Velvet",
    category: "Elegant",
    thumbnailUrl: null,
    settings: {
      background: "black-velvet",
      lighting: "dramatic",
    },
    isActive: true,
  },
  {
    name: "Soft Pink",
    category: "Minimal",
    thumbnailUrl: null,
    settings: {
      background: "soft-pink",
      lighting: "soft",
    },
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding templates...");
  
  const existingTemplates = await storage.getAllTemplates();
  
  if (existingTemplates.length > 0) {
    console.log(`Found ${existingTemplates.length} existing templates. Skipping seed.`);
    return;
  }

  for (const template of templates) {
    const created = await storage.createTemplate(template);
    console.log(`Created template: ${created.name} (${created.id})`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
