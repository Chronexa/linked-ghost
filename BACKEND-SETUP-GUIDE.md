# Backend Infrastructure Setup Guide

## 🎯 Overview

This guide will walk you through setting up:
1. **Supabase** (PostgreSQL database)
2. **Clerk** (Authentication)
3. **Upstash Redis** (Cache + Queue)
4. **Environment Variables**
5. **Database Schema Deployment**

---

## 1️⃣ Supabase Setup (PostgreSQL Database)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New Project"**
4. Fill in details:
   - **Name**: `contentpilot-ai` (or your choice)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Start with Free tier
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

### Step 2: Get Database Connection String

1. In your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Scroll to **Connection string**
4. Copy the **URI** format (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this as `DATABASE_URL` for later

### Step 3: Enable PostgreSQL Extensions

1. In Supabase dashboard, go to **Database** → **Extensions**
2. Enable these extensions:
   - ✅ `pgvector` (for voice embeddings)
   - ✅ `pg_trgm` (for fuzzy text search)
   - ✅ `uuid-ossp` (for UUID generation)

### Step 4: Configure Connection Pooling

1. Go to **Settings** → **Database**
2. Under **Connection Pooling**, copy the **Transaction mode** connection string
3. This is for Drizzle ORM (use this instead of direct connection)
4. It looks like:
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Save this as `DATABASE_URL` (pooled version is better for serverless)

---

## 2️⃣ Clerk Setup (Authentication)

### Step 1: Create Clerk Application

1. Go to [https://clerk.com](https://clerk.com)
2. Sign in or create account
3. Click **"Add application"**
4. Fill in details:
   - **Name**: `ContentPilot AI`
   - **Choose authentication methods**:
     - ✅ Email & Password
     - ✅ Google OAuth
     - ✅ LinkedIn OAuth (optional)
5. Click **"Create application"**

### Step 2: Get API Keys

1. In Clerk dashboard, go to **API Keys**
2. Copy these values:
   - **Publishable Key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret Key** (starts with `sk_test_...` or `sk_live_...`)
3. Save these as:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Step 3: Configure Redirect URLs

1. In Clerk dashboard, go to **Paths**
2. Set these paths:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/onboarding`
   - **Home URL**: `/`
3. Click **Save**

### Step 4: Set Up Webhooks (for user sync)

1. In Clerk dashboard, go to **Webhooks**
2. Click **"Add Endpoint"**
3. Enter endpoint URL:
   - Development: `https://[YOUR-VERCEL-PREVIEW].vercel.app/api/webhooks/clerk`
   - Production: `https://app.contentpilot.ai/api/webhooks/clerk`
4. Select events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_...`)
6. Save this as `CLERK_WEBHOOK_SECRET`

### Step 5: Configure OAuth Providers (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to Clerk: **User & Authentication** → **Social Connections** → **Google**
4. Enter Client ID and Secret

**LinkedIn OAuth:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create app and get credentials
3. Add to Clerk: **Social Connections** → **LinkedIn**

---

## 3️⃣ Upstash Redis Setup (Cache + Queue)

### Step 1: Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Sign in with GitHub (easiest)
3. Verify your account

### Step 2: Create Redis Database

1. Click **"Create Database"**
2. Fill in details:
   - **Name**: `contentpilot-cache`
   - **Type**: Regional (cheaper) or Global (faster)
   - **Region**: Same as your Supabase region (e.g., `us-east-1`)
   - **TLS**: Enabled (default)
3. Click **"Create"**

### Step 3: Get Redis Connection String

1. In your Redis dashboard, go to **Details**
2. Copy these values:
   - **REST URL** (for serverless environments)
   - **REST Token** (for authentication)
3. Or copy the full connection string:
   ```
   redis://default:[PASSWORD]@[HOST]:[PORT]
   ```
4. Save as `REDIS_URL`

### Step 4: (Optional) Create Separate Queue Database

For production, it's recommended to separate cache and queue:

1. Create another database named `contentpilot-queue`
2. Get its connection string
3. Save as `REDIS_QUEUE_URL`

---

## 4️⃣ OpenAI API Setup

### Step 1: Get OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign in or create account
3. Go to **API Keys** → **Create new secret key**
4. Name it: `ContentPilot AI`
5. Copy the key (starts with `sk-...`)
6. **Important**: Save immediately, you can't see it again!
7. Save as `OPENAI_API_KEY`

### Step 2: Set Usage Limits (Optional but Recommended)

1. Go to **Billing** → **Limits**
2. Set a monthly budget (e.g., $50 for testing)
3. Enable email alerts

---

## 5️⃣ Perplexity API Setup

### Step 1: Get Perplexity API Key

1. Go to [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Sign in or create account
3. Click **"Generate API Key"**
4. Copy the key (starts with `pplx-...`)
5. Save as `PERPLEXITY_API_KEY`

---

## 6️⃣ Environment Variables Setup

Create a `.env.local` file in your project root with all the values:

```bash
# Database
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"

# Redis (Upstash)
REDIS_URL="redis://default:[PASSWORD]@[HOST]:[PORT]"
REDIS_QUEUE_URL="redis://default:[PASSWORD]@[HOST]:[PORT]"  # Optional: separate queue

# AI Services
OPENAI_API_KEY="sk-xxxxxxxxxxxx"
PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxx"

# App URLs (update for production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional (for later phases)
# STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"
# STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
# RESEND_API_KEY="re_xxxxxxxxxxxx"
```

---

## 7️⃣ Verify Setup

### Check 1: Environment Variables

Run this command to verify all required env vars are set:

```bash
npm run check-env
```

### Check 2: Database Connection

Run this command to test database connection:

```bash
npm run db:test
```

### Check 3: Authentication

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/sign-in`
3. Try signing up with email
4. Check if redirected to onboarding

### Check 4: Redis Connection

Run this command to test Redis:

```bash
npm run redis:test
```

---

## 8️⃣ Deploy Database Schema

Once all environment variables are set, deploy the schema:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with test data
npm run db:seed
```

---

## 9️⃣ Vercel Environment Variables

When deploying to Vercel, add all environment variables:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable from `.env.local`
4. Make sure to set for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 🎉 Setup Complete Checklist

- [ ] Supabase project created
- [ ] Database connection string obtained
- [ ] PostgreSQL extensions enabled
- [ ] Clerk application created
- [ ] Clerk API keys obtained
- [ ] Clerk redirect URLs configured
- [ ] Clerk webhook set up
- [ ] Upstash Redis database created
- [ ] Redis connection string obtained
- [ ] OpenAI API key obtained
- [ ] Perplexity API key obtained
- [ ] `.env.local` file created with all keys
- [ ] Database schema deployed
- [ ] Authentication tested
- [ ] Redis connection tested
- [ ] Vercel environment variables set

---

## 📚 Next Steps

After completing this setup:

1. ✅ Run `npm run db:push` to deploy schema
2. ✅ Test authentication flow
3. ✅ Start building API endpoints
4. ✅ Implement AI services

---

## 🆘 Troubleshooting

### Database Connection Issues

**Error: "connection refused"**
- Check if `DATABASE_URL` is correct
- Verify you're using the **pooled** connection string (port 6543)
- Check if your IP is allowed in Supabase

**Error: "SSL required"**
- Add `?sslmode=require` to end of connection string

### Clerk Authentication Issues

**Error: "Clerk publishable key not found"**
- Check if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Restart dev server after adding env vars

**Error: "Redirect loop"**
- Check redirect URLs in Clerk dashboard
- Verify middleware.ts is configured correctly

### Redis Connection Issues

**Error: "connection timeout"**
- Check if `REDIS_URL` is correct
- Verify your IP isn't blocked
- Try using REST API instead of TCP

---

## 💡 Pro Tips

1. **Use connection pooling** - Always use Supabase's pooled connection (port 6543)
2. **Separate environments** - Use different databases for dev/staging/prod
3. **Monitor usage** - Set up billing alerts for OpenAI and Perplexity
4. **Backup regularly** - Supabase auto-backups, but export manually too
5. **Rotate keys** - Change API keys every 90 days for security

---

**Ready to continue? Check `drizzle.config.ts` and `lib/db/schema.ts` next!**
