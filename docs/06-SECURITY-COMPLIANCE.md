# Security & Compliance Guide
## ContentPilot AI - Security Architecture

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Document Owner:** CTO / Security Officer

---

## 1. Security Overview

### 1.1 Security Principles

**CIA Triad**:
- **Confidentiality**: User data is private and encrypted
- **Integrity**: Data cannot be tampered with
- **Availability**: System is resilient and highly available

**Defense in Depth**:
- Multiple layers of security controls
- No single point of failure
- Assume breach mentality

**Least Privilege**:
- Users and services have minimum required permissions
- Role-based access control (RBAC)
- Regular permission audits

---

## 2. Application Security

### 2.1 Authentication & Authorization

#### Clerk Integration (OAuth 2.0)
```typescript
// Secure authentication flow
import { auth } from '@clerk/nextjs';

export async function middleware(request: NextRequest) {
  const { userId } = auth();
  
  if (!userId && isProtectedRoute(request)) {
    return redirectToSignIn();
  }
  
  return NextResponse.next();
}
```

**Security Features**:
- ✅ Multi-factor authentication (MFA) support
- ✅ Session management (JWT tokens)
- ✅ OAuth providers (Google, LinkedIn)
- ✅ Password strength requirements (min 12 chars, symbols)
- ✅ Rate limiting on login attempts (5 per minute)
- ✅ Account lockout after 10 failed attempts
- ✅ Email verification required

#### JWT Token Security
```typescript
// httpOnly cookies (not accessible via JavaScript)
const sessionCookie = {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};
```

#### Role-Based Access Control
```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  AGENCY_OWNER = 'agency_owner',
  AGENCY_MEMBER = 'agency_member',
}

function requireRole(role: Role) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser();
    if (user.role !== role) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}
```

---

### 2.2 Input Validation & Sanitization

#### Zod Schema Validation
```typescript
import { z } from 'zod';

const createPillarSchema = z.object({
  name: z.string().min(3).max(50).trim(),
  description: z.string().max(500).optional(),
  tone: z.string().max(200).optional(),
});

// Usage in API route
const body = createPillarSchema.parse(await req.json());
```

**Validation Rules**:
- All user inputs validated with Zod
- SQL injection prevention (parameterized queries via ORM)
- XSS prevention (React auto-escaping + DOMPurify)
- Command injection prevention (no exec() calls with user input)
- Path traversal prevention (validate file paths)

#### Content Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeUserContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
}
```

---

### 2.3 API Security

#### Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
});

export async function rateLimit(userId: string) {
  const { success, remaining } = await ratelimit.limit(userId);
  if (!success) {
    throw new RateLimitError('Too many requests');
  }
  return remaining;
}
```

**Rate Limits by Tier**:

| Endpoint | Anonymous | Starter | Growth | Agency |
|----------|-----------|---------|--------|--------|
| `GET /api/*` | 10/min | 50/min | 100/min | 500/min |
| `POST /api/topics/*/generate` | N/A | 5/hour | 10/hour | 20/hour |
| `POST /api/voice/analyze` | N/A | 3/hour | 10/hour | 20/hour |

#### CSRF Protection
```typescript
// Next.js built-in CSRF protection for Server Actions
import { cookies } from 'next/headers';

export async function protectedAction() {
  const csrfToken = cookies().get('csrf-token');
  if (!csrfToken) {
    throw new Error('CSRF token missing');
  }
}
```

