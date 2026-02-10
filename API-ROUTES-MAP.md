# API Routes Map

Quick reference for all API endpoints in ContentPilot AI.

---

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## 🔐 Authentication

All endpoints (except webhooks & health) require Clerk authentication.

**Authorization Header**:
```
Authorization: Bearer <clerk_session_token>
```

---

## 📍 Endpoints Reference

### **Pillars**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pillars` | List all pillars |
| `POST` | `/pillars` | Create new pillar |
| `GET` | `/pillars/:id` | Get pillar with stats |
| `PATCH` | `/pillars/:id` | Update pillar |
| `DELETE` | `/pillars/:id` | Delete pillar |

**Query Params (GET /pillars)**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status: `active` | `inactive` | `all`
- `sortBy` - Sort field: `name` | `createdAt` | `updatedAt`
- `sortOrder` - Sort direction: `asc` | `desc`

**Request Body (POST /pillars)**:
```json
{
  "name": "Founder Journey",
  "description": "Stories and insights from building startups",
  "tone": "conversational, authentic",
  "targetAudience": "Early-stage founders",
  "customPrompt": "Focus on practical lessons..."
}
```

---

### **Voice Training**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/voice/examples` | List voice examples |
| `POST` | `/voice/examples` | Add voice example |
| `DELETE` | `/voice/examples/:id` | Delete example |
| `POST` | `/voice/analyze` | Analyze voice profile |

**Query Params (GET /voice/examples)**:
- `page`, `limit` - Pagination
- `status` - Filter: `active` | `inactive` | `all`
- `pillarId` - Filter by pillar

**Request Body (POST /voice/examples)**:
```json
{
  "postText": "Your LinkedIn post content here (100-3000 chars)...",
  "pillarId": "uuid-optional"
}
```

**Response (POST /voice/analyze)**:
```json
{
  "confidenceScore": 85,
  "examplesAnalyzed": 7,
  "recommendation": "Excellent! Your voice profile is well-trained.",
  "profile": { ... }
}
```

---

### **User**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/user` | Get current user |
| `PATCH` | `/user/profile` | Update profile |
| `GET` | `/user/subscription` | Get subscription & usage |

**Response (GET /user)**:
```json
{
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "status": "active"
  },
  "profile": { ... },
  "subscription": { ... },
  "stats": {
    "pillarsCount": 3,
    "voiceExamplesCount": 7,
    "hasCompletedOnboarding": true
  }
}
```

**Response (GET /user/subscription)**:
```json
{
  "subscription": {
    "planType": "growth",
    "status": "active",
    "currentPeriodEnd": "2024-12-31T23:59:59Z"
  },
  "limits": {
    "postsPerMonth": 30,
    "pillars": 5,
    "regenerations": 10
  },
  "usage": {
    "postsThisMonth": 12,
    "regenerationsThisMonth": 3,
    "topicsClassified": 45
  },
  "remainingQuota": {
    "posts": 18,
    "regenerations": 7
  }
}
```

---

### **Topics**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/topics` | List classified topics |
| `POST` | `/topics` | Create manual topic |
| `GET` | `/topics/:id` | Get topic with drafts |
| `PATCH` | `/topics/:id` | Update topic |
| `DELETE` | `/topics/:id` | Delete topic |
| `POST` | `/topics/:id/generate` | Generate 3 draft variants |

**Query Params (GET /topics)**:
- `page`, `limit` - Pagination
- `status` - Filter: `classified` | `archived` | `all`
- `pillarId` - Filter by pillar
- `minScore` - Min AI score (default: 70)
- `sortBy` - `aiScore` | `createdAt` | `classifiedAt`
- `sortOrder` - `asc` | `desc`

**Request Body (POST /topics)**:
```json
{
  "content": "Article or insight content (50-5000 chars)...",
  "sourceUrl": "https://example.com/article",
  "pillarId": "uuid-optional"
}
```

**Response (POST /topics/:id/generate)**:
```json
{
  "message": "3 draft variants generated successfully",
  "drafts": [
    {
      "id": "uuid",
      "variantLetter": "A",
      "fullText": "...",
      "characterCount": 280,
      "status": "draft"
    },
    { "variantLetter": "B", ... },
    { "variantLetter": "C", ... }
  ],
  "topic": { ... }
}
```

---

