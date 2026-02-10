# Database Schema Design
## ContentPilot AI - Data Model

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Document Owner:** CTO

---

## 1. Overview

### 1.1 Database Technology
- **DBMS**: PostgreSQL 16
- **Hosting**: Supabase (managed PostgreSQL)
- **ORM**: Drizzle ORM (type-safe, lightweight)
- **Migrations**: Drizzle Kit

### 1.2 Design Principles
- Normalized to 3NF (with strategic denormalization)
- UUID primary keys for security
- Soft deletes where applicable
- Audit columns (created_at, updated_at)
- Foreign keys with cascading rules

---

## 2. Entity Relationship Diagram

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ 1:N
       ↓
┌──────────────┐         ┌───────────────────┐
│   profiles   │────────→│subscriptions      │
└──────┬───────┘ 1:1     └───────────────────┘
       │
       │ 1:N
       ├────────────────────┬────────────────────┬───────────────────┐
       │                    │                    │                   │
       ↓                    ↓                    ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   pillars    │    │voice_examples│    │  raw_topics  │    │usage_tracking│
└──────┬───────┘    └──────────────┘    └──────┬───────┘    └──────────────┘
       │                                        │
       │ 1:N                                    │ 1:1
       ↓                                        ↓
┌──────────────┐                        ┌──────────────────┐
│classified_   │←───────────────────────│                  │
│topics        │                        └──────────────────┘
└──────┬───────┘
       │
       │ 1:N
       ↓
┌──────────────────┐
│generated_drafts  │
└──────────────────┘
```

---

## 3. Table Definitions

### 3.1 users

**Purpose**: Core user accounts (synced from Clerk)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status) WHERE status = 'active';
```

**Columns:**
- `id`: Internal UUID primary key
- `clerk_id`: Clerk user ID (external reference)
- `email`: User email (from Clerk)
- `full_name`: Display name
- `avatar_url`: Profile picture URL
- `status`: Account status
- `created_at`: Registration timestamp
- `updated_at`: Last modification
- `deleted_at`: Soft delete timestamp

---

### 3.2 profiles

