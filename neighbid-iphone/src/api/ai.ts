import {apiFetch, API_BASE, getToken, clearToken} from './client';

export interface AIChatResponse {
  reply: string;
  context_key: string;
  tokens_used: number | null;
  stub: boolean;
}

export interface QuoteSummaryVsNeighBid {
  neighbid_best_bid: number;
  saving_if_use_neighbid: number;
  neighbid_has_warranty: boolean;
}

export interface QuoteSummaryResponse {
  provider_name: string;
  quoted_amount: number;
  scope_summary: string;
  flags: string[];
  vs_neighbid: QuoteSummaryVsNeighBid | null;
  score: number;
  recommendation: string;
  stub: boolean;
}

export interface QuoteUploadFile {
  uri: string;
  name?: string | null;
  type?: string | null;
}

export const aiApi = {
  chat: (message: string, contextKey = 'general') =>
    apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({message, context_key: contextKey}),
    }),
  quoteSummaryText: (quoteText: string, requestId?: number | null) =>
    apiFetch<QuoteSummaryResponse>('/ai/quote-summary-text', {
      method: 'POST',
      body: JSON.stringify({quote_text: quoteText, request_id: requestId ?? null}),
    }),
  quoteSummaryFile: async (file: QuoteUploadFile, requestId?: number | null) => {
    const token = await getToken();
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name ?? 'quote-upload',
      type: file.type ?? 'application/octet-stream',
    } as any);
    if (requestId != null) {
      form.append('request_id', String(requestId));
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/ai/quote-summary`, {
      method: 'POST',
      headers,
      body: form,
    });

    if (!res.ok) {
      if (res.status === 401) {
        await clearToken();
        throw new Error('SESSION_EXPIRED');
      }
      const err = await res.json().catch(() => ({detail: res.statusText}));
      throw new Error(err.detail ?? 'Request failed');
    }

    return res.json() as Promise<QuoteSummaryResponse>;
  },
  clearMemory: (contextKey = 'general') =>
    apiFetch('/ai/memory', {method: 'DELETE'}),
};
