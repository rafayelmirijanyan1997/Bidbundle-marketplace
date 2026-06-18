# Design Direction

Claude should not invent a new visual direction.
Claude must use the mobile reference screenshots in `docs/design-reference/` as the primary design source for NeighBid.
The mobile app theme, page structure, spacing style, and component feel should closely match those references.
The product should be implemented as a website in the browser with app-like mobile UX, not as a native app and not as a conventional content website.

Current screenshot files:

- `docs/design-reference/image.png`
- `docs/design-reference/image copy.png`
- `docs/design-reference/image copy 2.png`
- `docs/design-reference/image copy 3.png`
- `docs/design-reference/image copy 4.png`

## Brand

Name: NeighBid

Tagline:

```text
Your neighbourhood. Your power. Your price.
```

## Style Direction

Required visual style:

- mobile-first product UI based on the provided screenshot set
- browser-based website screens that feel like native app screens on mobile
- warm off-white app background, not a full dark-page background
- dark navy header and hero surfaces
- bright blue primary CTA buttons
- orange highlight panels for urgency, live bidding, and savings callouts
- white cards with soft gray dividers and subtle shadows
- rounded-rectangle panels with compact spacing
- crisp black or near-black text on light surfaces
- small metric chips and status pills
- polished iOS-style mobile composition
- clean premium marketplace tone, not an experimental dashboard aesthetic

## Screenshot Reference Rules

Claude must treat the screenshots in `docs/design-reference/` as the reference for:

- onboarding structure
- role selection cards
- community verification screen
- homeowner dashboard layout
- AI/chat/request flow
- bidding list and bid detail cards
- booking confirmation and service tracking screens
- provider bidding flow
- provider profile and review screens
- bottom tab destinations and icon-first mobile navigation

Claude may adapt details only when necessary for web usability, but must keep the same theme language and layout hierarchy.
For mobile UI tasks, Claude should assume the screenshots are the binding UX reference unless the user explicitly overrides them.

The mobile version should look as close as reasonably possible to the screenshots:

- light canvas background
- dark top summary cards
- strong blue action buttons
- orange status banners
- white rounded content cards
- compact mobile spacing
- bottom tab bar with light background and blue active state

For most product tasks, the default assumption should be:

- build app screens first
- use bottom tab navigation on mobile app flows
- keep marketing-site sections secondary unless the task is specifically the landing page

Desktop layouts should be derived from the same mobile design system, not from the older dark desktop-shell direction.

## UX Principles

1. Make the saving-money value obvious.
2. Make group bidding feel transparent.
3. Make the AI assistant helpful but not magical.
4. Keep each role's dashboard simple.
5. Keep mobile layouts compact and touch-friendly.
6. Follow the screenshot structure before adding new patterns.
7. Avoid backend complexity during early UI stages.

## Claude Design Constraints

Claude should decide only the details that are not already established by the screenshots.

Claude must preserve:
- the visual hierarchy shown in the screenshots
- the light-theme mobile surfaces
- the dark navy summary/header blocks
- the blue/orange accent system
- the rounded card language
- the bottom tab navigation structure for app screens
- the stacked single-column mobile page rhythm

Claude should document any required deviations from the screenshot references in:

```text
docs/decision-log/
```

Claude should not switch the product back to a full dark desktop dashboard theme unless the user explicitly asks for that.

Claude should document major design decisions in:

```text
docs/decision-log/
```
