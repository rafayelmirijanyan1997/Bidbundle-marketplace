# Architecture Notes

## Current Target

Responsive website.

Recommended frontend stack can be chosen by Claude/Codex based on repo context.

If starting from scratch, a good default is:
- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- Component-based layout
- Mock data first

## Architecture Principle

Build UI and UX first with clean seams for later integrations.

## Suggested Frontend Layers

```text
src/
  app/
  components/
  pages/
  layouts/
  data/
  services/
  hooks/
  types/
  utils/
```

## Service Placeholder Pattern

Create frontend service files that currently return mock data.

Later, these can be replaced by real API calls.

Examples:

```text
services/aiRoutingService.ts
services/bidService.ts
services/communityService.ts
services/providerService.ts
services/notificationService.ts
```

## Data Placeholder Pattern

Use mock data files early:

```text
data/mockUsers.ts
data/mockCommunities.ts
data/mockServiceRequests.ts
data/mockBids.ts
data/mockProviders.ts
```

## Later Backend Possibilities

Potential later stack:
- Node.js or Python API
- PostgreSQL for persistent data
- Redis for bidding state
- WebSockets for real-time bid updates
- LLM service for request parsing
- Google Maps API for locality logic
- Firebase Cloud Messaging for notifications

Do not implement these in the first UI phase.
