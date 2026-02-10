# Technical Architecture Document
## ContentPilot AI - System Design

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Document Owner:** CTO

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  Web App (Next.js)  │  Mobile Web  │  Future: Native Apps       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CDN & EDGE LAYER                           │
│              Vercel Edge Network / Cloudflare                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │  Next.js 14     │  │  API Routes     │  │  Middleware    │ │
│  │  App Router     │  │  (REST/tRPC)    │  │  (Auth/Rate)   │ │
│  └─────────────────┘  └─────────────────┘  └────────────────┘ │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICES LAYER                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Auth Service │  │ AI Service   │  │  Content Service    │  │
│  │ (Clerk)      │  │ (OpenAI/LLM) │  │  (Business Logic)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │Queue Service │  │ Cron Service │  │  Search Service     │  │
│  │ (BullMQ)     │  │ (Vercel Cron)│  │  (Typesense)        │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   S3 / R2 Storage   │  │
│  │  (Supabase)  │  │   (Cache)    │  │   (File Uploads)    │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  OpenAI API  │  │ Perplexity   │  │   LinkedIn API      │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Stripe API  │  │  Resend      │  │   PostHog           │  │
│  │  (Payments)  │  │  (Email)     │  │   (Analytics)       │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5+
- **Styling**: Tailwind CSS 3.4+
- **State Management**: React Context + Zustand (for complex state)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Native fetch with React Server Components
- **Real-time**: Server-Sent Events (SSE) for live updates

#### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js API Routes (REST)
- **ORM**: Drizzle ORM (type-safe, performant)
- **Validation**: Zod schemas
- **API Documentation**: OpenAPI 3.0 + Swagger UI

#### Database
- **Primary DB**: PostgreSQL 16 (hosted on Supabase)
- **Cache**: Redis 7.2 (Upstash for serverless)
- **Search**: Typesense (full-text search for topics)
- **File Storage**: Cloudflare R2 (S3-compatible)

#### Authentication & Authorization
- **Auth Provider**: Clerk (handles OAuth, MFA, sessions)
- **Session Management**: JWT tokens (httpOnly cookies)
- **Role-Based Access**: Custom middleware + Clerk metadata

#### AI/ML Services
- **LLM Provider**: OpenAI (GPT-4 Turbo)
- **Backup LLM**: Anthropic Claude 3 (failover)
- **Content Discovery**: Perplexity API
- **Vector DB**: Pinecone (for voice embedding storage)

#### Background Jobs
- **Queue**: BullMQ with Redis
- **Cron Jobs**: Vercel Cron (for scheduled tasks)
- **Job Types**:
  - Daily content research
  - AI classification batch processing
  - Voice retraining
  - Analytics aggregation

#### Monitoring & Observability
- **APM**: Sentry (error tracking)
- **Analytics**: PostHog (product analytics)
- **Logging**: Better Stack (log aggregation)
- **Uptime**: BetterUptime (status page)
- **Tracing**: OpenTelemetry

#### DevOps & Infrastructure
- **Hosting**: Vercel (frontend + API routes)
- **CI/CD**: GitHub Actions
- **Container Registry**: Docker Hub (for future microservices)
- **Secrets Management**: Vercel Environment Variables + 1Password
- **Backups**: Automated daily backups to S3

---

## 2. System Components

### 2.1 Frontend Architecture

