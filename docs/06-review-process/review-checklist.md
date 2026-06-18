# Claude Review Checklist

After Codex completes a task, Claude must review:

## Playwright UI Check

- Open the local app in Playwright after Codex finishes.
- Check the primary task flow in a desktop viewport.
- Check the primary task flow in a mobile viewport.
- Note visible UI bugs, layout breaks, console/runtime issues, and broken interactions.

## Product Fit

- Does it match the task?
- Does it support the NeighBid concept?
- Does it avoid premature backend/AI/database implementation?

## UX

- Is the flow clear?
- Is the value proposition obvious?
- Does the user know what to do next?
- Are empty states handled?

## Responsive Design

- Works on laptop browser?
- Works on mobile browser?
- Touch targets are usable?
- Layout does not overflow?

## Code Quality

- Modular components?
- Clear state?
- No unrelated refactors?
- No hardcoded mess beyond acceptable mock data?
- Reusable patterns?

## Acceptance Criteria

- Every criterion checked?
- Anything missing?

## Output

Claude should create a review file in:

```text
docs/reviews/
```

The review file must include the Playwright UI results and any required fixes that came from that browser check.

Then ask Codex to fix only the required items.
