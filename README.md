# Homebound - Home Buying Strategy Hub

**From Chaos to Closing** | Built with [Claude Code](https://claude.ai/claude-code)

Buying a home is probably the most complex "product" a person will ever acquire. Homebound transforms a fragmented, emotional, and data-heavy process into a structured, collaborative decision-making workflow.

## The Problem

The home-buying journey in Israel is scattered across Yad2 listings, WhatsApp messages from brokers, Excel sheets for mortgage calculations, and endless PDF documents. Information asymmetry and "FOMO" often lead to sub-optimal financial decisions. Couples and families argue about properties based on gut feelings rather than data.

## The Solution

A centralized **Decision Support System** that tracks properties, enables collaborative rating, and manages the entire funnel — from the first listing link to the final signature.

## Key Features

### Property Funnel Management
A status-driven tracker to move properties through: `New` > `Visited` > `Interested` > `Offer Made` > `Rejected` / `Archived`. One glance shows where every property stands.

### Smart URL Parsing
Paste a link from **Yad2**, **Madlan**, **Facebook Marketplace**, or any listing site — Homebound auto-extracts address, price, photos, beds, baths, sqm, floor, parking, and contact info. Supports OG tags, JSON-LD structured data, and regex fallback.

### Collaborative Rating Engine
Both partners rate each property independently across **Location**, **Condition**, **Value**, and **Overall**. The dashboard highlights **disagreements** (2+ star gap) so you can discuss what matters, not guess.

### Interactive Map
All properties plotted on a Leaflet map with status-colored pins. See your search geography at a glance and spot neighborhood clusters.

### Visit Checklists
Create property-specific inspection checklists before visits (plumbing, natural light, noise levels). Never forget to check the important stuff.

### Family Task Management
Assign to-dos to yourself or your partner with due dates and property links. Track who's handling what.

### Custom Fields & Tags
Every family's priorities are different. Add custom evaluation fields ("Proximity to school", "Garden size") and vibe tags ("Quiet street", "Near park") that fit your search.

### Multi-User Collaboration
Invite your partner via a unique family code. Both users see the same properties, ratings, and tasks — full transparency on the biggest transaction of your life.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript 5 (strict) |
| **Styling** | Tailwind CSS 4 |
| **UI** | Custom components + Headless UI |
| **Maps** | Leaflet + react-leaflet |
| **Data Fetching** | TanStack React Query 5 |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Auth** | Supabase Auth (SSR) |
| **Address Autocomplete** | Google Places API |
| **Unit Tests** | Vitest + React Testing Library |
| **E2E Tests** | Playwright (mobile-first, Pixel 7 target) |
| **Deployment** | Vercel |

## Development Methodology

**"Vibe Coding"** — Rapidly prototyped and iterated using Claude Code. Focused on user flow and business logic while leveraging AI for boilerplate, testing scaffolds, and component architecture.

## Product Thinking

**Objectivity over Emotion** — The rating engine forces rational comparison between properties that "feel" different. Stars don't lie.

**Full Transparency** — Shared access ensures both partners are aligned on data, not just vibes. Disagreement alerts surface conflicts early.

**Centralized Truth** — One single source of truth reduces cognitive load during the biggest transaction of your life.

**Mobile-First** — Designed for on-the-go use during property visits. Bottom tab navigation, responsive layouts, max-width 600px optimized.

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase and Google Places API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking properties.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:e2e:ui` | Playwright in UI mode |
| `npm run lint` | Run ESLint |

## Database Schema

Core entities: **Families** > **Profiles** > **Properties** > **Ratings** + **Visit Checklists** + **Tasks** + **Family Settings**

10 migrations manage schema evolution with RLS policies ensuring users only access their family's data.

## About the Builder

**Hadar Sapir** — Senior Product Manager & Builder with 11+ years of experience at Nestle, Kimberly-Clark, and startup scaling (0 to 100). I build tools that solve real-world friction using product thinking and AI-assisted development.