```
app/
├── (auth)/
│   ├── sign-in/
│   ├── sign-up/
│   └── layout.tsx
├── (marketing)/
│   ├── page.tsx                 # Landing page
│   ├── pricing/
│   └── layout.tsx
├── (app)/
│   ├── dashboard/
│   │   └── page.tsx             # Main dashboard
│   ├── onboarding/
│   │   └── page.tsx             # 4-step wizard
│   ├── topics/
│   │   ├── [id]/
│   │   │   └── page.tsx         # Topic detail + generation
│   │   └── page.tsx             # Topics list
│   ├── drafts/
│   │   ├── [id]/
│   │   │   └── page.tsx         # Draft editor
│   │   └── page.tsx             # Drafts list
│   ├── pillars/
│   │   └── page.tsx             # Manage pillars
│   ├── voice/
│   │   └── page.tsx             # Voice training examples
│   ├── settings/
│   │   ├── account/
│   │   ├── billing/
│   │   ├── sources/
│   │   └── page.tsx
│   └── layout.tsx               # App shell with nav
├── api/
│   ├── webhooks/
│   │   ├── clerk/               # Clerk user events
│   │   └── stripe/              # Stripe payment events
│   ├── cron/
│   │   ├── daily-research/      # Perplexity research
│   │   └── classify-topics/     # AI classification
│   ├── topics/
│   │   ├── route.ts             # GET /api/topics
│   │   ├── [id]/
│   │   │   ├── route.ts         # GET/PATCH /api/topics/:id
│   │   │   └── generate/
│   │   │       └── route.ts     # POST /api/topics/:id/generate
│   ├── drafts/
│   │   ├── route.ts             # GET/POST /api/drafts
│   │   └── [id]/
│   │       ├── route.ts         # GET/PATCH/DELETE /api/drafts/:id
│   │       └── approve/
│   │           └── route.ts     # POST /api/drafts/:id/approve
│   ├── pillars/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── voice/
│   │   ├── examples/
│   │   │   └── route.ts         # POST /api/voice/examples
│   │   └── analyze/
│   │       └── route.ts         # POST /api/voice/analyze
│   └── user/
│       ├── route.ts
│       └── subscription/
│           └── route.ts
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   ├── index.ts             # DB client
│   │   └── migrations/
│   ├── ai/
│   │   ├── openai.ts            # OpenAI client
│   │   ├── perplexity.ts        # Perplexity client
│   │   ├── voice-analyzer.ts    # Voice matching logic
│   │   └── classifiers.ts       # Content classification
│   ├── queue/
│   │   ├── index.ts             # BullMQ setup
│   │   └── jobs/                # Job definitions
│   ├── auth/
│   │   ├── clerk.ts             # Clerk helpers
│   │   └── middleware.ts        # Auth middleware
│   └── utils/
│       ├── validation.ts        # Zod schemas
│       ├── errors.ts            # Error classes
│       └── helpers.ts           # Utility functions
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/
│   ├── topics/
│   ├── drafts/
│   └── shared/
└── types/
    └── index.ts                 # Global TypeScript types
```

### 2.2 Database Schema Design

See `03-DATABASE-SCHEMA.md` for detailed schema.

Key tables:
- `users` - User accounts (synced from Clerk)
- `profiles` - User profiles for content generation
- `pillars` - Content pillars per user
- `voice_examples` - Training posts for voice matching
- `raw_topics` - Discovered content (before classification)
- `classified_topics` - Classified content ready for drafting
- `generated_drafts` - AI-generated post variants
- `subscriptions` - Stripe subscription data
- `usage_tracking` - API call tracking for billing

### 2.3 API Design Principles

#### RESTful Conventions
- Use HTTP verbs correctly (GET, POST, PATCH, DELETE)
- Resource-based URLs (`/api/topics/:id`, not `/api/getTopic`)
- Plural nouns for collections (`/api/drafts`, not `/api/draft`)
- Nested resources for relationships (`/api/topics/:id/generate`)

#### Response Format
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid pillar name",
    "details": [...]
  }
}
```

#### Rate Limiting
- **Anonymous**: 10 requests/minute
- **Authenticated**: 100 requests/minute
- **Premium**: 500 requests/minute
- Use Redis for rate limit counters

#### Versioning
- URL versioning: `/api/v1/topics` (future-proof)
- Current version (V1) doesn't need prefix yet

---

## 3. Data Flow Diagrams

### 3.1 Content Discovery Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   DAILY CRON JOB (6 AM)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
                 Get all active users
                         │
                         ↓
                For each user:
                         │
                         ↓
        ┌────────────────┴────────────────┐
        │  Get user's pillars + keywords  │
        └────────────────┬────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Query Perplexity API               │
        │  (last 24 hours, user's domain)     │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Parse response → Extract topics    │
        │  Deduplicate similar topics         │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Store in raw_topics table          │
        │  Status: "new"                      │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Trigger: AI Classification Job     │
        └─────────────────────────────────────┘
```

### 3.2 AI Classification Flow

