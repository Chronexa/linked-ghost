# ContentPilot AI - LinkedIn Content Engine

> **Your AI-powered LinkedIn ghostwriter that sounds authentically you**

Transform industry news, insights, and data into engaging LinkedIn posts in under 3 minutes.

---

## 🎯 Project Status

### ✅ **Frontend: COMPLETE** (14 pages, design system, components)
### ✅ **Backend Infrastructure: COMPLETE** (database, auth, Redis)
### ✅ **API Endpoints: COMPLETE** (27 endpoints, Phases 1-2)
### ✅ **AI Integration: COMPLETE** (Phase 2) 🎉
- ✅ Voice Analysis with OpenAI embeddings
- ✅ Similarity scoring & consistency calculation
- ✅ Draft Generation with GPT-4o (3 variants, voice matching)
- ✅ Topic Classification with GPT-4o-mini (batch processing, auto-review)
- ✅ Perplexity Integration (content discovery, research mode)
### 🔄 **Next: Background Jobs** (Phase 3)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### 1. Clone & Install
```bash
git clone <your-repo>
cd linkedin-automation
npm install
```

### 2. Set Up Backend Infrastructure
Follow the setup guide to configure external services:

```bash
# Open the setup checklist
cat SETUP-CHECKLIST.md

# Or the detailed guide
cat BACKEND-SETUP-GUIDE.md
```

**Required Services:**
- Supabase (Database)
- Clerk (Authentication)
- Upstash Redis (Cache)
- OpenAI (AI)
- Perplexity (Research)

### 3. Configure Environment
```bash
# Copy template
cp .env.example .env.local

# Fill in your API keys
nano .env.local

# Verify configuration
npm run check-env
```

### 4. Deploy Database Schema
```bash
# Generate migrations
npm run db:generate

# Push to database
npm run db:push

# Verify tables created
npm run db:studio
```

### 5. Start Development Server
```bash
npm run dev
# Visit: http://localhost:3000
```

---

## 📁 Project Structure

```
linkedin-automation/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (sign-in, sign-up)
│   ├── (app)/                    # Protected app pages
│   │   ├── dashboard/            # Main dashboard
│   │   ├── topics/               # Topics management
│   │   ├── drafts/               # Drafts editor
│   │   ├── pillars/              # Content pillars
│   │   ├── voice/                # Voice training
│   │   ├── analytics/            # Analytics dashboard
│   │   └── settings/             # User settings
│   ├── api/                      # API routes (23 endpoints - COMPLETE)
│   ├── globals.css               # Global styles + design system
│   └── layout.tsx                # Root layout with fonts
│
├── components/
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       └── index.ts
│
├── lib/
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle schema (9 tables)
│   │   └── index.ts              # DB client
│   ├── redis/                    # Redis cache layer
│   │   └── index.ts              # Redis client + helpers
│   ├── ai/                       # ✅ AI integration
│   │   ├── openai.ts             # OpenAI client wrapper
│   │   ├── embeddings.ts         # Embeddings & voice analysis
│   │   ├── generation.ts         # Draft generation with GPT-4o
│   │   ├── classification.ts     # Topic classification with GPT-4o-mini
│   │   └── perplexity.ts         # Perplexity content discovery (NEW!)
│   ├── api/                      # API utilities
│   │   ├── response.ts           # Standardized responses
│   │   ├── validate.ts           # Request validation
│   │   ├── with-auth.ts          # Auth wrapper
│   │   └── rate-limit.ts         # Rate limiting
│   └── utils.ts                  # Utility functions
│
├── scripts/                      # Setup and test scripts
│   ├── check-env.ts              # Environment validation
│   ├── test-db.ts                # Database connection test
│   ├── test-redis.ts             # Redis connection test
│   ├── test-voice-analysis.ts    # ✅ Voice analysis test
│   ├── test-draft-generation.ts  # ✅ Draft generation test
│   ├── test-topic-classification.ts # ✅ Topic classification test
│   └── test-perplexity.ts        # ✅ Perplexity integration test (NEW!)
│
├── docs/                         # Documentation
│   ├── 00-EXECUTIVE-SUMMARY.md
│   ├── 01-PRODUCT-REQUIREMENTS.md
│   ├── 02-TECHNICAL-ARCHITECTURE.md
│   ├── 03-DATABASE-SCHEMA.md
│   ├── 04-API-SPECIFICATION.md
│   ├── 05-DEVELOPMENT-ROADMAP.md
│   ├── 06-SECURITY-COMPLIANCE.md
│   ├── AI-INTEGRATION.md          # ✅ AI integration guide
│   └── DRAFT-GENERATION.md        # ✅ Draft generation guide (NEW!)
│
├── BACKEND-SETUP-GUIDE.md        # Complete setup instructions
├── SETUP-CHECKLIST.md            # Interactive setup checklist
├── SETUP-SUMMARY.md              # Quick summary
├── DESIGN-SYSTEM-COMPLETE.md     # Design system docs
└── README.md                     # This file
```