#### CORS Configuration
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://app.contentpilot.ai' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
        ],
      },
    ];
  },
};
```

---

### 2.4 Data Protection

#### Encryption at Rest
- **Database**: PostgreSQL transparent data encryption (Supabase default)
- **Backups**: Encrypted with AES-256
- **File Storage**: Cloudflare R2 server-side encryption

#### Encryption in Transit
- **HTTPS**: TLS 1.3 for all connections
- **Certificate**: Vercel managed SSL certificates
- **HSTS**: HTTP Strict Transport Security enabled

#### Sensitive Data Encryption
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encryptAPIKey(apiKey: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptAPIKey(encrypted: string): string {
  const [ivHex, authTagHex, ciphertext] = encrypted.split(':');
  
  const decipher = createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

**Fields to Encrypt**:
- OpenAI API keys (user-provided)
- Perplexity API keys (user-provided)
- LinkedIn access tokens
- Stripe payment method tokens

---

### 2.5 Secrets Management

#### Environment Variables
```bash
# .env.local (never commit to Git)
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
OPENAI_API_KEY=sk-...
ENCRYPTION_KEY=64-char-hex-string
STRIPE_SECRET_KEY=sk_test_...

# Vercel Environment Variables (production)
# Managed via Vercel dashboard
```

**Best Practices**:
- ✅ Never commit `.env` files to Git
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate secrets every 90 days
- ✅ Use 1Password or AWS Secrets Manager for team access
- ✅ Audit secret access logs

---

## 3. Database Security

### 3.1 Row-Level Security (RLS)

```sql
-- Enable RLS on user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY user_isolation_policy ON profiles
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- Set user context in application
SET app.current_user_id = 'user-uuid-here';
```

### 3.2 SQL Injection Prevention

```typescript
// BAD: String concatenation (vulnerable)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD: Parameterized query (Drizzle ORM)
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
```

### 3.3 Database Access Control

**Principle of Least Privilege**:
```sql
-- Application user (read/write on app tables only)
CREATE USER app_user WITH PASSWORD 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
REVOKE DELETE ON users FROM app_user; -- No hard deletes

-- Read-only user (for analytics)
CREATE USER analytics_user WITH PASSWORD 'strong-password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Admin user (full access, only for migrations)
-- Use sparingly, audit all actions
```

### 3.4 Audit Logging

```typescript
// Log all data modifications
async function auditLog(action: string, table: string, recordId: string, changes: any) {
  await db.insert(auditLogs).values({
    userId: currentUser.id,
    action,
    tableName: table,
    recordId,
    oldValues: changes.old,
    newValues: changes.new,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
}

// Usage
await auditLog('update', 'pillars', pillarId, { old: oldData, new: newData });
```

---

## 4. Infrastructure Security

### 4.1 Vercel Security

**Built-in Security Features**:
- ✅ DDoS protection (automatic)
- ✅ WAF (Web Application Firewall)
- ✅ Edge network security
- ✅ Automatic SSL/TLS certificates
- ✅ Secure environment variables

**Configuration**:
```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.clerk.accounts.dev https://api.openai.com"
        }
      ]
    }
  ]
}
```

### 4.2 Dependency Security

#### Automated Scanning
```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run npm audit
        run: npm audit --audit-level=high
```

#### Dependency Updates
- **Dependabot**: Automatic PRs for security updates
- **Weekly reviews**: Manual review of non-security updates
- **Testing**: All updates tested before merging

---

## 5. Compliance

### 5.1 GDPR (General Data Protection Regulation)

**User Rights**:
1. **Right to Access**: Export all user data
2. **Right to Erasure**: Delete account and all data
3. **Right to Rectification**: Update incorrect data
4. **Right to Portability**: Export data in machine-readable format

**Implementation**:
```typescript
// Data export
export async function exportUserData(userId: string) {
  const data = {
    profile: await db.select().from(profiles).where(eq(profiles.userId, userId)),
    pillars: await db.select().from(pillars).where(eq(pillars.userId, userId)),
    topics: await db.select().from(classifiedTopics).where(eq(classifiedTopics.userId, userId)),
    drafts: await db.select().from(generatedDrafts).where(eq(generatedDrafts.userId, userId)),
  };
  
  return JSON.stringify(data, null, 2);
}

