import {apiFetch} from './client';

export interface DigestResponse {
  digest: string;
  member_count: number;
  active_request_count: number;
  top_category: string | null;
}

export interface AnnouncementResponse {
  announcement: string;
  subject_line: string;
}

export interface Opportunity {
  category: string;
  request_count: number;
  estimated_saving_pct: number;
  suggestion: string;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  summary: string;
}

export async function getDigest(): Promise<DigestResponse> {
  return apiFetch<DigestResponse>('/hoa-ai/digest');
}

export async function composeAnnouncement(roughText: string): Promise<AnnouncementResponse> {
  return apiFetch<AnnouncementResponse>('/hoa-ai/announcement', {
    method: 'POST',
    body: JSON.stringify({rough_text: roughText}),
  });
}

export async function getOpportunities(): Promise<OpportunitiesResponse> {
  return apiFetch<OpportunitiesResponse>('/hoa-ai/opportunities');
}
