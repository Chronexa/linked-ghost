# Product Requirements Document (PRD)
## ContentPilot AI - LinkedIn Content Engine

**Version:** 1.0  
**Last Updated:** February 9, 2026  
**Document Owner:** CTO

---

## 1. Executive Summary

### 1.1 Product Vision
ContentPilot AI is a LinkedIn ghostwriting SaaS that generates authentic, on-brand content by learning from users' writing styles and pulling from multiple intelligence sources.

### 1.2 Problem Statement
LinkedIn creators face three major challenges:
1. **Time Constraint**: Creating quality content takes 2-4 hours per post
2. **Consistency**: Maintaining regular posting schedule is difficult
3. **Authenticity**: Generic AI content doesn't capture personal voice

### 1.3 Solution
An AI-powered content engine that:
- Automatically discovers relevant topics from news, Reddit, meetings
- Classifies content by user-defined pillars
- Generates posts that match the user's authentic voice
- Provides 3 variants per topic for user approval

### 1.4 Target Market
- **Primary**: Founders, executives, thought leaders (10K-100K followers)
- **Secondary**: Content agencies managing multiple clients
- **Tertiary**: Growing professionals building their personal brand

### 1.5 Success Metrics
- **User Activation**: 70% complete onboarding
- **Engagement**: 5+ posts generated per user/month
- **Retention**: 80% monthly retention after 3 months
- **NPS Score**: 50+
- **Time Savings**: Reduce content creation time by 80%

---

## 2. User Personas

### Persona 1: Sarah - The Founder
- **Age**: 35, Female
- **Role**: Startup Founder
- **LinkedIn**: 25K followers
- **Pain**: No time to create content, needs to maintain thought leadership
- **Goal**: Post 3x/week without spending hours writing
- **Tech Savvy**: High

### Persona 2: Raj - The NRI Professional
- **Age**: 42, Male
- **Role**: Finance Executive
- **LinkedIn**: 15K followers
- **Pain**: Hard to find relevant cross-border content ideas
- **Goal**: Build authority in US-India financial topics
- **Tech Savvy**: Medium

### Persona 3: Maria - The Agency Owner
- **Age**: 38, Female
- **Role**: Content Agency Founder
- **LinkedIn**: Managing 10 client profiles
- **Pain**: Scaling personalized content for multiple clients
- **Goal**: Manage all clients efficiently with consistent quality
- **Tech Savvy**: High

---

## 3. Feature Requirements

### 3.1 Core Features (MVP)

#### F1: User Onboarding
**Priority:** P0 (Must Have)
- Multi-step wizard (4 steps)
- Content pillar setup (3-10 pillars)
- Voice training via past posts (min 3, recommended 5-10)
- Source configuration (Perplexity, Reddit, Manual)

**Acceptance Criteria:**
- User can complete onboarding in < 5 minutes
- Voice analysis provides confidence score
- Pillars are editable post-onboarding

#### F2: Content Discovery (Perplexity)
**Priority:** P0 (Must Have)
- Daily automated research at configurable time
- Topic discovery based on user pillars
- Deduplication of similar topics
- Source attribution with URLs

**Acceptance Criteria:**
- Discover 5-15 topics per day per user
- 90% topic relevance rate
- No duplicate topics within 30 days

#### F3: AI Classification
**Priority:** P0 (Must Have)
- Auto-classify topics into pillars
- Generate hook angle (Rational/Emotional/Aspirational)
- Quality scoring (0-100)
- Filter out low-quality content (< 70 score)

**Acceptance Criteria:**
- 85% classification accuracy
- < 5 seconds processing time per topic
- Users can override pillar classification

#### F4: Voice-Matched Generation
**Priority:** P0 (Must Have)
- Generate 3 variants (A, B, C) per topic
- Match user's tone, style, and structure
- Include hook, body, CTA, hashtags
- 800-1500 character output

**Acceptance Criteria:**
- 90% voice match confidence
- < 10 seconds generation time
- Users approve 60%+ of generated drafts

#### F5: Content Dashboard
**Priority:** P0 (Must Have)
- View pending topics (left panel)
- View generated drafts (right panel)
- Approve/reject/edit functionality
- Filter by pillar, date, status

**Acceptance Criteria:**
- Load dashboard in < 2 seconds
- Support 100+ topics per user
- Real-time updates on new content