// Data deletion (GDPR right to erasure)
export async function deleteUserData(userId: string) {
  await db.transaction(async (tx) => {
    // Cascade delete via foreign keys
    await tx.delete(users).where(eq(users.id, userId));
  });
  
  // Delete from external services
  await clerk.users.deleteUser(userId);
  await stripe.customers.del(stripeCustomerId);
}
```

**Privacy Policy**: [link to policy]

---

### 5.2 CCPA (California Consumer Privacy Act)

**Requirements**:
- Disclose data collection practices
- Provide opt-out for data selling (we don't sell data)
- Allow data deletion requests

**Implementation**:
- Privacy Policy clearly states data usage
- No data selling (ever)
- Delete account feature in settings

---

### 5.3 SOC 2 Type II (Target: Q4 2026)

**Controls to Implement**:

#### Security
- [ ] Access controls (RBAC)
- [ ] Encryption at rest and in transit
- [ ] Security monitoring (Sentry, logs)
- [ ] Incident response plan
- [ ] Vendor risk management

#### Availability
- [ ] 99.9% uptime SLA
- [ ] Backup and disaster recovery
- [ ] Redundancy and failover
- [ ] Monitoring and alerting

#### Confidentiality
- [ ] NDA with employees and contractors
- [ ] Data classification policy
- [ ] Secure data disposal

#### Processing Integrity
- [ ] Quality assurance testing
- [ ] Error logging and monitoring
- [ ] Change management process

#### Privacy
- [ ] Privacy policy
- [ ] Data subject rights (GDPR)
- [ ] Data retention policy

**Timeline**:
- Q2 2026: Implement controls
- Q3 2026: Internal audit
- Q4 2026: External SOC 2 Type II audit

---

### 5.4 PCI DSS (Payment Card Industry Data Security Standard)

**Compliance**:
- ✅ We use Stripe (PCI Level 1 certified)
- ✅ We never store credit card data
- ✅ We use Stripe Elements (hosted forms)
- ✅ All payment data handled by Stripe

**No PCI DSS audit required** (Stripe is responsible)

---

## 6. Incident Response

### 6.1 Incident Types

| Type | Severity | Response Time | Example |
|------|----------|---------------|---------|
| **P0 - Critical** | Critical | < 15 min | Data breach, total outage |
| **P1 - High** | High | < 1 hour | Major feature down, API errors |
| **P2 - Medium** | Medium | < 4 hours | Minor bugs, slow performance |
| **P3 - Low** | Low | < 1 day | UI issues, non-critical bugs |

### 6.2 Incident Response Plan

#### Phase 1: Detection & Triage (0-15 min)
1. Alert received (Sentry, monitoring)
2. On-call engineer assesses severity
3. Page additional team members if P0/P1
4. Create incident channel (#incident-YYYYMMDD)

#### Phase 2: Containment (15-60 min)
1. Stop the bleeding (isolate affected systems)
2. Enable maintenance mode if needed
3. Preserve evidence (logs, database snapshots)
4. Communicate to users (status page)

#### Phase 3: Eradication (1-4 hours)
1. Identify root cause
2. Apply fix (hotfix or rollback)
3. Verify fix in production
4. Monitor for recurrence

#### Phase 4: Recovery (4-24 hours)
1. Restore full service
2. Post-incident monitoring
3. Update status page
4. Send user communication

#### Phase 5: Post-Mortem (48 hours)
1. Write incident report (template below)
2. Identify action items
3. Schedule follow-up meeting
4. Update runbooks

### 6.3 Incident Report Template

```markdown
# Incident Report: [Brief Title]

**Date**: YYYY-MM-DD
**Severity**: P0 / P1 / P2 / P3
**Duration**: X hours Y minutes
**Impact**: X users affected, Y requests failed

## Summary
Brief description of what happened.

## Timeline (UTC)
- 10:00 - Incident detected
- 10:05 - Team paged
- 10:15 - Root cause identified
- 10:30 - Fix deployed
- 10:45 - Incident resolved

## Root Cause
Technical explanation of what went wrong.

## Resolution
What was done to fix it.

## Impact
- Users affected: 1,234
- Requests failed: 5,678
- Revenue lost: $X

