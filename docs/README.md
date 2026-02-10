# ContentPilot AI - Documentation

Welcome to the comprehensive documentation for **ContentPilot AI**, a production-ready SaaS platform for AI-powered LinkedIn content generation.

---

## 📚 Documentation Index

### 1. **[Product Requirements Document (PRD)](./01-PRODUCT-REQUIREMENTS.md)**
   - Product vision and problem statement
   - User personas and target market
   - Feature requirements (MVP + Post-MVP)
   - User flows and acceptance criteria
   - Pricing strategy and competitive analysis
   - Success metrics and KPIs

   **Read this if**: You want to understand *what* we're building and *why*

---

### 2. **[Technical Architecture](./02-TECHNICAL-ARCHITECTURE.md)**
   - High-level system architecture
   - Technology stack decisions
   - Component diagrams and data flows
   - Scalability and performance strategies
   - Security architecture
   - Infrastructure and deployment

   **Read this if**: You want to understand *how* the system is designed

---

### 3. **[Database Schema](./03-DATABASE-SCHEMA.md)**
   - Complete database schema (PostgreSQL)
   - Entity-relationship diagrams
   - Table definitions with indexes
   - Functions, triggers, and views
   - Migration strategy from Airtable
   - Data retention and archival policies

   **Read this if**: You're working on data models or database optimization

---

### 4. **[API Specification](./04-API-SPECIFICATION.md)**
   - RESTful API documentation
   - Authentication and authorization
   - Request/response formats
   - All endpoints with examples
   - Rate limiting and error codes
   - Webhook integrations

   **Read this if**: You're building frontend features or integrations

---

### 5. **[Development Roadmap](./05-DEVELOPMENT-ROADMAP.md)**
   - 11-week implementation timeline
   - Phase-by-phase breakdown
   - Team structure and responsibilities
   - Risk management
   - Success metrics per phase
   - Development best practices

   **Read this if**: You're planning sprints or tracking progress

---

### 6. **[Security & Compliance](./06-SECURITY-COMPLIANCE.md)**
   - Application security measures
   - Data protection and encryption
   - Authentication and authorization
   - GDPR, CCPA, SOC 2 compliance
   - Incident response procedures
   - Security checklists

   **Read this if**: You're concerned with security, privacy, or compliance

---

## 🚀 Quick Start Guide

### For Developers

1. **Read the [Technical Architecture](./02-TECHNICAL-ARCHITECTURE.md)** to understand the system design
2. **Review the [Database Schema](./03-DATABASE-SCHEMA.md)** to understand data models
3. **Check the [Development Roadmap](./05-DEVELOPMENT-ROADMAP.md)** to see current priorities
4. **Reference the [API Specification](./04-API-SPECIFICATION.md)** while building features

### For Product Managers

1. **Read the [PRD](./01-PRODUCT-REQUIREMENTS.md)** to understand product vision
2. **Review the [Development Roadmap](./05-DEVELOPMENT-ROADMAP.md)** for timeline
3. **Check success metrics** in both PRD and Roadmap
4. **Monitor competitive analysis** in PRD

### For Security/Compliance

1. **Read the [Security & Compliance](./06-SECURITY-COMPLIANCE.md)** guide
2. **Review data protection** measures in Technical Architecture
3. **Check GDPR compliance** features in API Specification
4. **Audit security checklists** before launch

---

## 🎯 Project Status

### Current Phase
**Phase 0: Foundation** (Week 1-2)

### Next Milestones
- **Week 2**: Infrastructure complete
- **Week 6**: MVP core complete
- **Week 9**: Content generation complete
- **Week 11**: Launch to beta users

### Key Metrics (Target: Month 3)
- 500 paying users
- $30K MRR
- 80% monthly retention
- 3,000+ posts generated

---

## 🏗️ System Overview

### What We're Building
An AI-powered LinkedIn content engine that:
1. **Discovers** relevant topics from multiple sources (Perplexity, Reddit, meetings)
2. **Classifies** content by user-defined pillars with AI scoring
3. **Generates** authentic LinkedIn posts in the user's voice (3 variants per topic)

### Core Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM, PostgreSQL
- **AI**: OpenAI GPT-4, Perplexity API
- **Auth**: Clerk
- **Payments**: Stripe
- **Hosting**: Vercel

### Key Features (MVP)
✅ User onboarding with voice training  
✅ Daily automated content discovery (Perplexity)  
✅ AI classification by content pillars  
✅ Voice-matched draft generation (3 variants)  
✅ Dashboard for topic and draft management  
✅ Subscription management with usage limits  

---

## 📊 Architecture Diagrams

### High-Level Data Flow
```
User → Onboarding → Voice Training
                         ↓
          Daily Cron → Perplexity API → Raw Topics
                                            ↓
                        AI Classification → Classified Topics
                                                   ↓
          User Action → Generate Drafts → 3 Variants
                                              ↓
                        Review → Approve → Post to LinkedIn
```