```
┌─────────────────────────────────────────────────────────────┐
│           QUEUE JOB: Classify Topic (BullMQ)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Fetch raw topic from DB            │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Fetch user's pillars + prompts     │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴─────────────────────────┐
        │  LLM Call: Determine Pillar              │
        │  Input: topic content + pillar list      │
        │  Output: pillar name                     │
        └────────────────┬─────────────────────────┘
                         │
                         ↓
        ┌────────────────┴─────────────────────────┐
        │  LLM Call: Score & Classify              │
        │  Input: topic + pillar context           │
        │  Output: {                               │
        │    pillar: "Founder_Journey",            │
        │    score: 87,                            │
        │    hook_angle: "Emotional",              │
        │    reasoning: "..."                      │
        │  }                                       │
        └────────────────┬─────────────────────────┘
                         │
                         ↓
                   Score >= 70?
                         │
            ┌────────────┴────────────┐
            │                         │
           YES                       NO
            │                         │
            ↓                         ↓
    ┌───────────────┐        ┌──────────────┐
    │ Store in      │        │ Update status│
    │ classified_   │        │ to "archived"│
    │ topics table  │        └──────────────┘
    └───────┬───────┘
            │
            ↓
    ┌───────────────┐
    │ Update raw_   │
    │ topics status │
    │ to "classified"│
    └───────┬───────┘
            │
            ↓
    ┌───────────────┐
    │ Notify user   │
    │ (WebSocket/SSE)│
    └───────────────┘
```

### 3.3 Draft Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│           USER ACTION: Generate Post from Topic             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Fetch classified topic from DB     │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Fetch pillar configuration         │
        │  (tone, target audience, prompt)    │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴────────────────────┐
        │  Fetch voice examples (3-10)        │
        │  Filter by: pillar, status=active   │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────┴─────────────────────────┐
        │  LLM Call: Generate Variants             │
        │  Model: GPT-4 Turbo                      │
        │  Input:                                  │
        │    - Topic content                       │
        │    - Voice examples                      │
        │    - Pillar prompt                       │
        │    - Hook angle                          │
        │  Request: Generate 3 variants            │
        └────────────────┬─────────────────────────┘
                         │
                         ↓
        ┌────────────────┴─────────────────────────┐
        │  Parse LLM Response                      │
        │  Extract: hook, body, CTA, hashtags      │
        │  For each variant (A, B, C)              │
        └────────────────┬─────────────────────────┘
                         │
                         ↓
        ┌────────────────┴─────────────────────────┐
        │  Store in generated_drafts table         │
        │  Status: "draft"                         │
        │  Link to: topic_id, user_id, pillar_id   │
        └────────────────┬─────────────────────────┘
                         │
                         ↓
        ┌────────────────┴─────────────────────────┐
        │  Return drafts to frontend               │
        │  Stream response (SSE) for real-time UX  │
        └──────────────────────────────────────────┘
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
User Login Request
    ↓
Clerk Hosted UI (OAuth/Email)
    ↓
Clerk validates credentials
    ↓
Issue JWT token (httpOnly cookie)
    ↓
Redirect to /dashboard
    ↓
Next.js middleware validates JWT
    ↓
Fetch user from DB (or create if new)
    ↓
Attach user context to request
    ↓
Render protected page
```

### 4.2 Authorization Strategy

**Role-Based Access Control (RBAC)**

| Role | Permissions |
|------|-------------|
| `user` | Read/write own data only |
| `admin` | Read all users, modify settings |
| `agency_owner` | Manage team members, all team data |
| `agency_member` | Read/write assigned profiles only |

**Implementation:**
```typescript
// Middleware checks
const user = await currentUser();
if (!user) return redirect('/sign-in');

// Check subscription tier
const subscription = await getSubscription(user.id);
if (!subscription.features.includes('reddit_integration')) {
  return { error: 'Upgrade to Growth plan' };
}

