# Drisya - AI-Powered Image Enhancement Platform

## Overview

Drisya is an enterprise-grade SaaS platform designed for bulk AI-powered image enhancement and background processing. It enables users to upload product images, apply professional templates for background removal and replacement, and download processed results. The platform utilizes a coin-based pricing model, supports high-volume batch processing (1000+ images), and includes features for team collaboration and analytics. The vision is to provide a comprehensive solution for professional product photography editing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

**Framework:** React 18 with TypeScript, using Vite and Shadcn/ui (built on Radix UI) with Tailwind CSS.
**Routing:** Wouter for client-side navigation.
**State Management:** TanStack Query for server state.
**Design System:** Productivity-focused theme with dark/light mode, Inter font, CSS custom properties for theming, and elevation system for UI feedback.
**Key UI Patterns:** Template gallery with filtering, drag-and-drop upload with preview, before/after image comparison, real-time job status, and keyboard shortcuts.

### Backend

**Runtime:** Node.js with Express.js (TypeScript, ESM modules).
**API Design:** RESTful API with route registration, request/response logging, and error handling.
**Authentication:** Session-based authentication using PostgreSQL for session storage.
**File Structure:** Modular, with clear separation for application entry, routes, storage, and database configuration.

### Database

**ORM:** Drizzle ORM with Neon Serverless PostgreSQL.
**Schema Design:** Users, Templates, ProcessingJobs, Images, Transactions, TemplateFavorites, CoinPackages, and ManualTransactions tables. UUID primary keys, Zod validation, and `shared/schema.ts` for type sharing.
**Migration:** Drizzle Kit for schema management and migrations.

### Advanced AI Image Processing

**Python Service:** Flask-based microservice (Port 5001) for professional image processing.
**Capabilities:** AI-powered background removal, 5 background styles (Velvet, Marble, Minimal, Gradient, Festive), 4 lighting presets (Moody, Soft-glow, Spotlight, Studio), advanced effects (window-pane shadows, vignette, color grading, specular highlights), and post-processing (auto-contrast, tone balance, sharpness, 1080x1080px output).
**Integration:** Node.js backend passes template settings to the Python service via Base64 image encoding for processing. Supports asynchronous job processing and automatic ZIP creation for batch downloads. Uses custom Axios client with proxy bypass (`proxy: false`) and retry logic (3 attempts with exponential backoff) to avoid Replit's "helium" proxy DNS errors for localhost traffic.
**Template-Driven Pipeline:** Database-stored template settings guide the Python service to apply specific background styles, lighting, and effects.
**Implementation:** Self-hosted with procedural generation for textures, lighting simulation, and color grading. Architected for future upgrades to SOTA models like BiRefNet and Stable Diffusion.

### Admin Features

**Admin Panel:** Comprehensive admin dashboard at `/admin` with 6 tabs: Analytics (default), Users, Packages, Payments, Templates, and Settings.
**Analytics Dashboard:** Real-time metrics showing total revenue, coins sold/active, user growth, and transaction count. Displays recent transactions with payment method details.
**Coin Management:** Add coins to user accounts, track transactions, and manage coin packages. Manual payment system allows logging and approving WhatsApp/UPI/bank transfer payments with atomic coin crediting and status gating to prevent double-approval.
**User Wallet:** Users can view coin packages and initiate WhatsApp-based purchase flows, tracking pending approvals and payment history.

## External Dependencies

**UI Components:** Radix UI, Tailwind CSS, Lucide React, class-variance-authority (CVA).
**Forms & Validation:** React Hook Form, Zod, @hookform/resolvers.
**State & Data Fetching:** TanStack Query.
**Database & ORM:** Drizzle ORM, @neondatabase/serverless, connect-pg-simple.
**Build & Development:** Vite, esbuild, tsx.
**Third-Party Services:** Google Fonts (Inter, JetBrains Mono).
**Replit Integrations:** Replit Database (PostgreSQL).