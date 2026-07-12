import {apiFetch} from './client';

export interface ProviderDashboard {
  cold_start: boolean;
  active_bids: number;
  jobs_completed: number;
  win_rate_pct: number;
  revenue_total_cents: number;
  revenue_30d_cents: number;
  avg_rating: number;
  reviews_count: number;
  unread_messages: number;
}

export interface JobFeedItem {
  id: number;
  title: string;
  category: string;
  neighborhood: string;
  distance_mi: number | null;
  status: string;
  budget_min: number;
  budget_max: number;
  bid_count: number;
  created_at: string;
  closes_at: string | null;
  group_id: number | null;
  member_count: number | null;
  is_group: boolean;
  primary_request_id: number | null;
}

export interface ProviderBid {
  id: number;
  request_id: number;
  request_title: string;
  request_category: string;
  request_neighborhood: string;
  amount: number;
  estimated_days: number;
  work_days: string[];
  status: string;
  request_status: string;
  created_at: string;
}

export interface ScheduleItem {
  id: number;
  request_id?: number | null;
  title: string;
  address: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
}

export interface ProviderProfile {
  company_name: string | null;
  trades: string | null;
  service_radius_mi: number;
  is_licensed: boolean;
  is_insured: boolean;
  neighborhood: string | null;
  address: string | null;
}

export interface ProviderConversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ProviderGroupChannel {
  id: number;
  request_id: number;
  request_title: string;
  member_count: number;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ProviderMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  conversation_id: number | null;
  channel_id: number | null;
  text: string;
  read_at: string | null;
  created_at: string;
}

export interface BidDraftResult {
  suggested_amount_cents: number;
  suggested_days: number;
  draft_text: string;
  headline: string;
  confidence: string;
  stub: boolean;
}

export interface SmartScheduleItem {
  title: string;
  suggested_start: string;
  duration_minutes: number;
  address: string | null;
  neighborhood: string;
  request_id: number | null;
  reason: string;
}

export interface SmartScheduleResult {
  date: string;
  items: SmartScheduleItem[];
  total_hours: number;
  estimated_revenue_cents: number;
  conflicts: string[];
  stub: boolean;
}

export interface DemandPrediction {
  category: string;
  predicted_requests: number;
  confidence: string;
  reasoning: string;
  provider_shortage: boolean;
  shortage_note: string;
}

export interface DemandForecastResult {
  neighborhood: string;
  forecast_period: string;
  predictions: DemandPrediction[];
  top_opportunity: string;
  stub: boolean;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  created_at: string;
}

export const providerApi = {
  getDashboard: () => apiFetch<ProviderDashboard>('/provider/dashboard'),
  getProfile: () => apiFetch<ProviderProfile>('/provider/me'),
  updateProfile: (data: Partial<ProviderProfile>) =>
    apiFetch<ProviderProfile>('/provider/me', {method: 'PATCH', body: JSON.stringify(data)}),
  getJobFeed: (category?: string) =>
    apiFetch<JobFeedItem[]>(`/provider/job-feed${category ? `?category=${category}` : ''}`),
  getBids: () => apiFetch<ProviderBid[]>('/provider/bids'),
  // GET /notifications only ever returns unread notifications (server-side
  // filtered), so there's no client-visible "read" state to track — dismiss
  // just marks it read server-side via markNotificationRead below.
  getNotifications: () => apiFetch<Notification[]>('/notifications'),
  markNotificationRead: (id: number) =>
    apiFetch<void>(`/notifications/${id}/read`, {method: 'POST'}),
  getSchedule: () => apiFetch<ScheduleItem[]>('/provider/schedule'),
  getConversations: () => apiFetch<ProviderConversation[]>('/provider/conversations'),
  getChannels: () => apiFetch<ProviderGroupChannel[]>('/provider/channels'),
  getMessages: (convId: number) =>
    apiFetch<ProviderMessage[]>(`/provider/conversations/${convId}/messages`),
  sendMessage: (convId: number, text: string) =>
    apiFetch<ProviderMessage>(`/provider/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({text}),
    }),
  getChannelMessages: (channelId: number) =>
    apiFetch<ProviderMessage[]>(`/provider/channels/${channelId}/messages`),
  sendChannelMessage: (channelId: number, text: string) =>
    apiFetch<ProviderMessage>(`/provider/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({text}),
    }),
  draftBid: (requestId: number) =>
    apiFetch<BidDraftResult>('/ai/bid-drafter', {
      method: 'POST',
      body: JSON.stringify({request_id: requestId}),
    }),
  submitBid: (requestId: number, amount: number, days: number, workDays: string[]) =>
    apiFetch(`/requests/${requestId}/bids`, {
      method: 'POST',
      body: JSON.stringify({amount, estimated_days: days, work_days: workDays}),
    }),
  getDemandForecast: (neighborhood: string) =>
    apiFetch<DemandForecastResult>(`/ai/demand-forecast?neighborhood=${encodeURIComponent(neighborhood)}`),
  getSmartSchedule: (date: string) =>
    apiFetch<SmartScheduleResult>('/ai/smart-schedule', {
      method: 'POST',
      body: JSON.stringify({date}),
    }),
};