#### F6: Draft Management
**Priority:** P0 (Must Have)
- Edit drafts in-app
- Approve drafts for posting
- Regenerate variants
- Add notes/feedback

**Acceptance Criteria:**
- Save edits in real-time
- Track approval history
- Support undo/redo editing

### 3.2 Phase 2 Features (Post-MVP)

#### F7: Reddit Integration
**Priority:** P1 (Should Have)
- Connect to specific subreddits
- Monitor trending discussions
- Extract actionable insights
- Keyword-based filtering

#### F8: Fireflies Integration
**Priority:** P1 (Should Have)
- Auto-import meeting transcripts
- Extract key insights from calls
- Generate content from customer stories
- Tag by topic/product

#### F9: Manual Topic Input
**Priority:** P1 (Should Have)
- Add topics manually
- Upload text/PDF/links
- Batch import multiple topics
- Schedule for specific pillars

#### F10: Publishing Calendar
**Priority:** P1 (Should Have)
- Schedule posts for future dates
- Optimal time recommendations
- LinkedIn native posting (API)
- Draft/scheduled/posted views

#### F11: Analytics Dashboard
**Priority:** P2 (Nice to Have)
- Post performance tracking
- Engagement metrics (likes, comments, shares)
- Pillar performance comparison
- Growth trends over time

#### F12: Team Collaboration
**Priority:** P2 (Nice to Have)
- Multi-user accounts (agency plan)
- Approval workflows
- Comments/feedback on drafts
- Role-based permissions

### 3.3 Non-Functional Requirements

#### Performance
- Page load time: < 2 seconds (90th percentile)
- API response time: < 500ms (95th percentile)
- AI generation time: < 15 seconds per draft
- Support 1000 concurrent users

#### Reliability
- 99.9% uptime SLA
- Automated backups (hourly)
- Disaster recovery plan (RTO: 4 hours, RPO: 1 hour)
- Graceful error handling with user-friendly messages

#### Scalability
- Support 10,000 users in Year 1
- Handle 100K topics per month
- Auto-scaling infrastructure
- Database partitioning strategy

#### Security
- SOC 2 Type II compliance (Year 1)
- End-to-end encryption for sensitive data
- OAuth 2.0 for authentication
- Regular security audits
- GDPR compliance

#### Usability
- Mobile-responsive design
- Accessibility (WCAG 2.1 AA)
- < 5 minute onboarding time
- In-app help and tooltips

---

## 4. User Flows

### 4.1 First-Time User Flow
```
Landing Page
    ↓
Sign Up (Email + Password)
    ↓
Onboarding Step 1: Welcome
    ↓
Onboarding Step 2: Add Content Pillars (3-5)
    ↓
Onboarding Step 3: Voice Training (paste 3-5 posts)
    ↓
Onboarding Step 4: Connect Sources
    ↓
Dashboard (Empty State)
    ↓
Background: AI processes voice examples
    ↓
Notification: "Your first topics are ready!"
    ↓
User selects topic → Generates drafts → Reviews → Approves
```

### 4.2 Daily Active User Flow
```
Login → Dashboard
    ↓
View 5 new pending topics (classified by AI)
    ↓
Click "Generate Post" on topic
    ↓
View 3 variants (A, B, C)
    ↓
Choose variant B
    ↓
Make minor edits
    ↓
Click "Approve"
    ↓
Post now OR schedule for later
```

### 4.3 Content Generation Pipeline
```
[Background Cron Job]
    ↓
Fetch user's active pillars + keywords
    ↓
Query Perplexity API (last 24 hours)
    ↓
Get 10-20 raw topics
    ↓
Deduplicate similar topics
    ↓
For each topic:
    ↓
    AI Classification (determine pillar + score)
    ↓
    If score >= 70:
        Store in Classified_Content
        Status: "Pending"
    Else:
        Archive topic
    ↓
User sees topics in dashboard
```

---

## 5. Pricing Strategy

### 5.1 Pricing Tiers

#### Starter - $29/month
- 10 posts per month
- 2 content pillars
- Voice cloning
- Perplexity integration
- Email support
- **Target:** Individual creators testing the platform

#### Growth - $79/month (Most Popular)
- 30 posts per month
- 5 content pillars
- Advanced voice cloning
- All integrations (Reddit, Fireflies)
- Priority support
- Analytics dashboard
- **Target:** Active creators, consultants

