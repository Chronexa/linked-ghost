# 🧪 Testing Commands - Quick Reference

## Reset Your Account for Testing

**Your Email:** `ankdhiman88@gmail.com`

### Command
```bash
npx tsx scripts/reset-user.ts ankdhiman88@gmail.com
```

### What This Does
- ✅ Keeps your Clerk account (can still sign in)
- ✅ Deletes all your data (pillars, topics, drafts, voice samples)
- ✅ Resets onboarding state
- ✅ Next sign-in → Onboarding starts fresh

### When to Use
- Testing onboarding flow
- Testing with fresh data
- Resetting after breaking changes
- Before demoing to someone

---

## Other Useful Commands

### Start Dev Server
```bash
npm run dev
```

### View Database (Drizzle Studio)
```bash
npx drizzle-kit studio
# → Opens http://localhost:4983
```

### Run Migrations
```bash
npx drizzle-kit push
```

### Test Scripts
```bash
# Test database connection
npx tsx scripts/test-db.ts

# Test Perplexity API
npx tsx scripts/test-perplexity.ts

# Test draft generation
npx tsx scripts/test-draft-generation.ts
```

---

## Quick Links

- **Clerk Dashboard:** https://dashboard.clerk.com/
- **Localhost:** http://localhost:3000
- **Testing Guide:** [testing_guide.md](file:///Users/ankitdhiman/.gemini/antigravity/brain/8007138d-6676-48ee-a1c0-f136bb1a3ca4/testing_guide.md)

---

**💡 Tip:** Bookmark this file! It's in your project root for easy access.
