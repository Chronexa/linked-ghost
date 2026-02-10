# ContentPilot AI - Setup Guide

This guide will help you set up the development environment for ContentPilot AI.

---

## Prerequisites

- **Node.js** 20+ installed
- **npm** or **yarn** package manager
- **PostgreSQL** database (or Supabase account)
- **Git** installed

---

## Step 1: Environment Setup

### 1.1 Create `.env.local` file

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 1.2 Set up required services

You'll need accounts for the following services:

#### Required Services (Phase 0):
1. **Supabase** (PostgreSQL database)
   - Go to https://supabase.com
   - Create new project
   - Copy the **connection string** from Settings → Database
   - Add to `.env.local` as `DATABASE_URL`

2. **Clerk** (Authentication)
   - Go to https://clerk.com
   - Create new application
   - Copy **Publishable Key** and **Secret Key**
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
     CLERK_SECRET_KEY="sk_test_..."
     ```

3. **OpenAI** (AI Generation)
   - Go to https://platform.openai.com/api-keys
   - Create new API key
   - Add to `.env.local` as `OPENAI_API_KEY`

4. **Perplexity** (Content Discovery)
   - Go to https://perplexity.ai
   - Get API key
   - Add to `.env.local` as `PERPLEXITY_API_KEY`

#### Optional Services (Later phases):
- **Stripe** (Payments) - Week 10
- **Upstash Redis** (Caching) - Week 4
- **Sentry** (Error tracking) - Week 8

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- Drizzle ORM
- Clerk (authentication)
- PostgreSQL driver
- TypeScript
- Tailwind CSS

---

## Step 3: Database Setup

### 3.1 Generate database migrations

```bash
npm run db:generate
```

This creates migration files in the `./drizzle` folder based on your schema.

### 3.2 Push schema to database

```bash
npm run db:push
```

This applies the schema to your PostgreSQL database.

### 3.3 Verify database (optional)

Open Drizzle Studio to view your database:

```bash
npm run db:studio
```

This opens a web UI at `https://local.drizzle.studio`

---

## Step 4: Configure Clerk

### 4.1 Set up Clerk application

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Enable **Email** authentication
4. (Optional) Enable **OAuth providers**: Google, LinkedIn

### 4.2 Configure redirect URLs

In Clerk Dashboard → **Paths**:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in URL: `/onboarding`
- After sign-up URL: `/onboarding`

### 4.3 Set up webhooks (for user sync)

In Clerk Dashboard → **Webhooks**:
- Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
- Events to listen: `user.created`, `user.updated`, `user.deleted`
- Copy **Signing Secret** and add to `.env.local` as `CLERK_WEBHOOK_SECRET`

---

## Step 5: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 6: Verify Setup

### Test Authentication
1. Go to http://localhost:3000/sign-up
2. Create a test account
3. Verify you're redirected to `/onboarding`
4. Check Supabase dashboard - you should see a new user in the `users` table

### Test Database
1. Open http://localhost:3000/dashboard (after sign-in)
2. Should load without errors
3. Check browser console for any errors

---

## Troubleshooting

### Database Connection Error
```
Error: Cannot connect to database
```

**Solution:**
- Verify `DATABASE_URL` is correct in `.env.local`
- Check Supabase project is running
- Ensure your IP is whitelisted in Supabase (Settings → Database → Connection pooling)

### Clerk Authentication Error
```
Error: Clerk publishable key not found
```

**Solution:**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- Restart dev server (`npm run dev`)
- Check Clerk dashboard for correct API keys

### Module Not Found Error
```
Error: Cannot find module '@/lib/db'
```

**Solution:**
- Verify `tsconfig.json` has path aliases:
  ```json
  "paths": {
    "@/*": ["./*"]
  }
  ```
- Restart TypeScript server in VS Code

---

## Database Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema |
| `npm run db:push` | Push schema to database (dev only) |
| `npm run db:migrate` | Run migrations (production) |
| `npm run db:studio` | Open Drizzle Studio UI |
| `npm run db:drop` | Drop database (DANGER!) |

---

## Development Workflow

### 1. Make schema changes

Edit `lib/db/schema.ts`

### 2. Generate migration

```bash
npm run db:generate
```

### 3. Apply migration

```bash
npm run db:push
```

### 4. Commit changes

```bash
git add .
git commit -m "feat: add new table"
git push
```

---

## Next Steps

Once setup is complete:

1. **Review Documentation**: Read `/docs` folder
2. **Start Phase 1**: Begin implementing MVP features
3. **Follow Roadmap**: Reference `docs/05-DEVELOPMENT-ROADMAP.md`

---

## Important Files

```
.
├── .env.local               # Environment variables (not committed)
├── .env.example            # Environment template
├── middleware.ts           # Clerk authentication
├── drizzle.config.ts      # Drizzle configuration
├── lib/
│   ├── db/
│   │   ├── schema.ts      # Database schema (9 tables)
│   │   └── index.ts       # Database connection
│   ├── auth/
│   │   └── get-user.ts    # Auth helpers
│   └── api/
│       ├── response.ts    # API response helpers
│       ├── errors.ts      # Custom error classes
│       └── with-auth.ts   # API auth wrapper
├── app/
│   ├── (auth)/            # Sign-in/sign-up pages
│   ├── (app)/             # Protected app pages
│   └── api/               # API routes
└── docs/                   # Complete documentation
```

---

## Need Help?

- **Documentation**: `/docs` folder has comprehensive guides
- **Issues**: Check GitHub issues
- **Support**: engineering@contentpilot.ai

---

**Setup Complete!** 🎉

You're now ready to start developing ContentPilot AI. Follow the roadmap in `docs/05-DEVELOPMENT-ROADMAP.md` for next steps.
