import {apiFetch} from './client';

export interface DashboardData {
  cold_start: boolean;
  active_requests: number;
  active_bids: number;
  total_saved_cents: number;
  unread_messages: number;
}

export interface HomeownerRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  neighborhood: string;
  status: string;
  budget_min: number;
  budget_max: number;
  bid_count: number;
  best_bid_cents: number | null;
  closes_at: string | null;
  created_at: string;
  group_id: number | null;
  group_status: string | null;
}

export interface HomeownerBid {
  id: number;
  request_id: number;
  request_title: string;
  provider_id: number;
  provider_name: string;
  amount: number;
  estimated_days: number;
  work_days: string[];
  status: string;
  created_at: string;
}

export interface HomeownerGroup {
  group_id: number;
  category: string;
  neighborhood: string;
  status: string;
  member_count: number;
  approved_count: number;
  my_approval_status: string;
  my_request_id: number;
  grouping_closes_at: string;
  hours_remaining: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface GroupChannel {
  id: number;
  request_id: number;
  request_title: string;
  archived: boolean;
  member_count: number;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  expires_at: string | null;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  conversation_id: number | null;
  channel_id: number | null;
  text: string;
  read_at: string | null;
  created_at: string;
}

export interface NeighbourhoodChannel {
  id: number;
  neighbourhood_id: number;
  neighbourhood_name: string;
  member_count: number;
}

export interface NeighbourhoodMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

export interface NeighbourhoodRequest {
  id: number;
  title: string;
  category: string;
  neighborhood: string;
  status: string;
  budget_min: number;
  budget_max: number;
  bid_count: number;
  owner_name: string;
  is_mine: boolean;
  group_id: number | null;
  group_status: string | null;
}

export const homeownerApi = {
  getDashboard: () => apiFetch<DashboardData>('/homeowner/dashboard'),
  getRequests: () => apiFetch<HomeownerRequest[]>('/homeowner/requests'),
  getBids: () => apiFetch<HomeownerBid[]>('/homeowner/bids'),
  getGroups: () => apiFetch<HomeownerGroup[]>('/homeowner/groups'),
  acceptBid: (bidId: number) =>
    apiFetch<HomeownerBid>(`/bids/${bidId}/accept`, {method: 'PUT'}),
  declineBid: (bidId: number) =>
    apiFetch<HomeownerBid>(`/bids/${bidId}/decline`, {method: 'PUT'}),
  approveGroup: (groupId: number) =>
    apiFetch<{status: string; message: string}>(
      `/homeowner/groups/${groupId}/approve`,
      {method: 'POST'},
    ),
  cancelGroup: (groupId: number) =>
    apiFetch<{status: string; message: string}>(
      `/homeowner/groups/${groupId}/cancel`,
      {method: 'POST'},
    ),
  getConversations: () => apiFetch<Conversation[]>('/homeowner/conversations'),
  getChannels: () => apiFetch<GroupChannel[]>('/homeowner/channels'),
  getDmMessages: (convId: number) =>
    apiFetch<ChatMessage[]>(`/homeowner/conversations/${convId}/messages`),
  sendDm: (convId: number, text: string) =>
    apiFetch<ChatMessage>(`/homeowner/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({text}),
    }),
  getChannelMessages: (channelId: number) =>
    apiFetch<ChatMessage[]>(`/homeowner/channels/${channelId}/messages`),
  sendChannelMessage: (channelId: number, text: string) =>
    apiFetch<ChatMessage>(`/homeowner/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({text}),
    }),
  getNeighbourhoodChannel: () =>
    apiFetch<NeighbourhoodChannel | null>('/neighbourhood/channel'),
  getNeighbourhoodMessages: (channelId: number) =>
    apiFetch<NeighbourhoodMessage[]>(
      `/neighbourhood/channel/${channelId}/messages`,
    ),
  sendNeighbourhoodMessage: (channelId: number, content: string) =>
    apiFetch<NeighbourhoodMessage>(
      `/neighbourhood/channel/${channelId}/messages`,
      {method: 'POST', body: JSON.stringify({content})},
    ),
  getNotifications: () =>
    apiFetch<Notification[]>('/notifications'),
  startConversation: (otherUserId: number) =>
    apiFetch<Conversation>(
      `/homeowner/conversations?other_user_id=${otherUserId}`,
      {method: 'POST'},
    ),
  getNeighbourhoodFeed: () =>
    apiFetch<NeighbourhoodRequest[]>('/neighbourhood/requests'),
  joinGroup: (
    category: string,
    neighborhood: string,
    budgetMin: number,
    budgetMax: number,
    groupId?: number | null,
  ) =>
    apiFetch<{id: number; group_id: number | null; group_status: string | null}>('/requests', {
      method: 'POST',
      body: JSON.stringify({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} service needed`,
        description: 'Joining neighbourhood group request.',
        category,
        neighborhood,
        status: 'live',
        budget_min: budgetMin,
        budget_max: budgetMax,
        group_id: groupId ?? null,
      }),
    }),
};