### Tech Stack Layers
```
┌─────────────────────────────────────────┐
│  Frontend: Next.js 14 + React           │
├─────────────────────────────────────────┤
│  API: Next.js API Routes                │
├─────────────────────────────────────────┤
│  Business Logic: Services + Jobs        │
├─────────────────────────────────────────┤
│  Data: PostgreSQL + Redis + Vector DB   │
├─────────────────────────────────────────┤
│  External: OpenAI, Perplexity, Stripe   │
└─────────────────────────────────────────┘
```

---

## 🔒 Security Highlights

- ✅ **Authentication**: Clerk with MFA support
- ✅ **Authorization**: Role-based access control (RBAC)
- ✅ **Encryption**: TLS 1.3 in transit, AES-256 at rest
- ✅ **Input Validation**: Zod schemas on all endpoints
- ✅ **Rate Limiting**: Redis-based per-user limits
- ✅ **GDPR Compliant**: Data export and deletion features
- ✅ **SOC 2 Ready**: Target Q4 2026

---

## 📈 Roadmap Summary

### Phase 0: Foundation (2 weeks)
- Project setup, database, authentication

### Phase 1: MVP Core (4 weeks)
- Onboarding, content discovery, AI classification

### Phase 2: Content Generation (3 weeks)
- Voice training, draft generation, dashboard

### Phase 3: Launch (2 weeks)
- Payments, testing, deployment

### Phase 4: Post-Launch (Ongoing)
- User feedback, iterations, new features

**Total to MVP**: 11 weeks

---

## 🧪 Testing Strategy

### Unit Tests
- 80%+ code coverage
- All API routes tested
- All business logic functions tested

### Integration Tests
- Database operations
- External API integrations (OpenAI, Perplexity)
- Cron jobs and background workers

### E2E Tests (Playwright)
- Onboarding flow
- Content generation flow
- Payment flow
- Critical user paths

---

## 🚨 Known Limitations & Future Work

### MVP Limitations
- ❌ No Reddit integration (Phase 2)
- ❌ No Fireflies integration (Phase 2)
- ❌ No LinkedIn posting API (Phase 2)
- ❌ No team collaboration (Phase 3)
- ❌ Limited analytics (Phase 3)

### Post-MVP Priorities
1. Reddit content discovery
2. Publishing calendar with LinkedIn API
3. Enhanced analytics dashboard
4. Team collaboration features (Agency plan)
5. API access for power users

---

## 📞 Contact & Support

### Engineering Team
- **CTO**: [Your Name]
- **Lead Engineer**: TBD
- **Product Manager**: TBD

### Support Channels
- **Technical Issues**: engineering@contentpilot.ai
- **Security Concerns**: security@contentpilot.ai
- **General Inquiries**: hello@contentpilot.ai

### Development Links
- **GitHub**: [Repository URL]
- **Vercel**: [Dashboard URL]
- **Supabase**: [Dashboard URL]
- **Status Page**: status.contentpilot.ai

---

## 🤝 Contributing

### For Team Members

1. **Read all documentation** in this folder
2. **Understand the architecture** before coding
3. **Follow the roadmap** priorities
4. **Write tests** for all new features
5. **Review security checklist** before PRs

### Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add your feature"

# 3. Push and create PR
git push origin feature/your-feature-name

# 4. Request review from 2 team members
# 5. Merge to main after approval
```

### Code Standards
- TypeScript strict mode (no `any` types)
- ESLint + Prettier formatting
- Conventional Commits
- 80%+ test coverage
- JSDoc for all functions

---

## 📝 Document Maintenance

### Update Frequency
- **PRD**: As features change (monthly)
- **Technical Architecture**: As stack changes (quarterly)
- **Database Schema**: With each migration
- **API Specification**: With each endpoint change
- **Roadmap**: Weekly during active development
- **Security**: Quarterly reviews + after incidents

### Change Log
| Date | Document | Changes | Author |
|------|----------|---------|--------|
| 2026-02-09 | All | Initial creation | CTO |
| TBD | TBD | TBD | TBD |

---

## 🎓 Additional Resources

### Learning Materials
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Perplexity API Docs](https://docs.perplexity.ai/)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs)

### Design Resources
- [Figma Design Files](#) (TBD)
- [Brand Guidelines](#) (TBD)
- [Component Library (Storybook)](#) (TBD)

### Operational Docs
- [Deployment Runbook](#) (TBD)
- [Monitoring Dashboard](#) (TBD)
- [Incident Response Plan](./06-SECURITY-COMPLIANCE.md#6-incident-response)
- [On-Call Schedule](#) (TBD)

---

## ✅ Pre-Development Checklist

Before starting development, ensure:

- [ ] All team members have read the PRD
- [ ] Technical architecture is approved
- [ ] Database schema is finalized
- [ ] API specification is reviewed
- [ ] Development environment is set up
- [ ] CI/CD pipeline is configured
- [ ] External services are provisioned (Clerk, Supabase, etc.)
- [ ] Security checklist is understood
- [ ] Roadmap is communicated to stakeholders

---

## 📜 License

**Proprietary Software**  
© 2026 ContentPilot AI. All rights reserved.

This documentation and associated codebase are proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

**Last Updated**: February 9, 2026  
**Version**: 1.0  
**Status**: Ready for Development

---

*For questions about this documentation, contact the CTO or open an issue in the GitHub repository.*
