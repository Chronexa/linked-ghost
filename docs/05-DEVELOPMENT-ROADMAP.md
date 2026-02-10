# Development Roadmap
## ContentPilot AI - Implementation Plan

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Document Owner:** CTO

---

## 1. Development Phases Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 0: Foundation (2 weeks)                                   │
│  - Project setup, database schema, authentication              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: MVP Core (4 weeks)                                     │
│  - Onboarding, Perplexity integration, AI classification       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 2: Content Generation (3 weeks)                           │
│  - Voice training, draft generation, dashboard                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 3: Polish & Launch (2 weeks)                              │
│  - Payments, analytics, testing, deployment                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Phase 4: Post-Launch (Ongoing)                                  │
│  - User feedback, iterations, new features                     │
└─────────────────────────────────────────────────────────────────┘
```

**Total Timeline**: 11 weeks to MVP launch

---

## 2. Phase 0: Foundation (Week 1-2)

### Week 1: Project Setup

**Goals**: 
- Set up development environment
- Initialize codebase
- Configure CI/CD

#### Day 1-2: Environment Setup
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Tailwind CSS and component library (shadcn/ui)
- [ ] Configure ESLint, Prettier, TypeScript strict mode
- [ ] Set up Git repository and branching strategy
- [ ] Create GitHub Actions CI/CD pipeline
- [ ] Configure Vercel for deployments (preview + production)

#### Day 3-4: Database & ORM
- [ ] Set up Supabase project (PostgreSQL)
- [ ] Install and configure Drizzle ORM
- [ ] Create initial database schema (see 03-DATABASE-SCHEMA.md)
- [ ] Write and test database migrations
- [ ] Set up connection pooling
- [ ] Create database seed scripts for development

#### Day 5: Authentication
- [ ] Integrate Clerk for authentication
- [ ] Set up sign-up/sign-in pages
- [ ] Configure OAuth providers (Google, LinkedIn)
- [ ] Implement auth middleware for protected routes
- [ ] Create user sync webhook (Clerk → PostgreSQL)
- [ ] Test auth flow end-to-end

**Deliverables**:
- ✅ Working Next.js app with authentication
- ✅ Database schema deployed
- ✅ CI/CD pipeline operational

---

### Week 2: Core Infrastructure

**Goals**:
- Set up external services
- Build base API structure
- Create reusable components

#### Day 1-2: External Services Integration
- [ ] Set up OpenAI API integration
- [ ] Set up Perplexity API integration
- [ ] Configure Redis (Upstash) for caching
- [ ] Set up BullMQ for background jobs
- [ ] Configure Sentry for error tracking
- [ ] Set up PostHog for analytics

#### Day 3-4: API Foundation
- [ ] Create API route structure (`/api/...`)
- [ ] Build API middleware (auth, rate limiting, error handling)
- [ ] Implement standard response format
- [ ] Create Zod validation schemas
- [ ] Write API utility functions (helpers, errors)
- [ ] Set up API testing framework (Vitest)

#### Day 5: UI Components
- [ ] Install shadcn/ui components
- [ ] Create app layout with navigation
- [ ] Build reusable UI components (Button, Card, Input, etc.)
- [ ] Set up loading states and skeletons
- [ ] Create error boundary components
- [ ] Design system tokens (colors, spacing, typography)

**Deliverables**:
- ✅ All external services connected
- ✅ API infrastructure ready
- ✅ Component library established

---

## 3. Phase 1: MVP Core (Week 3-6)

### Week 3: Onboarding Flow

**Goals**: 
- Build 4-step onboarding wizard
- Voice example collection
- Pillar setup

#### Day 1-2: Onboarding UI
- [ ] Build Step 1: Welcome screen
- [ ] Build Step 2: Content pillars input (dynamic add/remove)
- [ ] Build Step 3: Voice training (paste posts)
- [ ] Build Step 4: Source configuration
- [ ] Implement step navigation and progress bar
- [ ] Add form validation with Zod

#### Day 3-4: Onboarding API
- [ ] `POST /api/pillars` - Create pillars
- [ ] `POST /api/voice/examples` - Save voice examples
- [ ] `PATCH /api/user/sources` - Configure sources
- [ ] `POST /api/voice/analyze` - Analyze voice profile
- [ ] Database operations for pillars and voice examples

#### Day 5: Voice Analysis
- [ ] Implement OpenAI embeddings for voice examples
- [ ] Calculate voice confidence score
- [ ] Store embeddings in PostgreSQL (pgvector)
- [ ] Test voice analysis accuracy
- [ ] Create admin tool to view voice profiles

**Deliverables**:
- ✅ Complete onboarding flow
- ✅ Voice training working
- ✅ Pillars created

---

### Week 4: Content Discovery

**Goals**:
- Perplexity integration
- Daily research automation
- Topic storage

#### Day 1-2: Perplexity Integration
- [ ] Create Perplexity API client
- [ ] Build prompt templates for research
- [ ] Implement topic extraction and deduplication
- [ ] Error handling and retry logic
- [ ] Test with real queries

#### Day 3-4: Cron Job - Daily Research
- [ ] `POST /api/cron/daily-research` endpoint
- [ ] Fetch all active users and their pillars
- [ ] Query Perplexity for each user
- [ ] Parse and store topics in `raw_topics` table
- [ ] Set up Vercel Cron (6 AM daily)
- [ ] Add monitoring and alerts

#### Day 5: Topics UI
- [ ] Build topics list page (`/dashboard`)
- [ ] Display pending topics with source badges
- [ ] Add filters (pillar, date, source)
- [ ] Implement pagination
- [ ] Real-time updates (SSE or polling)

**Deliverables**:
- ✅ Perplexity integration working
- ✅ Daily cron job running
- ✅ Topics visible in UI

---

### Week 5: AI Classification

**Goals**:
- Classify topics by pillar
- Score content quality
- Filter low-quality topics

#### Day 1-2: Classification Logic
- [ ] Build prompt template for classification
- [ ] Implement OpenAI GPT-4 classification
- [ ] Parse classification response (pillar, score, hook_angle)
- [ ] Store results in `classified_topics` table
- [ ] Archive topics with score < 70

#### Day 3: Classification Job
- [ ] Create BullMQ job for classification
- [ ] `POST /api/cron/classify-topics` endpoint
- [ ] Process raw topics in batches (10 at a time)
- [ ] Update topic status (new → classified)
- [ ] Add retry logic for failed classifications

#### Day 4-5: Classification UI
- [ ] Show AI score on topic cards
- [ ] Display suggested pillar with badge
- [ ] Add ability to override pillar classification
- [ ] Show reasoning/explanation tooltip
- [ ] Filter topics by score range

**Deliverables**:
- ✅ AI classification working
- ✅ Topics categorized by pillar
- ✅ Low-quality topics filtered

---

### Week 6: Testing & Refinement

**Goals**:
- End-to-end testing
- Bug fixes
- Performance optimization

#### Day 1-2: Testing
- [ ] Write unit tests for API routes (80% coverage)
- [ ] Write integration tests for cron jobs
- [ ] E2E tests for onboarding flow (Playwright)
- [ ] Test edge cases (no pillars, no voice examples)
- [ ] Load testing (simulate 100 concurrent users)

#### Day 3-4: Bug Fixes & Polish
- [ ] Fix bugs found in testing
- [ ] Optimize slow database queries
- [ ] Improve error messages
- [ ] Add loading states everywhere
- [ ] Responsive design fixes

#### Day 5: Documentation
- [ ] Write API documentation (Swagger)
- [ ] Create developer README
- [ ] Document environment variables
- [ ] Write deployment guide

**Deliverables**:
- ✅ Test coverage > 80%
- ✅ All critical bugs fixed
- ✅ Documentation complete

---

## 4. Phase 2: Content Generation (Week 7-9)

### Week 7: Draft Generation

**Goals**:
- Generate 3 post variants
- Voice matching
- Store drafts

#### Day 1-2: Generation Logic
- [ ] Build draft generation prompt
- [ ] Fetch pillar-specific voice examples
- [ ] Implement GPT-4 Turbo generation
- [ ] Parse response (hook, body, cta, hashtags)
- [ ] Generate 3 variants (A, B, C)
- [ ] Store in `generated_drafts` table

#### Day 3: Generation API
- [ ] `POST /api/topics/:id/generate` endpoint
- [ ] Stream generation progress (SSE)
- [ ] Handle concurrent generation limits
- [ ] Implement regeneration logic
- [ ] Track usage for billing

#### Day 4-5: Generation UI
- [ ] "Generate Post" button on topic cards
- [ ] Show loading state during generation
- [ ] Display 3 variants side-by-side
- [ ] Show character count per variant
- [ ] Add "Regenerate" button

**Deliverables**:
- ✅ Draft generation working
- ✅ 3 variants per topic
- ✅ Voice matching accurate

---

### Week 8: Draft Management

**Goals**:
- Edit drafts
- Approve/reject flow
- Draft history

#### Day 1-2: Draft Editor
- [ ] Build draft detail page (`/drafts/:id`)
- [ ] Rich text editor (or simple textarea)
- [ ] Live character count
- [ ] Save draft edits
- [ ] Track edit history

#### Day 3-4: Approval Flow
- [ ] `POST /api/drafts/:id/approve` endpoint
- [ ] `POST /api/drafts/:id/reject` endpoint
- [ ] Update draft status
- [ ] Increment usage counter
- [ ] Check subscription limits
- [ ] Add confirmation modals

#### Day 5: Drafts List
- [ ] Build drafts page (`/drafts`)
- [ ] Filter by status (draft, approved, rejected)
- [ ] Sort by date, pillar
- [ ] Bulk actions (approve multiple)
- [ ] Export approved drafts

**Deliverables**:
- ✅ Draft editing working
- ✅ Approval flow complete
- ✅ Draft management UI polished

---

### Week 9: Dashboard & Analytics

**Goals**:
- Main dashboard
- Stats and metrics
- User experience polish

#### Day 1-2: Dashboard Layout
- [ ] Build main dashboard (`/dashboard`)
- [ ] Two-column layout (topics + drafts)
- [ ] Top stats bar (pending topics, drafts awaiting approval)
- [ ] Recent activity feed
- [ ] Quick actions (generate, approve)

#### Day 3: Dashboard Data
- [ ] Fetch dashboard stats (SQL views)
- [ ] Real-time updates (SSE or polling)
- [ ] Cache dashboard data (Redis, 5 min TTL)
- [ ] Optimize queries (N+1 prevention)

#### Day 4-5: Analytics (Basic)
- [ ] Build analytics page (`/analytics`)
- [ ] Show posts generated this month
- [ ] Posts by pillar (pie chart)
- [ ] Voice confidence score trend
- [ ] Export data as CSV

**Deliverables**:
- ✅ Dashboard fully functional
- ✅ Real-time updates working
- ✅ Basic analytics available

---

## 5. Phase 3: Polish & Launch (Week 10-11)

### Week 10: Payments & Subscriptions

**Goals**:
- Stripe integration
- Subscription management
- Usage limits

#### Day 1-2: Stripe Setup
- [ ] Create Stripe account (test + live mode)
- [ ] Set up products and pricing
- [ ] Build Stripe checkout flow
- [ ] Implement webhook handler (`/api/webhooks/stripe`)
- [ ] Sync subscriptions to database

#### Day 3: Subscription UI
- [ ] Build pricing page (`/pricing`)
- [ ] Build settings/billing page
- [ ] Show current plan and usage
- [ ] Upgrade/downgrade flow
- [ ] Cancel subscription flow

#### Day 4-5: Usage Limits
- [ ] Enforce post limits per plan
- [ ] Enforce regeneration limits
- [ ] Show usage warnings (80% limit)
- [ ] Upgrade prompts in UI
- [ ] Block actions when limit reached

**Deliverables**:
- ✅ Stripe integration complete
- ✅ Subscription management working
- ✅ Usage limits enforced

---

### Week 11: Final Polish & Launch

**Goals**:
- Performance optimization
- Security audit
- Production deployment

#### Day 1: Performance
- [ ] Optimize bundle size (code splitting)
- [ ] Add image optimization (Next.js Image)
- [ ] Implement caching strategy
- [ ] Database query optimization
- [ ] Lighthouse score > 90

#### Day 2: Security
- [ ] Security audit (Snyk, npm audit)
- [ ] Rate limiting on all endpoints
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] SQL injection prevention

#### Day 3: Testing
- [ ] Full E2E regression testing
- [ ] User acceptance testing (UAT) with beta users
- [ ] Performance testing (load, stress)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

#### Day 4: Deployment
- [ ] Set up production environment (Vercel)
- [ ] Configure production database (Supabase)
- [ ] Set up monitoring (Sentry, Better Stack)
- [ ] Configure backups
- [ ] Create status page (BetterUptime)
- [ ] Set up alerts (PagerDuty)

#### Day 5: Launch
- [ ] Deploy to production
- [ ] Smoke tests on production
- [ ] Launch to beta users (50 people)
- [ ] Monitor for issues
- [ ] Gather initial feedback

**Deliverables**:
- ✅ Production-ready application
- ✅ Successfully launched to beta
- ✅ Monitoring in place

---

## 6. Phase 4: Post-Launch (Week 12+)

### Month 1: Stabilization

**Goals**: Fix bugs, improve UX, onboard users

#### Week 12-13: Bug Fixes
- [ ] Monitor error logs (Sentry)
- [ ] Fix critical bugs (P0)
- [ ] Improve error messages
- [ ] Optimize slow queries
- [ ] Improve onboarding conversion

#### Week 14-15: Feedback Loop
- [ ] Conduct user interviews (10 users)
- [ ] Analyze user behavior (PostHog)
- [ ] Identify drop-off points
- [ ] Prioritize feature requests
- [ ] Improve voice matching based on feedback

**Key Metrics to Track**:
- Activation rate (complete onboarding)
- Time to first post generation
- Approval rate (% of drafts approved)
- Retention (Day 7, Day 30)
- NPS score

---

### Month 2-3: Feature Expansion

**Priority 1 Features** (based on user feedback):

#### Reddit Integration
- [ ] Reddit API integration
- [ ] Subreddit monitoring
- [ ] Keyword tracking
- [ ] Extract trending discussions
- [ ] UI for Reddit configuration

#### Publishing Calendar
- [ ] Schedule posts for future dates
- [ ] Calendar view of scheduled posts
- [ ] Optimal time recommendations
- [ ] LinkedIn API integration (posting)
- [ ] Draft/scheduled/posted views

#### Enhanced Analytics
- [ ] Post performance tracking (from LinkedIn API)
- [ ] Engagement metrics (likes, comments, shares)
- [ ] Pillar performance comparison
- [ ] Best time to post analysis
- [ ] Content recommendations

---

### Month 4-6: Scaling

**Goals**: Handle growth, optimize costs, build moats

#### Platform Improvements
- [ ] Voice retraining (improve accuracy over time)
- [ ] Multi-variant testing (A/B testing posts)
- [ ] Collaboration features (agency plan)
- [ ] API access for power users
- [ ] Zapier integration

#### Infrastructure
- [ ] Migrate to microservices (if needed)
- [ ] Database sharding (if needed)
- [ ] Multi-region deployment
- [ ] CDN optimization
- [ ] Cost optimization (AI API usage)

#### Business
- [ ] SOC 2 Type II certification
- [ ] Enterprise sales (custom plans)
- [ ] Partner program (affiliates)
- [ ] Content marketing (blog, guides)
- [ ] Community building (Slack, Discord)

---

## 7. Team Structure

### MVP Team (Week 1-11)

| Role | Responsibilities | FTE |
|------|------------------|-----|
| **Full-Stack Engineer** | Frontend, backend, database | 1.0 |
| **CTO/Founder** | Architecture, AI integration, DevOps | 0.5 |
| **Designer** | UI/UX, branding, landing page | 0.3 |
| **QA Tester** | Testing, bug reporting | 0.2 |

**Total**: 2 FTE

### Growth Team (Month 4+)

| Role | Responsibilities | FTE |
|------|------------------|-----|
| **Frontend Engineer** | React, Next.js, UI polish | 1.0 |
| **Backend Engineer** | API, database, integrations | 1.0 |
| **AI Engineer** | Voice matching, prompt engineering | 1.0 |
| **Product Designer** | UX research, design system | 1.0 |
| **QA Engineer** | Automated testing, QA | 0.5 |
| **DevOps Engineer** | Infrastructure, monitoring | 0.5 |

**Total**: 5 FTE

---

## 8. Risk Management

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OpenAI API downtime | High | Medium | Implement Claude fallback |
| Database scaling issues | High | Low | Plan sharding strategy early |
| Security breach | Critical | Low | Regular audits, SOC 2 |
| Perplexity API changes | Medium | Medium | Monitor API updates, backup sources |
| Voice matching accuracy | High | Medium | Continuous improvement, user feedback |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | Critical | Medium | Beta testing, iterate fast |
| High churn rate | High | Medium | Focus on retention, quick wins |
| Competitors copy features | Medium | High | Build moats (voice quality, data) |
| AI costs too high | High | Low | Optimize prompts, use cheaper models |
| LinkedIn API restrictions | High | Low | Focus on generation, posting optional |

---

## 9. Success Metrics

### Week 2 (Foundation Complete)
- ✅ Authentication working
- ✅ Database deployed
- ✅ CI/CD operational

### Week 6 (MVP Core Complete)
- ✅ Onboarding flow complete
- ✅ Topics discovered daily
- ✅ AI classification working

### Week 9 (Content Generation Complete)
- ✅ Drafts generated successfully
- ✅ Voice matching 85%+ accuracy
- ✅ Dashboard functional

### Week 11 (Launch)
- ✅ 50 beta users onboarded
- ✅ 500+ posts generated
- ✅ 70% approval rate
- ✅ NPS > 40

### Month 3 (Growth)
- ✅ 500 paying users
- ✅ $30K MRR
- ✅ 80% monthly retention
- ✅ 3,000+ posts generated

### Month 6 (Scale)
- ✅ 2,000 paying users
- ✅ $100K MRR
- ✅ 85% monthly retention
- ✅ 20,000+ posts generated

---

## 10. Development Best Practices

### Code Quality
- [ ] Write tests for all new features (80% coverage)
- [ ] Code reviews for all PRs (2 approvals for main)
- [ ] TypeScript strict mode (no `any` types)
- [ ] ESLint + Prettier (auto-format on save)
- [ ] Git commit messages follow Conventional Commits

### Documentation
- [ ] Update API docs with new endpoints
- [ ] Write JSDoc for all functions
- [ ] Keep README.md up to date
- [ ] Document all environment variables
- [ ] Create runbooks for common operations

### Monitoring
- [ ] Log all errors to Sentry
- [ ] Track key metrics in PostHog
- [ ] Set up alerts for critical paths
- [ ] Monitor API response times
- [ ] Track AI generation costs

### Security
- [ ] Never commit secrets to Git
- [ ] Use environment variables for config
- [ ] Sanitize all user inputs
- [ ] Implement rate limiting
- [ ] Regular dependency updates (Dependabot)

---

## 11. Appendix: Tech Stack Checklist

### Frontend
- [x] Next.js 14
- [x] TypeScript
- [x] Tailwind CSS
- [x] shadcn/ui
- [ ] React Hook Form
- [ ] Zod validation
- [ ] Zustand (state)
- [ ] Tanstack Query (data fetching)

### Backend
- [x] Next.js API Routes
- [ ] Drizzle ORM
- [ ] PostgreSQL (Supabase)
- [ ] Redis (Upstash)
- [ ] BullMQ

### Authentication
- [ ] Clerk

### AI Services
- [ ] OpenAI API
- [ ] Perplexity API
- [ ] Anthropic Claude (backup)
- [ ] Pinecone (vectors)

### Payments
- [ ] Stripe

### Monitoring
- [ ] Sentry (errors)
- [ ] PostHog (analytics)
- [ ] Better Stack (logs)
- [ ] BetterUptime (status)

### DevOps
- [ ] Vercel (hosting)
- [ ] GitHub Actions (CI/CD)
- [ ] Docker (future)

---

**Document Approvals:**
- [ ] Engineering Team
- [ ] Product Manager
- [ ] CTO
- [ ] CEO/Founder
