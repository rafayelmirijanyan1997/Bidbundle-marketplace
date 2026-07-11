import {apiFetch} from './client';

export interface AnnouncementOut {
  id: number;
  hoa_id: number;
  title: string;
  body: string;
  pinned: boolean;
  created_by_name: string;
  created_at: string;
}

export interface ComplaintOut {
  id: number;
  hoa_id: number;
  resident_id: number;
  resident_name: string;
  title: string;
  description: string;
  category: string;
  status: string; // open | in_progress | resolved
  created_at: string;
  resolved_at: string | null;
}

export interface RuleOut {
  id: number;
  hoa_id: number;
  title: string;
  description: string;
  sort_order: number;
  created_by_name: string;
  created_at: string;
}

export const COMPLAINT_CATEGORIES = ['General', 'Noise', 'Parking', 'Maintenance', 'Safety', 'Other'];

// Announcements
export async function getAnnouncements(): Promise<AnnouncementOut[]> {
  return apiFetch<AnnouncementOut[]>('/hoa-community/announcements');
}

export async function createAnnouncement(
  title: string, body: string, pinned: boolean,
): Promise<AnnouncementOut> {
  return apiFetch<AnnouncementOut>('/hoa-community/announcements', {
    method: 'POST',
    body: JSON.stringify({title, body, pinned}),
  });
}

export async function togglePin(announcementId: number): Promise<AnnouncementOut> {
  return apiFetch<AnnouncementOut>(`/hoa-community/announcements/${announcementId}/pin`, {method: 'PATCH'});
}

export async function deleteAnnouncement(announcementId: number): Promise<void> {
  await apiFetch(`/hoa-community/announcements/${announcementId}`, {method: 'DELETE'});
}

// Complaints
export async function raiseComplaint(
  title: string, description: string, category: string,
): Promise<ComplaintOut> {
  return apiFetch<ComplaintOut>('/hoa-community/complaints', {
    method: 'POST',
    body: JSON.stringify({title, description, category}),
  });
}

export async function getComplaints(status?: string): Promise<ComplaintOut[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch<ComplaintOut[]>(`/hoa-community/complaints${qs}`);
}

export async function getMyComplaints(): Promise<ComplaintOut[]> {
  return apiFetch<ComplaintOut[]>('/hoa-community/my-complaints');
}

export async function updateComplaintStatus(
  complaintId: number, status: string,
): Promise<ComplaintOut> {
  return apiFetch<ComplaintOut>(`/hoa-community/complaints/${complaintId}/status`, {
    method: 'POST',
    body: JSON.stringify({status}),
  });
}

// Rules
export async function getRules(): Promise<RuleOut[]> {
  return apiFetch<RuleOut[]>('/hoa-community/rules');
}

export async function createRule(title: string, description: string): Promise<RuleOut> {
  return apiFetch<RuleOut>('/hoa-community/rules', {
    method: 'POST',
    body: JSON.stringify({title, description}),
  });
}

export async function deleteRule(ruleId: number): Promise<void> {
  await apiFetch(`/hoa-community/rules/${ruleId}`, {method: 'DELETE'});
}

// ── Polls ────────────────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Cleaning',
  'Painting', 'Roofing', 'Pest Control', 'Security', 'Other',
];

export interface PollOut {
  id: number;
  hoa_id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string; // open | closed | bid_launched
  closes_at: string;
  yes_count: number;
  no_count: number;
  total_votes: number;
  my_vote: 'yes' | 'no' | null;
  service_request_id: number | null;
  created_at: string;
}

export interface PollBidOut {
  bid_id: number;
  provider_name: string;
  amount: number;
  estimated_days: number;
  work_days: string;
  status: string;
  submitted_at: string;
}

export async function getPolls(): Promise<PollOut[]> {
  return apiFetch<PollOut[]>('/hoa-community/polls');
}

export async function getPoll(pollId: number): Promise<PollOut> {
  return apiFetch<PollOut>(`/hoa-community/polls/${pollId}`);
}

export async function createPoll(
  title: string, description: string, category: string,
  budgetMin: number | null, budgetMax: number | null, closesInDays: number,
): Promise<PollOut> {
  return apiFetch<PollOut>('/hoa-community/polls', {
    method: 'POST',
    body: JSON.stringify({
      title, description, category,
      budget_min: budgetMin, budget_max: budgetMax,
      closes_in_days: closesInDays,
    }),
  });
}

export async function votePoll(pollId: number, vote: 'yes' | 'no'): Promise<PollOut> {
  return apiFetch<PollOut>(`/hoa-community/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({vote}),
  });
}

export async function closePoll(pollId: number): Promise<PollOut> {
  return apiFetch<PollOut>(`/hoa-community/polls/${pollId}/close`, {method: 'POST'});
}

export async function launchPollBid(pollId: number): Promise<PollOut> {
  return apiFetch<PollOut>(`/hoa-community/polls/${pollId}/launch-bid`, {method: 'POST'});
}

export async function getPollBids(pollId: number): Promise<PollBidOut[]> {
  return apiFetch<PollBidOut[]>(`/hoa-community/polls/${pollId}/bids`);
}

export async function acceptPollBid(bidId: number): Promise<void> {
  await apiFetch(`/bids/${bidId}/accept`, {method: 'PUT'});
}

export async function declinePollBid(bidId: number): Promise<void> {
  await apiFetch(`/bids/${bidId}/decline`, {method: 'PUT'});
}
