# Drisya - AI-Powered Image Enhancement Platform

## Overview

Drisya is an enterprise-grade SaaS platform for bulk image enhancement and background processing. The application enables users to upload product images (individually or in bulk), apply professional templates, and download processed results. The system uses a coin-based pricing model for access control and is designed to handle high-volume batch processing (1000+ images).

**Core Features:**
- AI-powered background removal and replacement
- 100+ professional templates for product photography
- Bulk upload and processing (ZIP support, 1000+ images)
- Coin-based payment and wallet system
- Real-time processing queue with progress tracking
- Team collaboration and API access
- Analytics and usage insights

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript, using Vite as the build tool

**Routing:** Wouter for lightweight client-side routing with dedicated routes for authenticated and public areas

**State Management:** TanStack Query (React Query) for server state management with custom query client configuration

**UI Framework:** Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling

**Design System:**
- Custom theme inspired by Linear, Figma, and Notion for productivity-focused interfaces
- Dark mode primary with light mode support
- Inter font for UI, JetBrains Mono for statistics/counts
- CSS custom properties for theming with automatic border computation
- Hover/active state elevation system for visual feedback

**Component Architecture:**
- Modular component structure in `client/src/components/`
- Reusable UI primitives in `client/src/components/ui/`
- Feature-specific components (TemplateGallery, UploadDropzone, BatchEditPanel, ImageComparisonSlider)
- Page-level components in `client/src/pages/`

**Key UI Patterns:**
- Template gallery with search, filtering, and favorites
- Drag-and-drop file upload with preview
- Before/after image comparison slider
- Real-time job status cards with progress indicators
- Notification center for batch completion alerts
- Keyboard shortcuts for power users

### Backend Architecture

**Runtime:** Node.js with Express.js framework

**Language:** TypeScript with ESM modules

**Development Server:** Vite middleware integration for HMR in development, static serving in production

**Storage Layer:** PostgreSQL database with Drizzle ORM (`DbStorage` class) for persistent data storage

**API Design:**
- RESTful API structure with `/api` prefix
- Route registration system in `server/routes.ts`
- Request/response logging middleware
- Error handling middleware with status code normalization
- Admin-only routes for user and coin management

**Authentication:** Session-based authentication with PostgreSQL session storage (fully implemented)

**File Structure:**
- `server/index.ts` - Application entry point and middleware setup
- `server/routes.ts` - Route registration and HTTP server creation
- `server/storage.ts` - Data access layer with interface abstraction
- `server/db.ts` - Database configuration (Drizzle ORM + Neon Postgres)

### Database Architecture

**ORM:** Drizzle ORM with Neon Serverless PostgreSQL

**Connection:** Neon serverless driver with WebSocket support

**Schema Design:**
- Users table with UUID primary keys, username/password authentication
- Schema defined in `shared/schema.ts` for type sharing between client/server
- Zod integration for runtime validation via `drizzle-zod`

**Migration Strategy:**
- Drizzle Kit for schema management
- Migration files in `./migrations` directory
- Push-based deployment with `db:push` script

**Implemented Schema:**
```typescript
users {
  id: UUID (primary key)
  email: text (unique)
  password: text (hashed with bcrypt)
  name: text
  phone: text (for WhatsApp contact)
  coinBalance: integer (default 0)
  role: text (user/admin)
  createdAt: timestamp
}

templates {
  id: UUID (primary key)
  name: text
  category: text (jewelry, fashion, etc.)
  backgroundStyle: text (velvet, marble, minimal, gradient, festive)
  lightingPreset: text (moody, soft-glow, spotlight, studio)
  description: text
  thumbnailUrl: text
  settings: jsonb (diffusionPrompt, shadowIntensity, vignetteStrength, colorGrading, gradientColors, etc.)
  isPremium: boolean
  isActive: boolean
  createdAt: timestamp
}

processingJobs {
  id: UUID (primary key)
  userId: UUID (foreign key)
  templateId: UUID (optional, foreign key)
  status: text (queued/processing/completed/failed)
  totalImages: integer
  processedImages: integer
  zipUrl: text (optional)
  batchSettings: jsonb (stores background prompts)
  createdAt: timestamp
}

images {
  id: UUID (primary key)
  jobId: UUID (foreign key)
  originalUrl: text
  processedUrl: text (optional)
  status: text (pending/processing/completed/failed)
}

transactions {
  id: UUID (primary key)
  userId: UUID (foreign key)
  type: text (purchase/usage)
  amount: integer
  description: text
  metadata: jsonb
  createdAt: timestamp
}

templateFavorites {
  id: UUID (primary key)
  userId: UUID (foreign key)
  templateId: UUID (foreign key)
  createdAt: timestamp
}
```

### External Dependencies