// Check resource ownership
const topic = await db.topics.findById(topicId);
if (topic.userId !== user.id) {
  return { error: 'Unauthorized' };
}
```

### 4.3 Data Protection

#### Encryption
- **At Rest**: PostgreSQL encryption (Supabase default)
- **In Transit**: TLS 1.3 for all API calls
- **Sensitive Fields**: Application-level encryption for API keys

#### PII Handling
- Email, name stored in Clerk (not our DB)
- User content is NOT encrypted (needed for AI processing)
- LinkedIn tokens encrypted before storage

#### Compliance
- **GDPR**: Right to deletion, data export
- **CCPA**: California privacy rights
- **SOC 2**: Year 1 goal (Q4 2026)

### 4.4 Rate Limiting & Abuse Prevention

```typescript
// Redis-based rate limiter
const rateLimiter = {
  anonymous: { requests: 10, window: '1m' },
  authenticated: { requests: 100, window: '1m' },
  premium: { requests: 500, window: '1m' },
};

// AI generation limits (cost control)
const generationLimits = {
  starter: { posts: 10, regenerations: 3 },
  growth: { posts: 30, regenerations: 10 },
  agency: { posts: Infinity, regenerations: Infinity },
};
```

---

## 5. Performance Optimization

### 5.1 Caching Strategy

**Redis Cache Layers:**

| Cache Key | TTL | Invalidation |
|-----------|-----|--------------|
| `user:{id}:profile` | 1 hour | On profile update |
| `user:{id}:pillars` | 30 min | On pillar CRUD |
| `topic:{id}` | 5 min | On topic update |
| `drafts:pending:{userId}` | 2 min | On draft creation |

**CDN Caching:**
- Static assets: 1 year (`Cache-Control: public, max-age=31536000, immutable`)
- API responses: No cache (dynamic data)
- Landing page: 1 hour (`Cache-Control: public, max-age=3600`)

### 5.2 Database Optimization

**Indexes:**
```sql
-- Hot path queries
CREATE INDEX idx_topics_user_status ON classified_topics(user_id, status);
CREATE INDEX idx_drafts_status_created ON generated_drafts(status, created_at DESC);
CREATE INDEX idx_voice_examples_pillar ON voice_examples(pillar_id, status);

-- Full-text search
CREATE INDEX idx_topics_content_fts ON classified_topics 
  USING GIN(to_tsvector('english', content));
```

**Connection Pooling:**
- Supabase Pooler: 100 connections
- Drizzle ORM: Connection pool size 20

**Query Optimization:**
- Use `SELECT` with specific columns (no `SELECT *`)
- Paginate all list queries (default 20 items)
- Use `JOIN` instead of N+1 queries

### 5.3 Serverless Optimization

**Cold Start Mitigation:**
- Keep API routes lightweight (< 250KB bundle)
- Use Edge Runtime where possible
- Implement connection warming for DB

**Memory Management:**
- Set Node.js memory limit: 1GB per function
- Use streaming for large AI responses
- Implement request timeouts (30s max)

---

## 6. Scalability Plan

### 6.1 Scaling Strategy

**Phase 1: MVP (0-1K users)**
- Monolithic Next.js app
- Single PostgreSQL instance
- Redis cache
- Vercel hosting (serverless)

**Phase 2: Growth (1K-10K users)**
- Database read replicas (Supabase read-only replicas)
- Separate Redis for cache vs. queue
- CDN for static assets (Cloudflare)
- Background job processing (BullMQ)

**Phase 3: Scale (10K-100K users)**
- Database sharding by user_id
- Microservices for AI processing (separate service)
- Multi-region deployment (US, EU)
- Kafka for event streaming
- Kubernetes for containerized workloads

### 6.2 Database Sharding

**Sharding Key:** `user_id`

```
Shard 0: user_id % 4 = 0
Shard 1: user_id % 4 = 1
Shard 2: user_id % 4 = 2
Shard 3: user_id % 4 = 3
```

**Global Tables (not sharded):**
- System configuration
- Pricing plans
- Feature flags

### 6.3 AI Cost Management

**Cost Projection:**
- Research: $0.01 per user/day (Perplexity)
- Classification: $0.002 per topic (GPT-4)
- Generation: $0.05 per draft (GPT-4 Turbo)

**Optimization:**
- Cache classification results (dedupe similar topics)
- Use GPT-3.5 for low-tier users
- Batch API calls where possible
- Implement token limits per tier

---

## 7. Disaster Recovery

### 7.1 Backup Strategy

**Database Backups:**
- Automated daily backups (Supabase)
- Point-in-time recovery (PITR) last 7 days
- Manual snapshots before major deployments
- Geo-redundant storage (S3)

**Application State:**
- Redis persistence: RDB snapshots every 6 hours
- Queue jobs: Durable, auto-retry on failure

### 7.2 Recovery Procedures

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 1 hour

**Incident Response:**
1. Alert on-call engineer (PagerDuty)
2. Assess severity (P0-P3)
3. Enable maintenance mode (if needed)
4. Restore from backup
5. Verify data integrity
6. Resume operations
7. Post-mortem within 48 hours

---

## 8. Deployment Strategy

### 8.1 CI/CD Pipeline

```
GitHub Push to `main`
    ↓