## Action Items
- [ ] Fix ABC (Owner: John, Due: 2026-02-15)
- [ ] Add monitoring for XYZ (Owner: Jane, Due: 2026-02-20)
- [ ] Update runbook (Owner: Team, Due: 2026-02-10)

## Lessons Learned
What did we learn? How can we prevent this?
```

---

## 7. Security Checklist

### Pre-Launch Checklist

#### Application Security
- [ ] All inputs validated with Zod
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection enabled
- [ ] Rate limiting on all endpoints
- [ ] Authentication with MFA support
- [ ] Authorization checks on all routes
- [ ] Secure session management

#### Data Security
- [ ] Encryption at rest (database)
- [ ] Encryption in transit (HTTPS/TLS 1.3)
- [ ] Sensitive data encrypted (API keys)
- [ ] Secrets stored in environment variables
- [ ] Row-level security (RLS) enabled
- [ ] Audit logging implemented

#### Infrastructure Security
- [ ] HTTPS enforced (no HTTP)
- [ ] Security headers configured
- [ ] DDoS protection (Vercel)
- [ ] WAF enabled
- [ ] Automated backups configured
- [ ] Disaster recovery plan documented

#### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner (GDPR)
- [ ] Data export feature (GDPR)
- [ ] Account deletion feature (GDPR)
- [ ] Data retention policy documented

#### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (Better Stack)
- [ ] Uptime monitoring (BetterUptime)
- [ ] Security alerts configured
- [ ] Incident response plan documented

---

### Monthly Security Review

#### Code Security
- [ ] Run `npm audit` and fix high/critical issues
- [ ] Update dependencies (Dependabot PRs)
- [ ] Review Snyk security reports
- [ ] Code review for security issues

#### Access Control
- [ ] Review user permissions
- [ ] Audit admin access logs
- [ ] Rotate API keys (every 90 days)
- [ ] Review service account permissions

#### Monitoring
- [ ] Review Sentry error reports
- [ ] Check for unusual traffic patterns
- [ ] Review failed login attempts
- [ ] Check rate limit violations

#### Compliance
- [ ] Review privacy policy (any changes?)
- [ ] Check data retention compliance
- [ ] Review GDPR deletion requests
- [ ] Audit vendor compliance (Stripe, Clerk, etc.)

---

## 8. Security Training

### Developer Security Training

**Required Training** (before contributing to codebase):
1. OWASP Top 10 (2-hour course)
2. Secure coding practices (1-hour workshop)
3. Data privacy fundamentals (1-hour course)
4. Incident response procedures (30-min briefing)

**Ongoing Training** (quarterly):
- Security newsletter (latest threats)
- Lunch & learn sessions
- Security CTF challenges (optional)

---

## 9. Vulnerability Disclosure

### Responsible Disclosure Policy

**Contact**: security@contentpilot.ai

**Process**:
1. Reporter submits vulnerability details
2. We acknowledge within 24 hours
3. We investigate and validate (1-5 days)
4. We fix the issue (priority based on severity)
5. We notify reporter when fixed
6. Reporter can publish after 90 days (coordinated disclosure)

**Bug Bounty** (future):
- Critical: $500-$2,000
- High: $200-$500
- Medium: $50-$200
- Low: $25-$50

**Out of Scope**:
- Social engineering attacks
- Physical attacks
- Third-party vulnerabilities (Clerk, Stripe, etc.)

---

## 10. Appendix

### 10.1 Security Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Snyk | Dependency scanning | Free (open source) |
| Sentry | Error tracking | $26/mo |
| Better Stack | Log aggregation | $15/mo |
| BetterUptime | Uptime monitoring | $20/mo |
| 1Password | Secrets management | $8/user/mo |
| Clerk | Authentication | $25/mo + usage |

### 10.2 Security Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- CIS Controls: https://www.cisecurity.org/controls
- GDPR Compliance Checklist: https://gdpr.eu/checklist/

---

**Document Approvals:**
- [ ] Engineering Team
- [ ] Security Officer
- [ ] Legal Team
- [ ] CTO
- [ ] CEO