---

## 🎨 Tech Stack

### **Frontend**
- Next.js 14 (App Router)
- TypeScript (Strict Mode)
- Tailwind CSS (Custom Design System)
- React Server Components
- Clerk (Authentication)

### **Backend**
- Next.js API Routes
- Drizzle ORM
- PostgreSQL (Supabase)
- Redis (Upstash)
- OpenAI GPT-4 Turbo
- Perplexity API

### **Infrastructure**
- Vercel (Hosting)
- Supabase (Database)
- Upstash (Redis)
- GitHub Actions (CI/CD)

---

## 🗄️ Database Schema

8 core tables:
1. **users** - User accounts
2. **profiles** - User profiles
3. **pillars** - Content pillars
4. **voice_examples** - Voice training posts
5. **raw_topics** - Discovered content
6. **classified_topics** - AI-classified topics
7. **generated_drafts** - AI-generated posts
8. **subscriptions** - Subscription data

See `docs/03-DATABASE-SCHEMA.md` for details.

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Deploy schema
npm run db:studio        # Open Drizzle Studio
npm run db:test          # Test connection

# Testing
npm run check-env        # Validate environment vars
npm run redis:test       # Test Redis connection
npm run setup            # Run all setup tests
```

---

## 🎯 Development Roadmap

### ✅ Phase 0: Foundation (Week 1-2) - COMPLETE
- [x] Next.js 14 project setup
- [x] Design system implementation
- [x] 12 frontend pages
- [x] Component library
- [x] Database schema
- [x] Redis client
- [x] Documentation

### ⏳ Phase 1: MVP Core (Week 3-6) - NOT STARTED
- [ ] API endpoints (pillars, topics, drafts, voice)
- [ ] Clerk authentication integration
- [ ] OpenAI integration
- [ ] Perplexity integration
- [ ] Background jobs (BullMQ)

### 📅 Phase 2: Content Generation (Week 7-9)
- [ ] Voice analysis system
- [ ] Draft generation system
- [ ] AI classification
- [ ] Daily research cron

### 🚀 Phase 3: Polish & Launch (Week 10-11)
- [ ] Stripe payments
- [ ] Analytics dashboard
- [ ] E2E testing
- [ ] Production deployment

See `docs/05-DEVELOPMENT-ROADMAP.md` for details.

---

## 📚 Documentation

### **Setup Guides**
- `SETUP-CHECKLIST.md` - Step-by-step setup checklist
- `BACKEND-SETUP-GUIDE.md` - Detailed setup instructions
- `SETUP-SUMMARY.md` - Quick summary

### **Technical Documentation**
- `docs/00-EXECUTIVE-SUMMARY.md` - Product overview
- `docs/02-TECHNICAL-ARCHITECTURE.md` - System architecture
- `docs/03-DATABASE-SCHEMA.md` - Database design
- `docs/04-API-SPECIFICATION.md` - API endpoints
- `docs/05-DEVELOPMENT-ROADMAP.md` - Implementation plan

### **Design Documentation**
- `DESIGN-SYSTEM-COMPLETE.md` - Design system specs
- `DESIGN-SYSTEM.md` - Design tokens and usage
- `VISUAL-TRANSFORMATION.md` - Before/After comparisons

---

## 🎨 Design System

### **"Warm Confidence" Brand Identity**

**Colors:**
- Primary: Burnt Sienna (#C1502E)
- Background: Warm Paper (#FFFCF2)
- Text: Charcoal (#1A1A1D)

**Typography:**
- Display: Space Grotesk (headings)
- Body: Inter (text, UI)

**Components:**
- Button (4 variants, 3 sizes)
- Card (composable system)
- Badge (5 semantic variants)
- Input/Textarea (with validation)

See `DESIGN-SYSTEM-COMPLETE.md` for full specs.

---

## 🔐 Environment Variables

Required for development:

```bash
# Database
DATABASE_URL=                    # Supabase (pooled)

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Cache
REDIS_URL=                       # Upstash Redis

