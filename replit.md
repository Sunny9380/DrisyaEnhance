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
  category: text
  description: text
  thumbnailUrl: text
  gradientColors: text[]
  isPremium: boolean
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

### AI Image Processing Architecture

**Python Service (Port 5001):**
- Flask-based microservice for AI image processing
- Background removal using color-based segmentation (placeholder for BiRefNet/U2-Net)
- AI background generation from text prompts (gradient-based, upgradeable to Stable Diffusion)
- Image compositing and 1080x1080px output generation
- RESTful API endpoints: `/process`, `/batch-process`, `/health`

**Integration with Node.js Backend:**
- Backend calls Python service via HTTP (axios)
- Base64 image encoding for data transfer
- Async job processing with setTimeout for background tasks
- Processed images saved to `uploads/processed/` directory
- Automatic ZIP creation for batch downloads

**Current Implementation:**
- Simple color-based background removal (production-ready for BiRefNet upgrade)
- Gradient generation from text descriptions (production-ready for Stable Diffusion upgrade)
- No external API dependencies (fully self-hosted)

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

## Recent Updates (January 2025)

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