import {apiFetch} from './client';

export interface HOAOut {
  id: number;
  name: string;
  neighborhood: string;
  admin_user_id: number;
  type: string | null;
  unit_count: number | null;
  master_invite_code: string | null;
  created_at: string;
}

export interface HoaMemberOut {
  user_id: number;
  full_name: string;
  email: string;
  unit_number: string | null;
  eligibility: string;
  created_at: string;
}

export interface InviteOut {
  id: number;
  hoa_id: number;
  email: string;
  code: string;
  unit_number: string | null;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface HoaStatsOut {
  community_name: string;
  community_type: string | null;
  total_members: number;
  active_requests: number;
  total_savings: number;
  master_invite_code: string | null;
}

export async function getMyAdminCommunity(): Promise<HOAOut> {
  return apiFetch<HOAOut>('/community/mine');
}

export async function getHoaStats(hoaId: number): Promise<HoaStatsOut> {
  return apiFetch<HoaStatsOut>(`/community/${hoaId}/stats`);
}

export async function getHoaMembers(hoaId: number): Promise<HoaMemberOut[]> {
  return apiFetch<HoaMemberOut[]>(`/community/${hoaId}/members`);
}

export async function createInvite(
  hoaId: number,
  email: string,
  unitNumber?: string,
): Promise<InviteOut> {
  return apiFetch<InviteOut>(`/community/${hoaId}/invite`, {
    method: 'POST',
    body: JSON.stringify({email, unit_number: unitNumber ?? null}),
  });
}

export async function removeMember(hoaId: number, userId: number): Promise<void> {
  await apiFetch(`/community/${hoaId}/members/${userId}`, {method: 'DELETE'});
}

export async function getMyHoaCommunity(): Promise<HOAOut> {
  return apiFetch<HOAOut>('/community/my-community');
}

export interface MembershipRequestOut {
  id: number;
  user_id: number;
  hoa_id: number;
  status: string; // pending|approved|declined|revoked
  note: string | null;
  created_at: string;
  reviewed_at: string | null;
  full_name: string;
  email: string;
  unit_number: string | null;
}

export interface MyStatusOut {
  status: string; // pending|approved|declined|revoked|none
  hoa_name: string | null;
  hoa_id: number | null;
  request_id: number | null;
}

export async function getMyMembershipStatus(): Promise<MyStatusOut> {
  return apiFetch<MyStatusOut>('/community/my-status');
}

export async function getMembershipRequests(): Promise<MembershipRequestOut[]> {
  return apiFetch<MembershipRequestOut[]>('/community/mine/requests');
}

export async function approveMembershipRequest(requestId: number): Promise<void> {
  await apiFetch(`/community/requests/${requestId}/approve`, {method: 'POST'});
}

export async function declineMembershipRequest(requestId: number): Promise<void> {
  await apiFetch(`/community/requests/${requestId}/decline`, {method: 'POST'});
}