# AI Services
OPENAI_API_KEY=
PERPLEXITY_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=             # http://localhost:3000
```

See `.env.example` for full template.

---

## 🧪 Testing

```bash
# Environment validation
npm run check-env

# Database connection
npm run db:test

# Redis connection
npm run redis:test

# Run all tests
npm run setup
```

---

## 📈 Current Metrics

### **Frontend**
- ✅ 12 pages implemented
- ✅ 5 UI components
- ✅ Zero ESLint errors
- ✅ 100% design system coverage
- ✅ Mobile responsive
- ✅ WCAG AA accessible

### **Backend**
- ✅ 8 database tables defined
- ✅ Type-safe schema
- ✅ Redis cache layer
- ✅ Rate limiting helpers
- ✅ Connection test scripts
- ⏳ API endpoints (Phase 1)

---

## 🤝 Contributing

### Setup Development Environment

1. Follow `SETUP-CHECKLIST.md`
2. Run `npm run setup` to verify
3. Create feature branch
4. Make changes
5. Run `npm run lint`
6. Submit PR

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

---

## 📄 License

Private project - All rights reserved

---

## 🆘 Support

### **Getting Started**
1. Read `SETUP-CHECKLIST.md` first
2. Follow `BACKEND-SETUP-GUIDE.md` for detailed steps
3. Run diagnostic scripts if issues occur

### **Common Issues**
- Environment variables: `npm run check-env`
- Database connection: `npm run db:test`
- Redis connection: `npm run redis:test`

### **Documentation**
- Technical questions: See `docs/` folder
- Setup issues: See `BACKEND-SETUP-GUIDE.md`
- Design questions: See `DESIGN-SYSTEM-COMPLETE.md`

---

## 🎯 What's Next?

### **Immediate (You):**
1. 📋 Follow `SETUP-CHECKLIST.md`
2. ⚙️ Configure `.env.local` with API keys
3. 🗄️ Deploy database schema
4. ✅ Run tests to verify

### **Phase 1 (Week 3-4):**
1. Build API endpoints
2. Implement authentication
3. Connect AI services
4. Test end-to-end

### **Phase 2 (Week 5-8):**
1. AI classification system
2. Draft generation system
3. Background jobs
4. Daily research cron

---

## 📞 Contact

For questions or issues, refer to the documentation or create an issue.

---

**🚀 Ready to start? Open `SETUP-CHECKLIST.md` and begin!**

---

## 🙏 Acknowledgments

Built with:
- Next.js 14
- Drizzle ORM
- Tailwind CSS
- Clerk
- OpenAI
- Perplexity AI
- Supabase
- Upstash

---

**Last Updated:** February 10, 2026  
**Version:** 0.1.0 (MVP Development)  
**Status:** Backend Infrastructure Setup Phase
