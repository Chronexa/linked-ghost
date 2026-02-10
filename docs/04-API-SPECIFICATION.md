# API Specification
## ContentPilot AI - RESTful API Documentation

**Version:** 1.0  
**Base URL:** `https://app.contentpilot.ai/api`  
**Last Updated:** February 9, 2026

---

## 1. Authentication

### 1.1 Auth Method
- **Type**: Bearer Token (JWT)
- **Provider**: Clerk
- **Header**: `Authorization: Bearer <token>`

### 1.2 Obtaining Token
```typescript
// Frontend (automatic via Clerk)
const { getToken } = useAuth();
const token = await getToken();

// API Request
fetch('/api/topics', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 1.3 Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

## 2. Common Response Format

### 2.1 Success Response
```json
{
  "success": true,
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2026-02-09T10:30:00Z"
  }
}
```

### 2.2 List Response (Paginated)
```json
{
  "success": true,
  "data": [/* array of resources */],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8,
    "hasMore": true
  }
}
```

### 2.3 Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "pillar_name",
      "issue": "Must be between 3-50 characters"
    }
  }
}
```

### 2.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SUBSCRIPTION_LIMIT` | 402 | Plan limit reached |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 3. User & Profile API

### 3.1 Get Current User

**Endpoint**: `GET /api/user`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://...",
    "status": "active",
    "createdAt": "2026-01-15T10:00:00Z",
    "profile": {
      "id": "uuid",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "targetAudience": "Tech founders and startup leaders",
      "voiceConfidenceScore": 92,
      "lastVoiceTrainingAt": "2026-02-08T14:30:00Z"
    }
  }
}
```

---

### 3.2 Update User Profile

**Endpoint**: `PATCH /api/user/profile`

**Request Body**:
```json
{
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "targetAudience": "Tech founders and startup leaders",
  "writingStyle": "Conversational, story-driven"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "targetAudience": "Tech founders and startup leaders",
    "writingStyle": "Conversational, story-driven",
    "updatedAt": "2026-02-09T10:30:00Z"
  }
}
```

---

### 3.3 Get Subscription

**Endpoint**: `GET /api/user/subscription`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "planType": "growth",
    "status": "active",
    "currentPeriodEnd": "2026-03-15T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "limits": {
      "postsPerMonth": 30,
      "pillars": 5,
      "regenerations": 10
    },
    "usage": {
      "postsThisMonth": 12,
      "regenerationsThisMonth": 3
    }
  }
}
```

---

## 4. Pillars API

### 4.1 List Pillars

**Endpoint**: `GET /api/pillars`

**Query Parameters**:
- `status` (optional): `active` | `inactive` | `all`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Founder Journey",
      "slug": "founder_journey",
      "description": "Personal stories about building a startup",
      "targetAudience": "Aspiring founders",
      "tone": "authentic, vulnerable, inspiring",
      "status": "active",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

### 4.2 Create Pillar

**Endpoint**: `POST /api/pillars`

**Request Body**:
```json
{
  "name": "Industry Insights",
  "description": "Analysis of SaaS trends and market shifts",
  "targetAudience": "B2B SaaS founders",
  "tone": "analytical, data-driven"
}
```

**Validation**:
- `name`: Required, 3-50 characters, unique per user
- `description`: Optional, max 500 characters
- `tone`: Optional, max 200 characters

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Industry Insights",
    "slug": "industry_insights",
    "status": "active",
    "createdAt": "2026-02-09T10:30:00Z"
  }
}
```

**Errors**:
- `422`: Validation error (name too short, limit reached)
- `402`: Subscription limit (max pillars for plan)

---

### 4.3 Update Pillar

**Endpoint**: `PATCH /api/pillars/:id`

**Request Body**:
```json
{
  "name": "Industry Deep Dives",
  "description": "Updated description",
  "status": "active"
}
```

**Response**: 200 OK

---

### 4.4 Delete Pillar

**Endpoint**: `DELETE /api/pillars/:id`

**Response**: 204 No Content

**Errors**:
- `404`: Pillar not found
- `403`: Cannot delete pillar with associated content

---

## 5. Voice Examples API

### 5.1 List Voice Examples

**Endpoint**: `GET /api/voice/examples`

**Query Parameters**:
- `pillarId` (optional): Filter by pillar
- `status` (optional): `active` | `inactive` | `archived`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "postText": "Here's a truth bomb about building startups...",
      "characterCount": 847,
      "pillarId": "uuid",
      "pillarName": "Founder Journey",
      "postUrl": "https://linkedin.com/posts/...",
      "status": "active",
      "createdAt": "2026-01-20T10:00:00Z"
    }
  ]
}
```

---

### 5.2 Add Voice Example

**Endpoint**: `POST /api/voice/examples`

