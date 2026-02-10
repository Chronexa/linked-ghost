# 📋 Backend Setup Checklist

Use this checklist to track your progress through the backend infrastructure setup.

---

## 1️⃣ Supabase (PostgreSQL Database)

- [ ] **Create Supabase account** at https://supabase.com
- [ ] **Create new project**
  - Project name: `contentpilot-ai`
  - Strong database password (save it!)
  - Region: Choose closest to you
- [ ] **Get connection string**
  - Go to: Settings → Database → Connection string
  - Copy the **POOLED** connection (port 6543)
  - Paste into `.env.local` as `DATABASE_URL`
- [ ] **Enable PostgreSQL extensions**
  - Go to: Database → Extensions
  - Enable: `pgvector`, `pg_trgm`, `uuid-ossp`
- [ ] **Test connection**
  - Run: `npm run db:test`
  - Should see: ✅ Database connection successful

---

## 2️⃣ Clerk (Authentication)

- [ ] **Create Clerk account** at https://clerk.com
- [ ] **Create new application**
  - Name: `ContentPilot AI`
  - Enable: Email & Password, Google OAuth
- [ ] **Get API keys**
  - Go to: API Keys
  - Copy: Publishable Key → `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Copy: Secret Key → `.env.local` as `CLERK_SECRET_KEY`
- [ ] **Configure redirect URLs**
  - Go to: Paths
  - Set sign-in URL: `/sign-in`
  - Set sign-up URL: `/sign-up`
  - Set after sign-in: `/dashboard`
  - Set after sign-up: `/onboarding`
- [ ] **Set up webhook** (for user sync)
  - Go to: Webhooks → Add Endpoint
  - URL: `https://[your-app].vercel.app/api/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`
  - Copy: Signing Secret → `.env.local` as `CLERK_WEBHOOK_SECRET`
- [ ] **Test authentication**
  - Run: `npm run dev`
  - Visit: http://localhost:3000/sign-in
  - Try signing up

---

## 3️⃣ Upstash Redis (Cache & Queue)

- [ ] **Create Upstash account** at https://upstash.com
- [ ] **Create new database**
  - Name: `contentpilot-cache`
  - Type: Regional (cheaper)
  - Region: Same as Supabase
  - TLS: Enabled
- [ ] **Get connection details**
  - Go to: Your Database → Details
  - Copy: REST URL → `.env.local` as `REDIS_URL`
- [ ] **Test connection**
  - Run: `npm run redis:test`
  - Should see: ✅ Redis connection successful

---

## 4️⃣ OpenAI (AI Services)

- [ ] **Create OpenAI account** at https://platform.openai.com
- [ ] **Get API key**
  - Go to: API Keys → Create new secret key
  - Name: `ContentPilot AI`
  - Copy immediately (can't see again!)
  - Paste into `.env.local` as `OPENAI_API_KEY`
- [ ] **Set usage limits** (optional but recommended)
  - Go to: Billing → Limits
  - Set monthly budget: $50 (for testing)
  - Enable email alerts

---

## 5️⃣ Perplexity (Content Discovery)

- [ ] **Create Perplexity account** at https://www.perplexity.ai
- [ ] **Get API key**
  - Go to: Settings → API
  - Click: Generate API Key
  - Copy: Key → `.env.local` as `PERPLEXITY_API_KEY`

---

## 6️⃣ Environment Variables

- [ ] **Verify all required vars are set**
  - Run: `npm run check-env`
  - Should see: ✅ All required environment variables are set
- [ ] **Restart dev server** (if running)
  - Stop: Ctrl+C
  - Start: `npm run dev`

---

## 7️⃣ Database Schema Deployment

- [ ] **Generate migration files**
  - Run: `npm run db:generate`
  - Check: `lib/db/migrations/` folder created
- [ ] **Deploy schema to Supabase**
  - Run: `npm run db:push`
  - Should see: "Everything is good" message
- [ ] **Verify in Supabase dashboard**
  - Go to: Supabase → Database → Tables
  - Should see 8 tables:
    - [x] users
    - [x] profiles
    - [x] pillars
    - [x] voice_examples
    - [x] raw_topics
    - [x] classified_topics
    - [x] generated_drafts
    - [x] subscriptions
- [ ] **(Optional) Open Drizzle Studio**
  - Run: `npm run db:studio`
  - Opens GUI at: http://localhost:4983

---

## 8️⃣ Final Verification

- [ ] **Run all tests**
  - Run: `npm run setup`
  - All tests should pass
- [ ] **Test authentication flow**
  - Visit: http://localhost:3000/sign-in
  - Sign up with email
  - Check if redirected to /onboarding
  - Check Supabase: Should see new user in `users` table
- [ ] **Check all pages load**
  - Dashboard: http://localhost:3000/dashboard
  - Topics: http://localhost:3000/topics
  - Drafts: http://localhost:3000/drafts
  - Pillars: http://localhost:3000/pillars
  - Voice: http://localhost:3000/voice
  - Analytics: http://localhost:3000/analytics
  - Settings: http://localhost:3000/settings

---

## 9️⃣ Optional: Vercel Deployment

- [ ] **Create Vercel account** at https://vercel.com
- [ ] **Import GitHub repository**
- [ ] **Add environment variables**
  - Copy all from `.env.local` to Vercel
  - Set for: Production, Preview, Development
- [ ] **Deploy**
- [ ] **Update Clerk webhook URL**
  - Change to: `https://[your-app].vercel.app/api/webhooks/clerk`

---

## 🎉 Completion Status

Track your overall progress:

```
Infrastructure Setup:
[_] Supabase (Database)
[_] Clerk (Authentication)
[_] Upstash (Redis)
[_] OpenAI (AI)
[_] Perplexity (Research)

Configuration:
[_] Environment variables set
[_] All tests passing

Database:
[_] Schema deployed
[_] Tables verified
[_] User sync working

Deployment:
[_] Vercel connected (optional)
```

---

## 🆘 Having Issues?

If you encounter any issues:

1. Check the detailed guide: `BACKEND-SETUP-GUIDE.md`
2. Run diagnostics: `npm run check-env`
3. Check logs for specific errors
4. Verify all API keys are correct
5. Restart dev server after changing `.env.local`

---

## ✅ When Complete

Once all checkboxes are ✅, you're ready to:

1. Start building API endpoints
2. Implement AI services
3. Connect frontend to backend
4. Test end-to-end workflows

**Next step: Start implementing API routes in `app/api/`** 🚀

---

**Estimated Time:**
- Supabase setup: 10 min
- Clerk setup: 10 min
- Redis setup: 5 min
- OpenAI/Perplexity: 5 min
- Environment config: 5 min
- Database deployment: 5 min
- Testing: 5 min
**Total: ~45 minutes**
