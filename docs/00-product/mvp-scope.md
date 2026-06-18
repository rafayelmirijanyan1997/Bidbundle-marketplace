# MVP Scope

## Phase 1 MVP: Website UI/UX

The first MVP is not a fully functional marketplace.

It is a responsive website prototype with clear user flows and realistic mock interactions.

## In Scope

- Responsive website shell
- Landing page
- Role selection
- Homeowner onboarding
- Provider onboarding
- HOA admin preview
- Homeowner dashboard
- Shared community chat mock
- Service request creation flow
- AI assistant placeholder
- Active bidding room
- Provider bid cards
- Provider dashboard
- Basic history/renewals mock page
- Settings/profile placeholders

## Out of Scope Initially

- Real authentication
- Real database
- Real AI routing
- Real provider matching
- Real WebSockets
- Real notifications
- Payments/escrow
- Native iOS/Android app
- Production maps integration

## Required Placeholder Strategy

Create stable frontend boundaries so later phases can connect real services.

Examples:
- `mockUsers`
- `mockServiceRequests`
- `mockBids`
- `aiRoutingService.placeholder.ts`
- `databaseService.placeholder.ts`
- `notificationService.placeholder.ts`