**Request Body**:
```json
{
  "postText": "Full LinkedIn post text here...",
  "pillarId": "uuid", // optional
  "postUrl": "https://linkedin.com/posts/..." // optional
}
```

**Validation**:
- `postText`: Required, min 100 characters, max 3000
- `pillarId`: Optional, must be valid UUID
- Limit: 10 examples (Starter), 20 (Growth), 50 (Agency)

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "postText": "...",
    "characterCount": 847,
    "status": "active",
    "createdAt": "2026-02-09T10:30:00Z"
  }
}
```

**Errors**:
- `402`: Subscription limit reached

---

### 5.3 Analyze Voice (Bulk)

**Endpoint**: `POST /api/voice/analyze`

**Description**: Analyze multiple posts and generate voice profile

**Request Body**:
```json
{
  "examples": [
    { "postText": "Post 1 text..." },
    { "postText": "Post 2 text..." },
    { "postText": "Post 3 text..." }
  ]
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "voiceProfile": {
      "tone": "conversational, story-driven",
      "avgLength": 892,
      "commonPhrases": ["Here's the thing", "Let me tell you"],
      "structurePattern": "hook → story → lesson → CTA",
      "confidenceScore": 94
    },
    "recommendations": [
      "Your posts perform best with personal anecdotes",
      "Average engagement is 3x higher on emotional hooks"
    ]
  }
}
```

---

## 6. Topics API

### 6.1 List Classified Topics

**Endpoint**: `GET /api/topics`

**Query Parameters**:
- `status` (optional): `classified` | `drafted` | `archived`
- `pillarId` (optional): Filter by pillar
- `minScore` (optional): Min AI score (default 70)
- `page` (optional): Page number (default 1)
- `limit` (optional): Items per page (default 20, max 100)

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "AI agents are transforming customer service...",
      "url": "https://source.com/article",
      "source": "perplexity",
      "pillarId": "uuid",
      "pillarName": "AI Innovation",
      "aiScore": 92,
      "hookAngle": "emotional",
      "reasoning": "High relevance to AI trends, strong emotional appeal",
      "status": "classified",
      "createdAt": "2026-02-09T06:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### 6.2 Get Topic Detail

**Endpoint**: `GET /api/topics/:id`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Full content text...",
    "url": "https://...",
    "source": "perplexity",
    "pillar": {
      "id": "uuid",
      "name": "AI Innovation",
      "tone": "forward-thinking, analytical"
    },
    "aiScore": 92,
    "hookAngle": "emotional",
    "reasoning": "...",
    "status": "classified",
    "drafts": [
      {
        "id": "uuid",
        "variantLetter": "A",
        "status": "draft",
        "characterCount": 847
      }
    ],
    "createdAt": "2026-02-09T06:15:00Z"
  }
}
```

---

### 6.3 Generate Drafts from Topic

**Endpoint**: `POST /api/topics/:id/generate`

**Description**: Generate 3 post variants (A, B, C) from a classified topic

**Request Body** (optional):
```json
{
  "regenerate": false, // Set true to regenerate existing drafts
  "instructions": "Make it more technical" // Optional custom instructions
}
```

**Response**: 200 OK (Streamed via SSE)
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "processing",
    "estimatedTime": 15
  }
}

// Then stream events:
// event: progress
// data: {"step": "analyzing_topic", "progress": 33}

// event: progress
// data: {"step": "generating_variants", "progress": 66}

// event: complete
// data: {
//   "drafts": [
//     { "id": "uuid", "variantLetter": "A", "fullText": "..." },
//     { "id": "uuid", "variantLetter": "B", "fullText": "..." },
//     { "id": "uuid", "variantLetter": "C", "fullText": "..." }
//   ]
// }
```

**Errors**:
- `402`: Subscription limit reached
- `409`: Drafts already exist (use `regenerate: true`)
- `429`: Rate limit exceeded (max 5 concurrent generations)

---

### 6.4 Archive Topic

**Endpoint**: `PATCH /api/topics/:id/archive`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "archived"
  }
}
```

---

## 7. Drafts API

### 7.1 List Drafts

**Endpoint**: `GET /api/drafts`