GitHub Actions Workflow Triggered
    ↓
Run Tests (Unit + Integration)
    ↓
Type Check (tsc --noEmit)
    ↓
Lint (ESLint)
    ↓
Build (Next.js production build)
    ↓
Run E2E Tests (Playwright)
    ↓
Deploy to Vercel (Preview)
    ↓
Smoke Tests
    ↓
Manual Approval (for prod)
    ↓
Deploy to Production
    ↓
Run Post-Deploy Checks
    ↓
Notify Team (Slack)
```

### 8.2 Environment Strategy

| Environment | Purpose | Branch | URL |
|-------------|---------|--------|-----|
| **Development** | Local dev | N/A | localhost:3000 |
| **Preview** | PR testing | feature/* | *.vercel.app |
| **Staging** | Pre-prod testing | develop | staging.contentpilot.ai |
| **Production** | Live users | main | app.contentpilot.ai |

### 8.3 Feature Flags

Use Vercel Edge Config for feature flags:

```typescript
const flags = {
  reddit_integration: { enabled: false }, // Coming soon
  linkedin_posting: { enabled: true },
  ai_model_v2: { enabled: false, rollout: 10 }, // 10% rollout
};
```

---

## 9. Monitoring & Alerting

### 9.1 Key Metrics

**Application Metrics:**
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- AI generation latency

**Business Metrics:**
- Daily active users (DAU)
- Posts generated per user
- Conversion rate (trial → paid)
- Churn rate

**Infrastructure Metrics:**
- CPU/Memory usage
- Database connections
- Redis hit rate
- Queue depth

### 9.2 Alerting Rules

| Alert | Threshold | Severity | Action |
|-------|-----------|----------|--------|
| API Error Rate > 5% | 5 min | P0 | Page on-call |
| DB CPU > 80% | 10 min | P1 | Auto-scale |
| Queue Depth > 1000 | 5 min | P2 | Investigate |
| AI Latency > 30s | 3 min | P1 | Check API status |

---

## 10. Open Technical Decisions

### 10.1 Decisions to Make

1. **tRPC vs REST API**: 
   - tRPC: Type-safe, better DX, tight coupling
   - REST: Standard, easier for mobile apps, decoupled
   - **Recommendation**: Start with REST, migrate to tRPC if needed

2. **Vector Database for Voice**:
   - Pinecone: Managed, expensive
   - Qdrant: Self-hosted, cheaper
   - PostgreSQL pgvector: Simple, less powerful
   - **Recommendation**: PostgreSQL pgvector for MVP, Pinecone later

3. **Real-time Updates**:
   - WebSockets: Bi-directional, complex
   - Server-Sent Events (SSE): Uni-directional, simpler
   - Polling: Simple, inefficient
   - **Recommendation**: SSE for notifications, polling for dashboard

4. **Multi-tenancy Strategy**:
   - Separate DB per tenant: Isolated, complex
   - Single DB with tenant_id: Simple, less isolated
   - **Recommendation**: Single DB with `user_id` separation (MVP)

---

## 11. Future Architecture

### 11.1 Microservices Roadmap

**Phase 3 (10K+ users) - Extract Services:**

1. **AI Service** (Python FastAPI)
   - Voice analysis
   - Content generation
   - Classification
   - Independent scaling

2. **Research Service** (Node.js)
   - Perplexity integration
   - Reddit scraping
   - Fireflies integration
   - Scheduled cron jobs

3. **Notification Service** (Node.js)
   - Email (Resend)
   - Push notifications
   - In-app notifications
   - Webhook deliveries

---

**Document Approvals:**
- [ ] Engineering Team
- [ ] DevOps Lead
- [ ] Security Officer
- [ ] CTO