**UI Components:**
- Radix UI primitives (@radix-ui/*) for accessible, unstyled components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- class-variance-authority (CVA) for component variant management

**Forms & Validation:**
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for integration

**State & Data Fetching:**
- TanStack Query for async state management
- Custom fetch wrapper with credential handling

**Database & ORM:**
- Drizzle ORM for type-safe SQL
- @neondatabase/serverless for serverless PostgreSQL
- connect-pg-simple for session storage (PostgreSQL-backed sessions)

**Build & Development:**
- Vite for fast development and optimized builds
- esbuild for server-side bundling
- tsx for TypeScript execution in development
- Replit-specific plugins (runtime error overlay, cartographer, dev banner)

### Advanced AI Image Processing Architecture

**Python Service (Port 5001):**
- Flask-based microservice with professional-grade image processing
- Background removal using color-based segmentation (upgradeable to BiRefNet/U2-Net)
- **5 Background Styles:** Velvet texture, Marble texture, Minimal clean, Gradient, Festive (with bokeh/sparkle effects)
- **4 Lighting Presets:** Moody (dark with vignette), Soft-glow (bright diffused), Spotlight (dramatic), Studio (professional even lighting)
- **Advanced Effects:** Window-pane shadows, vignette control, color grading (warm/cool/dramatic/luxury), specular highlights
- **Post-processing:** Auto-contrast, tone balance, sharpness enhancement, 1080x1080px output
- RESTful API endpoints: `/process`, `/batch-process`, `/health`

**Integration with Node.js Backend:**
- Template settings fetched from database and passed to Python service
- Base64 image encoding for data transfer
- Template-based processing: Node.js fetches template → extracts settings (backgroundStyle, lightingPreset, shadowIntensity, etc.) → sends to Python
- Async job processing with background tasks
- Processed images saved to `uploads/processed/` directory
- Automatic ZIP creation for batch downloads

**Template-Driven Processing Pipeline:**
1. User selects premium template (e.g., "Dark Velvet Luxury" with moody lighting)
2. Backend fetches template settings from database
3. Settings sent to Python service: `{ backgroundStyle: "velvet", lightingPreset: "moody", shadowIntensity: 0.7, vignetteStrength: 0.3, colorGrading: "warm", gradientColors: [...] }`
4. Python generates velvet texture → removes product background → composites → applies moody lighting → adds shadows → color grades → outputs 1080x1080px

**Current Implementation:**
- Velvet/marble textures using noise and procedural generation
- Gradient and festive backgrounds with bokeh effects
- Lighting simulation (brightness/contrast/vignette manipulation)
- Window shadow rendering with gaussian blur
- Color grading for warm/cool/dramatic tones
- Fully self-hosted, no external API dependencies
- Production-ready for BiRefNet (SOTA background removal) and Stable Diffusion (photorealistic backgrounds) upgrade

### Admin Features

**Coin Management via WhatsApp/Phone:**
- Admin panel at `/admin` route (admin role required)
- User phone numbers stored for WhatsApp contact
- Manual coin distribution after payment confirmation
- Transaction logging with metadata (admin ID, description)
- Real-time balance updates via TanStack Query

**Admin Capabilities:**
- View all users with phone/WhatsApp details
- Add coins to any user account
- Atomic coin transactions with SQL-level safety
- Transaction history tracking

**Note on WhatsApp Integration:**
- Currently using manual phone-based workflow (admin contacts users via WhatsApp)
- Future enhancement: Twilio API for automated WhatsApp messaging (not implemented - user prefers manual approach)
- Phone field in users table ready for integration

**Active Integrations:**
- Replit Database (PostgreSQL)
- Replit Authentication (OIDC) - available but using custom auth
- Session management via connect-pg-simple

**Third-Party Services:**
- No external API dependencies for image processing (self-hosted)
- Google Fonts (Inter, JetBrains Mono)

## Recent Updates (October 2025)

**Advanced AI Processing System:**
- **Premium Template System:** 12 professional templates seeded with 5 background styles (velvet, marble, minimal, gradient, festive) and 4 lighting presets (moody, soft-glow, spotlight, studio)
- **Enhanced Python Service:** Velvet/marble texture generation, lighting simulation, window shadows, vignette effects, color grading (warm/cool/dramatic/luxury)
- **Template-Driven Pipeline:** Database stores template settings → Node.js fetches and passes to Python → Python applies all effects → outputs 1080x1080px professional images
- **Template Gallery UI:** React Query-powered gallery with style filters, premium badges, lighting indicators, and color previews
- **Production-Ready Architecture:** Upgradeable to BiRefNet (SOTA background removal) and Stable Diffusion (photorealistic AI backgrounds)

**Previous Updates (January 2025):**

**Self-Hosted AI Implementation:**
- Python 3.11 service created for background removal and AI generation
- No dependency on Remove.bg, OpenAI, or other external APIs
- Upgradeable architecture for BiRefNet (SOTA 2025) and Stable Diffusion
- All processing happens locally on server

**Admin Panel & Coin System:**
- Phone field added to users for WhatsApp contact
- Admin routes for user management (`/api/admin/users`, `/api/admin/users/:id/add-coins`)
- Complete coin distribution workflow via manual WhatsApp confirmation
- Atomic transaction system prevents race conditions
- Security fix: Password hashes excluded from admin API responses