#### Agency - $199/month
- Unlimited posts
- 10 content pillars per profile
- 3 user profiles
- Multi-user collaboration
- Dedicated support
- API access
- White-label options
- **Target:** Agencies, enterprises

### 5.2 Add-Ons
- Extra user profiles: $49/month each
- LinkedIn posting API: $29/month
- Priority AI queue: $19/month
- Custom voice training: $99 one-time

### 5.3 Free Trial
- 7-day free trial (no credit card required)
- Full Growth plan features
- Limit: 5 posts during trial
- Convert to Starter plan after trial

---

## 6. Competitive Analysis

### 6.1 Direct Competitors

| Feature | ContentPilot AI | Jasper AI | Copy.ai | Taplio |
|---------|----------------|-----------|---------|--------|
| Voice Cloning | ✅ Advanced | ⚠️ Basic | ⚠️ Basic | ✅ Good |
| Auto Research | ✅ Daily | ❌ None | ❌ None | ⚠️ Limited |
| Pillar Classification | ✅ AI-powered | ❌ Manual | ❌ Manual | ⚠️ Tags only |
| LinkedIn-Specific | ✅ Yes | ❌ General | ❌ General | ✅ Yes |
| Multiple Variants | ✅ 3 per topic | ⚠️ 1 | ⚠️ 1 | ✅ 2-3 |
| Price (Growth) | $79/mo | $59/mo | $49/mo | $39/mo |

### 6.2 Competitive Advantages
1. **Authentic Voice Matching**: Most accurate voice cloning in market
2. **Intelligent Research**: Only platform with automatic daily topic discovery
3. **Content Strategy**: Pillar-based approach maintains balanced content mix
4. **LinkedIn-Native**: Built specifically for LinkedIn, not general copywriting

### 6.3 Risks & Mitigations
- **Risk:** OpenAI API changes pricing/terms
  - **Mitigation:** Multi-model strategy (Claude, Gemini fallbacks)
- **Risk:** LinkedIn changes posting API
  - **Mitigation:** Manual copy-paste always works, focus on generation quality
- **Risk:** Competitors copy features
  - **Mitigation:** Focus on voice quality and UX, build moats with data

---

## 7. Success Criteria

### 7.1 Launch Goals (Month 1)
- 100 beta users signed up
- 70% complete onboarding
- 500+ posts generated
- NPS score > 40
- < 5 critical bugs reported

### 7.2 Growth Goals (Month 6)
- 1,000 paying users
- $50K MRR
- 80% monthly retention
- 2,000+ posts generated per day
- Feature parity with Taplio

### 7.3 Scale Goals (Year 1)
- 10,000 paying users
- $500K MRR
- 85% monthly retention
- SOC 2 certified
- Team of 10 employees

---

## 8. Out of Scope (V1)

- ❌ Instagram/Twitter/Facebook content
- ❌ Image generation
- ❌ Video content creation
- ❌ LinkedIn profile optimization
- ❌ Engagement pods/groups
- ❌ AI-powered commenting
- ❌ Influencer marketplace
- ❌ White-label reselling (until Agency plan validation)

---

## 9. Open Questions

1. **Voice Training**: Minimum 3 posts or allow users to start with less?
2. **Regeneration Limits**: Should we limit regenerations per topic (cost control)?
3. **Data Retention**: How long to keep archived/rejected topics?
4. **LinkedIn API**: Should we build native posting in V1 or V2?
5. **Webhook vs Polling**: For Airtable migration, use webhooks or scheduled jobs?

---

## 10. Appendix

### 10.1 Glossary
- **Pillar**: A content category/theme (e.g., Founder Journey, Industry Insights)
- **Topic**: A discovered news item or insight before it's drafted
- **Draft**: A generated LinkedIn post variant (A, B, or C)
- **Hook Angle**: The emotional approach (Rational, Emotional, Aspirational)
- **Voice Match**: AI's confidence that generated content sounds like the user

### 10.2 References
- Original N8N workflow: `LinkedIn Content Engine .json`
- Market research: Gartner reports on AI content tools
- User interviews: 10 LinkedIn creators (avg 30K followers)

---

**Document Approvals:**
- [ ] Product Manager
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] CEO/Founder