**Query Parameters**:
- `status` (optional): `draft` | `approved` | `rejected` | `posted` | `scheduled`
- `pillarId` (optional): Filter by pillar
- `page`, `limit`: Pagination

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "topicId": "uuid",
      "variantLetter": "A",
      "fullText": "AI agents aren't just the future—they're already here...",
      "characterCount": 847,
      "status": "draft",
      "pillar": {
        "id": "uuid",
        "name": "AI Innovation"
      },
      "createdAt": "2026-02-09T08:30:00Z"
    }
  ]
}
```

---

### 7.2 Get Draft Detail

**Endpoint**: `GET /api/drafts/:id`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "topicId": "uuid",
    "topic": {
      "content": "Source content...",
      "url": "https://..."
    },
    "variantLetter": "A",
    "hook": "AI agents aren't just the future...",
    "body": "Companies using AI-powered support...",
    "cta": "What's your take on AI in customer service?",
    "hashtags": "#AI #CustomerService #Innovation",
    "fullText": "Combined full post...",
    "characterCount": 847,
    "editedText": null,
    "userNotes": null,
    "status": "draft",
    "pillar": { /* ... */ },
    "createdAt": "2026-02-09T08:30:00Z"
  }
}
```

---

### 7.3 Update Draft

**Endpoint**: `PATCH /api/drafts/:id`

**Request Body**:
```json
{
  "editedText": "My edited version of the post...",
  "userNotes": "Changed tone to be more casual"
}
```

**Response**: 200 OK

---

### 7.4 Approve Draft

**Endpoint**: `POST /api/drafts/:id/approve`

**Request Body** (optional):
```json
{
  "scheduleFor": "2026-02-10T14:00:00Z" // Optional: schedule for future
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved", // or "scheduled"
    "approvedAt": "2026-02-09T10:30:00Z",
    "scheduledFor": "2026-02-10T14:00:00Z" // if scheduled
  }
}
```

**Side Effects**:
- Increments user's monthly post count
- If scheduled, creates background job for future posting

---

### 7.5 Reject Draft

**Endpoint**: `POST /api/drafts/:id/reject`

**Request Body**:
```json
{
  "reason": "Tone doesn't match my voice" // Optional feedback
}
```

**Response**: 200 OK

---

### 7.6 Regenerate Draft

**Endpoint**: `POST /api/drafts/:id/regenerate`

**Description**: Regenerate a specific variant with optional instructions

**Request Body**:
```json
{
  "instructions": "Make it shorter and more punchy" // Optional
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullText": "New regenerated text...",
    "characterCount": 652,
    "updatedAt": "2026-02-09T10:35:00Z"
  }
}
```

**Errors**:
- `402`: Regeneration limit reached for plan

---

## 8. Sources API (Future)

### 8.1 Configure Sources

**Endpoint**: `PATCH /api/user/sources`

**Request Body**:
```json
{
  "perplexity": {
    "enabled": true,
    "scheduledTime": "06:00"
  },
  "reddit": {
    "enabled": true,
    "subreddits": ["startups", "SaaS"],
    "keywords": ["founder", "growth hacking"]
  },
  "fireflies": {
    "enabled": false
  }
}
```

**Response**: 200 OK

---

## 9. Webhooks (for integrations)

### 9.1 Clerk Webhooks

**Endpoint**: `POST /api/webhooks/clerk`

**Events**:
- `user.created`: Create user in DB
- `user.updated`: Update user info
- `user.deleted`: Soft delete user

---

### 9.2 Stripe Webhooks

**Endpoint**: `POST /api/webhooks/stripe`

**Events**:
- `customer.subscription.created`: Create subscription
- `customer.subscription.updated`: Update subscription
- `customer.subscription.deleted`: Cancel subscription
- `invoice.payment_succeeded`: Confirm payment
- `invoice.payment_failed`: Handle failed payment

---

## 10. Cron Jobs (Internal)

### 10.1 Daily Content Research

**Endpoint**: `POST /api/cron/daily-research`

**Description**: Run for all active users (scheduled at 6 AM)

**Auth**: Vercel Cron Secret Header

---

### 10.2 Classify Pending Topics

**Endpoint**: `POST /api/cron/classify-topics`

**Description**: Batch process new topics every hour

---

## 11. Rate Limits

| Endpoint Pattern | Anonymous | Authenticated | Premium |
|------------------|-----------|---------------|---------|
| `GET /api/*` | 10/min | 100/min | 500/min |
| `POST /api/topics/*/generate` | N/A | 5/hour | 20/hour |
| `POST /api/drafts/*/regenerate` | N/A | 10/hour | Unlimited |
| `POST /api/voice/*` | N/A | 5/hour | 20/hour |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1675956000
```

---

## 12. Versioning

**Current Version**: v1 (implicit, no prefix needed)

**Future Versions**:
- When breaking changes needed, introduce `/api/v2/`
- Maintain v1 for 6 months after v2 release
- Deprecation warnings in response headers

---

## 13. Testing

### 13.1 Test API Keys

**Clerk Test Mode**: Use Clerk dev instance for testing

**Stripe Test Mode**: Use test credit cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### 13.2 Postman Collection

[Download Postman Collection](#) (link to exported JSON)

---

**Document Approvals:**
- [ ] Frontend Team
- [ ] Backend Team
- [ ] QA Team
- [ ] CTO
