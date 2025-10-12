# Drisya ERP Image Enhancement Platform - Design Guidelines

## Design Approach: Productivity-First SaaS Interface

**Selected Approach**: Custom design system inspired by **Linear** (clean, fast interfaces) + **Figma** (template galleries) + **Notion** (data organization)

**Justification**: As an enterprise productivity tool for bulk image processing, the interface must prioritize efficiency, clarity, and professional aesthetics. Users need to quickly upload, process, and download thousands of images without visual distractions.

**Core Principles**:
- Speed perception through minimal animation and instant feedback
- Information hierarchy that guides workflow (upload → template → process → download)
- Professional SaaS aesthetic that builds trust for business users
- Clean, uncluttered interfaces that handle complex data gracefully

---

## Color Palette

### Dark Mode (Primary)
- **Background Base**: 222 15% 8% (deep charcoal)
- **Surface Elevated**: 222 15% 12% (slightly lighter panels)
- **Surface Highest**: 222 12% 16% (cards, modals)
- **Primary Brand**: 262 80% 60% (vibrant purple - processing/action)
- **Success**: 142 70% 45% (completed tasks, downloads ready)
- **Warning**: 38 92% 50% (low coins, processing alerts)
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 65%
- **Border Subtle**: 222 15% 20%

### Light Mode
- **Background Base**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Primary Brand**: 262 75% 55%
- **Text Primary**: 222 15% 15%
- **Text Secondary**: 222 10% 40%

---

## Typography

**Font Families**:
- **Primary (UI)**: 'Inter' - Clean, readable for data-heavy interfaces
- **Monospace (Stats/Counts)**: 'JetBrains Mono' - For coin counts, image counts, file sizes

**Hierarchy**:
- **Hero/Page Titles**: 2.5rem (40px), font-weight 700, letter-spacing -0.02em
- **Section Headers**: 1.5rem (24px), font-weight 600
- **Card Titles**: 1.125rem (18px), font-weight 600
- **Body Text**: 0.875rem (14px), font-weight 400, line-height 1.5
- **Small/Meta**: 0.75rem (12px), font-weight 500, text-secondary
- **Monospace Counts**: 0.875rem, font-weight 600

---

## Layout System

**Spacing Scale**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 24**
- Component padding: p-6 or p-8
- Section spacing: space-y-8 or space-y-12
- Card gaps: gap-4 or gap-6
- Page margins: px-6 lg:px-12

**Container Strategy**:
- Max width: max-w-7xl for main content
- Full bleed for galleries and upload zones
- Sidebar width: 280px (template categories, filters)

**Grid Patterns**:
- Template Gallery: grid-cols-2 md:grid-cols-4 lg:grid-cols-6 (thumbnail grid)
- Dashboard Cards: grid-cols-1 md:grid-cols-3 (stats, actions)
- Upload Area: Full-width dropzone with centered content

---

## Component Library

### Navigation
**Top Bar** (sticky, backdrop-blur):
- Logo + Platform name (left)
- Search templates (center, expandable)
- Coin balance display (right) + User avatar dropdown
- Height: h-16, border-b border-subtle

**Sidebar Navigation** (collapsible):
- Icons + labels for: Dashboard, Templates, Upload, History, Wallet
- Active state: bg-surface-highest with left border-l-2 border-primary
- Width: w-64 collapsed to w-16 (icon-only)

### Cards & Panels
**Template Card**:
- Aspect ratio: 4:3 or 1:1
- Hover: subtle scale (1.02) + shadow-lg
- Content: thumbnail, name, category tag
- Selected state: ring-2 ring-primary

**Stats Card**:
- Icon (top-left), value (large, monospace), label (below)
- Background: surface-elevated
- Border: border border-subtle
- Padding: p-6

**Upload Dropzone**:
- Dashed border when empty: border-2 border-dashed border-subtle
- Active drag: border-primary bg-primary/5
- Min height: min-h-[400px]
- Center content with upload icon + text

### Forms & Inputs
**File Input**:
- Custom styled with drag-and-drop
- File type badges (JPG/PNG/ZIP)
- Progress indicators (linear, per file)

**Template Search/Filter**:
- Search bar: bg-surface-elevated, rounded-lg, with icon
- Filter chips: rounded-full, bg-surface-highest, clickable
- Active filter: bg-primary text-white

### Processing & Progress
**Batch Progress Bar**:
- Two-tone: completed (primary) + remaining (border-subtle)
- Height: h-2, rounded-full
- Live count overlay: "Processing 243/1000"

**Status Indicators**:
- Queue: border-l-4 border-warning
- Processing: border-l-4 border-primary with animated pulse
- Complete: border-l-4 border-success
- Failed: border-l-4 border-red-500

**Job Cards**:
- Timestamp, image count, template used, status badge
- Quick actions: View, Re-process, Download
- Expandable to show individual image status

### Modals & Overlays
**Template Preview Modal**:
- Full-screen overlay (backdrop-blur)
- Centered card: max-w-4xl
- Large preview + metadata + "Use Template" CTA

**Coin Purchase Modal**:
- Pricing tiers in grid (3 columns)
- Highlight "Best Value" option
- Payment integration (Stripe UI)

### Buttons & Actions
**Primary Action**: bg-primary hover:bg-primary/90, rounded-lg, px-6 py-3, font-semibold
**Secondary**: border border-primary text-primary hover:bg-primary/10
**Ghost**: text-secondary hover:text-primary hover:bg-surface-elevated

---

## Admin Panel Aesthetics

**Theme**: Darker surface colors to differentiate from user view
**Tables**: Dense, sortable, with row hover states
**Chart Integration**: Use Chart.js with primary color scheme
**Bulk Actions**: Fixed bottom bar with selected count + actions

---

## Animations

**Use Sparingly**:
- Template card hover: scale transition-transform duration-200
- Progress bars: smooth width transition duration-500
- Modal entry/exit: fade + scale animation (200ms)
- NO scroll animations, NO complex page transitions

---

## Images & Visual Assets

### Hero Section (Dashboard)
**Not Applicable** - This is a productivity tool, no marketing hero needed. Dashboard opens directly to action cards.

### Template Thumbnails
- Source: Admin-uploaded template backgrounds
- Display: High-quality JPG/PNG, optimized for web
- Placeholder: Gradient from primary to surface color with icon

### Empty States
- Upload zone: Large upload cloud icon (Heroicons)
- No templates: "Browse templates" illustration (simple line art)
- No history: Clock icon with "No jobs yet" message

### Processing Visualization
- Animated gradient background (subtle) on active job cards
- Thumbnail previews in processing queue (before/after comparison)

---

## Responsive Behavior

**Mobile** (< 768px):
- Collapse sidebar to bottom tab bar
- Stack template grid to 2 columns
- Full-width upload dropzone
- Sticky header with coin balance

**Tablet** (768px - 1024px):
- Sidebar stays visible (icon-only)
- Template grid: 4 columns
- Side-by-side processing list + details

**Desktop** (> 1024px):
- Full sidebar with labels
- Template grid: 6 columns
- Multi-panel layout (sidebar + main + preview)

---

## Key UX Patterns

1. **Upload Flow**: Single action opens multi-step wizard (Select Template → Upload Files → Configure → Process)
2. **Template Discovery**: Category filters (left) + search (top) + trending/recent tabs
3. **Batch Management**: Expandable job cards with individual image status
4. **Coin System**: Always-visible balance in header, inline warnings before actions
5. **Download Options**: Individual files or bulk ZIP, with preview before download

This design system creates a fast, professional, data-dense interface optimized for bulk image processing workflows while maintaining visual polish appropriate for an enterprise SaaS platform.