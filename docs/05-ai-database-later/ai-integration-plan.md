# Later AI Integration Plan

Do not implement this in early UI phases.

## Future AI Responsibilities

1. Parse homeowner service request.
2. Classify service category.
3. Extract urgency, location, preferred time, and job details.
4. Match with existing service threads.
5. Recommend whether to join existing group or create a new one.
6. Rank provider bids using price, rating, review count, reliability, and availability.
7. Explain best recommendation in simple language.

## Placeholder UI Now

Show:
- AI assistant card
- mock "analyzing request" state
- detected service category
- suggested matching group
- recommendation explanation

## Future API Boundary

Possible frontend interface:

```ts
type ParsedServiceRequest = {
  serviceCategory: string;
  urgency: "low" | "medium" | "high";
  suggestedThreadId?: string;
  confidence: number;
};

async function parseServiceRequest(input: string): Promise<ParsedServiceRequest>;
```
