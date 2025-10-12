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

**Storage Layer:** Currently using in-memory storage (`MemStorage` class) with interface-based design for future database migration

**API Design:**
- RESTful API structure with `/api` prefix
- Route registration system in `server/routes.ts`
- Request/response logging middleware
- Error handling middleware with status code normalization

**Authentication:** Session-based (infrastructure ready, implementation pending)

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

**Current Schema:**
```typescript
users {
  id: UUID (primary key)
  username: text (unique)
  password: text
}
```

**Planned Extensions** (based on UI):
- Templates table (id, name, category, thumbnailUrl, gradient)
- Jobs table (id, userId, templateId, status, progress, imageCount)
- Transactions table (id, userId, type, amount, description)
- Favorites/UserTemplates junction table
- Team members and API keys tables

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

**Planned Integrations** (based on UI):
- Image processing backend (Python/OpenCV or cloud service)
- Cloud storage (S3/Google Drive/Dropbox) for processed images
- E-commerce platforms (Shopify, WooCommerce, Amazon Seller Central)
- Payment processing for coin purchases
- Email service for notifications

**Third-Party Services Ready:**
- Google Fonts (Inter, JetBrains Mono)
- Social login providers (infrastructure in auth schema)