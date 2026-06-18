# Later Database Integration Plan

Do not implement this in early UI phases.

## Future Entities

- User
- Role
- Community
- ResidenceVerification
- ServiceRequest
- ServiceThread
- Bid
- Provider
- Review
- Notification
- ServiceHistory
- RenewalReminder

## Early Frontend Mock Data

Use local mock objects shaped like future database entities.

This makes later migration easier.

## Suggested Future Tables

```text
users
communities
user_communities
service_requests
service_threads
thread_members
providers
bids
reviews
notifications
service_history
renewal_reminders
```

## Initial Rule

Do not add a real database until the website UI/UX is approved.