### **Drafts**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/drafts` | List all drafts |
| `GET` | `/drafts/:id` | Get single draft |
| `PATCH` | `/drafts/:id` | Update draft |
| `DELETE` | `/drafts/:id` | Delete draft |
| `POST` | `/drafts/:id/approve` | Approve draft |
| `POST` | `/drafts/:id/schedule` | Schedule draft |
| `DELETE` | `/drafts/:id/schedule` | Cancel schedule |

**Query Params (GET /drafts)**:
- `page`, `limit` - Pagination
- `status` - Filter: `draft` | `approved` | `scheduled` | `posted` | `rejected` | `all`
- `pillarId` - Filter by pillar
- `sortBy` - `createdAt` | `updatedAt` | `approvedAt` | `scheduledFor`
- `sortOrder` - `asc` | `desc`

**Request Body (PATCH /drafts/:id)**:
```json
{
  "editedText": "Updated post text...",
  "feedbackNotes": "Made it more concise",
  "status": "approved"
}
```

**Request Body (POST /drafts/:id/schedule)**:
```json
{
  "scheduledFor": "2024-12-25T10:00:00Z"
}
```

**Draft Status Flow**:
```
draft → approved → scheduled → posted
   ↓        ↓
rejected  rejected
```

---

### **Webhooks**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhooks/clerk` | Clerk user sync |

**Clerk Events**:
- `user.created` - Creates user + profile in DB
- `user.updated` - Updates user data
- `user.deleted` - Deletes user (cascade)

**Webhook Signature Verification**:
Uses Svix library to verify `svix-id`, `svix-timestamp`, `svix-signature` headers.

---

### **Health Check**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | System health check |

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-20T10:30:00Z",
  "services": {
    "database": "up",
    "redis": "up"
  },
  "responseTime": "45ms",
  "version": "1.0.0"
}
```

**Response (503 Service Unavailable)**:
```json
{
  "status": "unhealthy",
  "timestamp": "2024-12-20T10:30:00Z",
  "services": {
    "database": "down",
    "redis": "up"
  }
}
```

---

## 🔥 Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Pillar not found",
    "status": 404
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| `400` | `BAD_REQUEST` | Invalid request data |
| `401` | `UNAUTHORIZED` | Missing or invalid auth token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Resource already exists |
| `422` | `VALIDATION_ERROR` | Request validation failed |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Server error |

**Validation Error Example**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "status": 422,
    "details": {
      "issues": [
        {
          "path": "name",
          "message": "Name must be at least 3 characters"
        }
      ]
    }
  }
}
```

---

## 🎯 Rate Limits

| Tier | Requests/Min | Notes |
|------|--------------|-------|
| Anonymous | 10 | By IP address |
| Authenticated | 60 | By user ID |
| Premium | 300 | By user ID |
| Admin | Unlimited | No limit |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1640000000
```

---

## 📦 Pagination Response Format

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "totalPages": 5
  }
}
```

---

## 🔧 Testing with cURL

### Get User Info
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Create Pillar
```bash
curl -X POST http://localhost:3000/api/pillars \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Startup Lessons",
    "description": "Insights from building startups"
  }'
```

### List Topics
```bash
curl -X GET "http://localhost:3000/api/topics?page=1&limit=10&status=classified" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Generate Drafts
```bash
curl -X POST http://localhost:3000/api/topics/TOPIC_ID/generate \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Schedule Draft
```bash
curl -X POST http://localhost:3000/api/drafts/DRAFT_ID/schedule \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledFor": "2024-12-25T10:00:00Z"
  }'
```

---

## 📱 Postman Collection

Import this into Postman for easy testing:

**Environment Variables**:
- `BASE_URL` = `http://localhost:3000/api`
- `CLERK_TOKEN` = `<your_clerk_session_token>`

**Pre-request Script** (set on collection level):
```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('CLERK_TOKEN')
});
```

---

## 🚀 Quick Start Guide

1. **Get Auth Token**
   - Sign in via Clerk UI
   - Get session token from Clerk

2. **Test Health**
   ```
   GET /api/health
   ```

3. **Get User**
   ```
   GET /api/user
   ```

4. **Create Pillar**
   ```
   POST /api/pillars
   ```

5. **Add Voice Examples**
   ```
   POST /api/voice/examples
   ```

6. **Create Topic**
   ```
   POST /api/topics
   ```

7. **Generate Drafts**
   ```
   POST /api/topics/:id/generate
   ```

8. **Approve & Schedule**
   ```
   POST /api/drafts/:id/approve
   POST /api/drafts/:id/schedule
   ```

---

**Last Updated**: December 2024  
**API Version**: 1.0.0
