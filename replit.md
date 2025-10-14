# Drisya - AI-Powered Image Enhancement Platform

## Overview

Drisya is an enterprise-grade SaaS platform for bulk AI-powered image enhancement and background processing. It allows users to upload product images, apply professional templates for background removal and replacement, and download processed results. The platform uses a coin-based pricing model, supports high-volume batch processing (1000+ images), and includes features for team collaboration and analytics. The vision is to provide a comprehensive solution for professional product photography editing, including a new feature for FREE custom prompt-based image transformation using Hugging Face AI models and premium 3D interactive elements for an elevated user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

**Framework & Design:** React 18 with TypeScript, Vite, Shadcn/ui (Radix UI), Tailwind CSS. Features a productivity-focused theme with dark/light mode, Inter font, and an elevation system.
**Key UI Patterns:** Template gallery with filtering, drag-and-drop upload with preview, before/after comparison, real-time job status, keyboard shortcuts, and premium 3D animations (Hero3D, TemplateCards3D, ProcessingAnimation3D, ImageCarousel3D) using Framer Motion + CSS 3D transforms.
**Luxury Interactive Experiences:** Landing page with scroll-triggered storytelling, premium typography, feature sections, and interactive template configurator with visual pickers. Includes a 3D Product Viewer with drag-to-rotate, zoom controls, and visual effects.
**Template Detail & Product Pages:** Comprehensive pages displaying pricing, features, benefits, use cases, and testimonials for each template.

### Backend

**Core:** Node.js with Express.js (TypeScript, ESM modules).
**API:** RESTful API with route registration, logging, and error handling.
**Authentication:** Session-based authentication using PostgreSQL.
**File Structure:** Modular, separating application entry, routes, storage, and database configuration.
**AI Image Processing:** Python Flask microservice (Port 5001) handles AI-powered background removal, various background styles, lighting presets, advanced effects (shadows, vignette, color grading), and post-processing (auto-contrast, tone balance, sharpness). Supports multiple quality levels: 4K (2160x2160), HD (1920x1920), Standard (1080x1080). Integrates via Base64 image encoding with retry logic to handle Replit proxy issues.
**Custom AI Image Editing:** Integrated Hugging Face Inference API client (Qwen-Image-Edit-2509, FLUX.1-Kontext-dev, and auto-mode) for prompt-based image transformations. Features an async processing queue with quota enforcement (1000 free API calls/month) and fallback to local Python service with 4K quality support. **Template-aware transformations:** Automatically applies selected template backgrounds (Rose Gold, Dark Fabric, Marble, etc.) to AI transformations.
**High-Speed Batch Processing:** Parallel AI processing queue with 20 concurrent workers enables bulk transformation of 1000+ images in minutes. Batch endpoint processes multiple images simultaneously for production-scale workflows.
**Professional Backgrounds:** NumPy-optimized fabric texture generation creates luxury jewelry photography backgrounds (dark blue velvet, rose gold metallic, fabric textures) with soft lighting effects. Vectorized processing handles 4K images in milliseconds for production throughput.

### Database

**ORM:** Drizzle ORM with Neon Serverless PostgreSQL.
**Schema:** Tables for Users, Templates, ProcessingJobs, Images, Transactions, TemplateFavorites, CoinPackages, ManualTransactions, `ai_edits` (for custom AI editing tracking), and `ai_usage_ledger` (for quota enforcement). UUID primary keys and Zod validation.
**Schema Extensions:** `templates` table extended with `coinCost`, `pricePerImage`, `features`, `benefits`, `useCases`, `whyBuy`, and `testimonials` fields for detailed product pages.
**Migration:** Drizzle Kit for schema management.

### Admin Features

**Admin Panel:** `/admin` dashboard with Analytics, Users, Packages, Payments, Templates, and Settings tabs.
**Functionality:** Real-time metrics, coin management (add coins, track transactions, manage packages), manual payment system (WhatsApp/UPI/bank transfer approval). Admin users can edit comprehensive template details including pricing, features, use cases, and testimonials with Zod validation.

## External Dependencies

**UI Components:** Radix UI, Tailwind CSS, Lucide React, class-variance-authority (CVA), Framer Motion.
**Forms & Validation:** React Hook Form, Zod, @hookform/resolvers.
**State & Data Fetching:** TanStack Query.
**Database & ORM:** Drizzle ORM, @neondatabase/serverless, connect-pg-simple.
**Build & Development:** Vite, esbuild, tsx.
**Third-Party Services:** Google Fonts (Inter, JetBrains Mono), Hugging Face Inference API (requires `HF_API_TOKEN`).
**Replit Integrations:** Replit Database (PostgreSQL).