**Purpose**: User profiles for content generation (1:1 with users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linkedin_url VARCHAR(500),
  target_audience TEXT,
  writing_style TEXT,
  voice_confidence_score INTEGER DEFAULT 0 CHECK (voice_confidence_score >= 0 AND voice_confidence_score <= 100),
  last_voice_training_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profiles_user_id ON profiles(user_id);
```

**Columns:**
- `user_id`: Reference to users table
- `linkedin_url`: User's LinkedIn profile
- `target_audience`: Description of target audience
- `writing_style`: User's writing style description
- `voice_confidence_score`: AI confidence in voice match (0-100)
- `last_voice_training_at`: Last time voice was retrained
- `preferences`: JSON for user settings (notifications, theme, etc.)

---

### 3.3 subscriptions

**Purpose**: User subscription and billing information

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('starter', 'growth', 'agency')),
  status VARCHAR(50) NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
```

**Plan Limits (enforced in application):**

| Feature | Starter | Growth | Agency |
|---------|---------|--------|--------|
| Posts/month | 10 | 30 | Unlimited |
| Pillars | 2 | 5 | 10 |
| Regenerations | 3 | 10 | Unlimited |
| Voice Examples | 10 | 20 | 50 |

---

### 3.4 pillars

**Purpose**: User-defined content categories

```sql
CREATE TABLE pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  target_audience TEXT,
  tone VARCHAR(100),
  classification_prompt TEXT,
  generation_prompt TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pillars_user_id ON pillars(user_id);
CREATE INDEX idx_pillars_user_status ON pillars(user_id, status) WHERE status = 'active';
CREATE UNIQUE INDEX idx_pillars_user_slug ON pillars(user_id, slug);
```

**Example Data:**
```json
{
  "name": "Founder Journey",
  "slug": "founder_journey",
  "description": "Personal stories about building a startup",
  "tone": "authentic, vulnerable, inspiring",
  "classification_prompt": "Classify if this content relates to...",
  "generation_prompt": "Generate a post about...",
  "status": "active"
}
```

---

### 3.5 voice_examples

**Purpose**: User's past LinkedIn posts for voice training

```sql
CREATE TABLE voice_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar_id UUID REFERENCES pillars(id) ON DELETE SET NULL,
  post_text TEXT NOT NULL,
  character_count INTEGER NOT NULL,
  post_url VARCHAR(500),
  engagement_metrics JSONB,
  vector_embedding VECTOR(1536), -- For semantic search (pgvector extension)
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_examples_user_id ON voice_examples(user_id);
CREATE INDEX idx_voice_examples_pillar_id ON voice_examples(pillar_id);
CREATE INDEX idx_voice_examples_user_status ON voice_examples(user_id, status) WHERE status = 'active';

-- Vector similarity search index
CREATE INDEX idx_voice_examples_vector ON voice_examples 
  USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);
```

**Columns:**
- `post_text`: Full LinkedIn post content
- `character_count`: Post length (for analysis)
- `post_url`: Optional LinkedIn post URL
- `engagement_metrics`: JSON with likes, comments, shares
- `vector_embedding`: OpenAI embedding for semantic similarity
- `pillar_id`: Optional classification to pillar

---

### 3.6 raw_topics

**Purpose**: Discovered content before AI classification

```sql
CREATE TABLE raw_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL CHECK (source IN ('perplexity', 'reddit', 'fireflies', 'manual', 'company')),
  content TEXT NOT NULL,
  url VARCHAR(1000),
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'processing', 'classified', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_raw_topics_user_id ON raw_topics(user_id);
CREATE INDEX idx_raw_topics_user_status ON raw_topics(user_id, status);
CREATE INDEX idx_raw_topics_created_at ON raw_topics(created_at DESC);

-- Full-text search index
CREATE INDEX idx_raw_topics_content_fts ON raw_topics 
  USING GIN(to_tsvector('english', content));
```

**Metadata Examples:**
```json
{
  "source_platform": "reddit",
  "subreddit": "r/startups",
  "upvotes": 423,
  "comments_count": 87,
  "discovered_at": "2026-02-09T10:30:00Z"
}
```

---

### 3.7 classified_topics

**Purpose**: Topics classified by AI and ready for drafting

```sql
CREATE TABLE classified_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_topic_id UUID UNIQUE REFERENCES raw_topics(id) ON DELETE SET NULL,
  pillar_id UUID NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  url VARCHAR(1000),
  ai_score INTEGER NOT NULL CHECK (ai_score >= 0 AND ai_score <= 100),
  hook_angle VARCHAR(50) CHECK (hook_angle IN ('rational', 'emotional', 'aspirational')),
  reasoning TEXT,
  status VARCHAR(50) DEFAULT 'classified' CHECK (status IN ('classified', 'drafted', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_classified_topics_user_id ON classified_topics(user_id);
CREATE INDEX idx_classified_topics_pillar_id ON classified_topics(pillar_id);
CREATE INDEX idx_classified_topics_user_status ON classified_topics(user_id, status);
CREATE INDEX idx_classified_topics_ai_score ON classified_topics(ai_score DESC);
CREATE INDEX idx_classified_topics_created_at ON classified_topics(created_at DESC);

-- Full-text search index
CREATE INDEX idx_classified_topics_content_fts ON classified_topics 
  USING GIN(to_tsvector('english', content));
```

**Columns:**
- `raw_topic_id`: Link to original raw topic
- `pillar_id`: AI-determined pillar
- `ai_score`: Quality score (70-100, <70 archived)
- `hook_angle`: Emotional approach for post
- `reasoning`: AI's explanation for classification

---

### 3.8 generated_drafts

**Purpose**: AI-generated post variants

```sql
CREATE TABLE generated_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES classified_topics(id) ON DELETE CASCADE,
  pillar_id UUID NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  variant_letter CHAR(1) NOT NULL CHECK (variant_letter IN ('A', 'B', 'C')),
  hook TEXT NOT NULL,
  body TEXT NOT NULL,
  cta TEXT,
  hashtags TEXT,
  full_text TEXT NOT NULL,
  character_count INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'posted', 'scheduled')),
  edited_text TEXT,
  user_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drafts_user_id ON generated_drafts(user_id);
CREATE INDEX idx_drafts_topic_id ON generated_drafts(topic_id);
CREATE INDEX idx_drafts_pillar_id ON generated_drafts(pillar_id);
CREATE INDEX idx_drafts_user_status ON generated_drafts(user_id, status);
CREATE INDEX idx_drafts_status_created ON generated_drafts(status, created_at DESC);
CREATE INDEX idx_drafts_scheduled ON generated_drafts(scheduled_for) WHERE status = 'scheduled';

-- Unique constraint: one variant per topic
CREATE UNIQUE INDEX idx_drafts_topic_variant ON generated_drafts(topic_id, variant_letter);
```

**Columns:**
- `topic_id`: Source classified topic
- `variant_letter`: A, B, or C
- `hook`: Opening line
- `body`: Main content
- `cta`: Call to action
- `hashtags`: Space-separated hashtags
- `full_text`: Complete assembled post
- `edited_text`: User-edited version (if modified)
- `user_notes`: User feedback/notes
- `scheduled_for`: Future posting time

---

### 3.9 usage_tracking

**Purpose**: Track API usage for billing and rate limiting

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL, -- 'topic_discovery', 'classification', 'generation', 'regeneration'
  resource_id UUID,
  cost_cents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_user_date ON usage_tracking(user_id, created_at);
CREATE INDEX idx_usage_resource_type ON usage_tracking(resource_type);

-- Partitioning by month (for performance)
CREATE TABLE usage_tracking_2026_02 PARTITION OF usage_tracking
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE usage_tracking_2026_03 PARTITION OF usage_tracking
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
-- ... continue for each month
```

**Example Tracking:**
```json
{
  "resource_type": "generation",
  "cost_cents": 5,
  "metadata": {
    "model": "gpt-4-turbo",
    "tokens_used": 1234,
    "latency_ms": 3456
  }
}
```

---

### 3.10 audit_logs

**Purpose**: Track all data modifications (optional, for compliance)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete'
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## 4. Views & Materialized Views

### 4.1 user_dashboard_stats

**Purpose**: Aggregate stats for dashboard (materialized for performance)

```sql
CREATE MATERIALIZED VIEW user_dashboard_stats AS
SELECT
  u.id AS user_id,
  COUNT(DISTINCT ct.id) AS pending_topics,
  COUNT(DISTINCT CASE WHEN gd.status = 'draft' THEN gd.id END) AS drafts_pending,
  COUNT(DISTINCT CASE WHEN gd.status = 'approved' THEN gd.id END) AS drafts_approved,
  COUNT(DISTINCT CASE WHEN gd.status = 'posted' THEN gd.id END) AS posts_published,
  MAX(rt.created_at) AS last_topic_discovered,
  MAX(gd.created_at) AS last_draft_generated
FROM users u
LEFT JOIN classified_topics ct ON ct.user_id = u.id AND ct.status = 'classified'
LEFT JOIN generated_drafts gd ON gd.user_id = u.id
LEFT JOIN raw_topics rt ON rt.user_id = u.id
GROUP BY u.id;

CREATE UNIQUE INDEX idx_dashboard_stats_user_id ON user_dashboard_stats(user_id);

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_stats;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Functions & Triggers

### 5.1 update_updated_at_timestamp()

**Purpose**: Auto-update `updated_at` column

```sql
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- ... repeat for all tables
```

### 5.2 enforce_subscription_limits()

**Purpose**: Enforce plan limits (posts per month)

```sql
CREATE OR REPLACE FUNCTION enforce_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_plan VARCHAR(50);
  post_count INTEGER;
  post_limit INTEGER;
BEGIN
  -- Get user's current plan
  SELECT plan_type INTO user_plan
  FROM subscriptions
  WHERE user_id = NEW.user_id AND status = 'active';

  -- Set limits based on plan
  IF user_plan = 'starter' THEN
    post_limit := 10;
  ELSIF user_plan = 'growth' THEN
    post_limit := 30;
  ELSIF user_plan = 'agency' THEN
    RETURN NEW; -- Unlimited
  ELSE
    RAISE EXCEPTION 'No active subscription found';
  END IF;

  -- Count posts this month
  SELECT COUNT(*) INTO post_count
  FROM generated_drafts
  WHERE user_id = NEW.user_id
    AND status IN ('approved', 'posted')
    AND created_at >= DATE_TRUNC('month', NOW());

  IF post_count >= post_limit THEN
    RAISE EXCEPTION 'Monthly post limit reached. Upgrade your plan.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_draft_limits
  BEFORE INSERT ON generated_drafts
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION enforce_subscription_limits();
```

---

## 6. Data Migration Strategy

### 6.1 Migration from Airtable

**Phase 1: Parallel Run (2 weeks)**
- Keep Airtable as primary
- Sync data to PostgreSQL hourly
- Compare data consistency

**Phase 2: Cutover (1 day)**
- Final sync from Airtable
- Switch application to PostgreSQL
- Keep Airtable read-only for 1 week

**Phase 3: Decommission (after 1 month)**
- Export Airtable to S3 (backup)
- Cancel Airtable subscription

**Migration Script Structure:**
```typescript
// scripts/migrate-from-airtable.ts
async function migrateUsers() {
  const airtableUsers = await airtable.table('Users').select().all();
  for (const record of airtableUsers) {
    await db.insert(users).values({
      id: record.fields.User_ID,
      email: record.fields.Email,
      // ... map fields
    }).onConflictDoUpdate();
  }
}

async function migrateRawContent() { /* ... */ }
async function migrateClassifiedContent() { /* ... */ }
async function migrateGeneratedPosts() { /* ... */ }

async function fullMigration() {
  await migrateUsers();
  await migrateRawContent();
  await migrateClassifiedContent();
  await migrateGeneratedPosts();
}
```

---

## 7. Data Retention Policies

### 7.1 Retention Rules

| Table | Retention | Deletion Policy |
|-------|-----------|-----------------|
| users | Indefinite | Soft delete (GDPR: hard delete on request) |
| raw_topics | 90 days | Archive to S3, then delete |
| classified_topics | 180 days | Archive to S3, then delete |
| generated_drafts | Indefinite (if posted) | Delete drafts after 90 days if rejected |
| usage_tracking | 2 years | Aggregate to monthly, then delete |
| audit_logs | 7 years | Archive to S3 after 1 year |

### 7.2 Archival Cron Job

```sql
-- Archive old raw topics
CREATE OR REPLACE FUNCTION archive_old_raw_topics()
RETURNS void AS $$
BEGIN
  -- Export to S3 (done in application layer)
  -- Then delete
  DELETE FROM raw_topics
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('archived', 'classified');
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron
SELECT cron.schedule('archive-raw-topics', '0 2 * * *', 'SELECT archive_old_raw_topics()');
```

---

## 8. Security Considerations

### 8.1 Row-Level Security (RLS)

**Enable RLS on sensitive tables:**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE classified_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON profiles
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY user_isolation_policy ON pillars
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- Repeat for other tables...
```

**Set user context in application:**
```typescript
await db.execute(`SET app.current_user_id = '${userId}'`);
```

### 8.2 Encryption

**Sensitive Fields:**
- API keys (OpenAI, Perplexity, LinkedIn)
- LinkedIn access tokens

**Encryption Strategy:**
```typescript
import { createCipheriv, createDecipheriv } from 'crypto';

function encrypt(text: string): string {
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, IV);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encrypted: string): string {
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, IV);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
```

---

## 9. Performance Optimization

### 9.1 Query Optimization Checklist

- [ ] All foreign keys have indexes
- [ ] Frequent WHERE clauses have indexes
- [ ] Full-text search uses GIN indexes
- [ ] Paginated queries use LIMIT/OFFSET efficiently
- [ ] Use `EXPLAIN ANALYZE` for slow queries
- [ ] Avoid N+1 queries (use JOINs or batching)

### 9.2 Connection Pooling

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

// Connection pool (max 20 connections)
const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
```

---

## 10. Backup & Recovery

### 10.1 Backup Strategy

**Automated Backups (Supabase):**
- Daily full backups (retained 7 days)
- Point-in-time recovery (PITR) last 7 days
- Manual snapshots before major changes

**Manual Backup Command:**
```bash
pg_dump -h db.supabase.co -U postgres -d contentpilot > backup_$(date +%Y%m%d).sql
```

### 10.2 Recovery Procedures

**Restore from Backup:**
```bash
# Drop existing database (DANGEROUS!)
psql -h db.supabase.co -U postgres -c "DROP DATABASE contentpilot;"

# Create fresh database
psql -h db.supabase.co -U postgres -c "CREATE DATABASE contentpilot;"

# Restore from backup
psql -h db.supabase.co -U postgres -d contentpilot < backup_20260209.sql
```

---

**Document Approvals:**
- [ ] Engineering Team
- [ ] DBA (if applicable)
- [ ] Security Officer
- [ ] CTO
