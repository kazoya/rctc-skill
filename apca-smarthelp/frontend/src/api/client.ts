const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8798';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => undefined);
    }
    const message =
      typeof body === 'object' && body !== null && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.blob() as Promise<T>;
}

export interface HealthOut {
  status: string;
  app: string;
  version: string;
  embedding_available: boolean;
  ollama_reachable: boolean;
  copyright: string;
}

export interface DocumentOut {
  id: string;
  title: string;
  original_filename: string;
  author?: string | null;
  language?: string | null;
  page_count: number;
  copyright_owner?: string | null;
  user_notes?: string | null;
  status: string;
  imported_at: string;
  file_hash_sha256: string;
}

export interface DocumentUpdate {
  title?: string;
  author?: string;
  language?: string;
  copyright_owner?: string;
  user_notes?: string;
}

export interface TopicOut {
  id: string;
  document_id: string;
  chapter_id?: string | null;
  parent_topic_id?: string | null;
  title: string;
  heading_path?: string | null;
  summary?: string | null;
  page_from?: number | null;
  page_to?: number | null;
  body_text?: string | null;
  document_title?: string | null;
}

export interface TocNode {
  id: string;
  title: string;
  page_from?: number | null;
  children: TocNode[];
}

export interface SearchRequest {
  query: string;
  document_id?: string;
  language?: string;
  page_from?: number;
  page_to?: number;
  top_k?: number;
}

export interface SearchHit {
  passage_id: string;
  topic_id: string;
  topic_title: string;
  document_id: string;
  document_title: string;
  page_from?: number | null;
  page_to?: number | null;
  snippet: string;
  final_score: number;
  semantic_score: number;
  lexical_score: number;
  title_boost: number;
  phrase_boost: number;
  explanation: string;
}

export interface SearchResponse {
  query: string;
  action: 'auto_open' | 'show_results' | 'no_match';
  results: SearchHit[];
  message_ar?: string | null;
  message_en?: string | null;
}

export interface AskRequest {
  question: string;
  mode?: 'ask' | 'write_topic';
  tone?: 'formal' | 'casual';
  verbosity?: 'short' | 'detailed';
  document_id?: string;
}

export interface Citation {
  document_title: string;
  page?: number | null;
  topic_id?: string | null;
  passage_id?: string | null;
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
  evidence: SearchHit[];
  ollama_used: boolean;
}

export interface RelatedTopic {
  id: string;
  title: string;
  reason: string;
  page_from?: number | null;
}

export interface PackageExportRequest {
  package_title?: string;
  include_original_pdfs?: boolean;
}

export interface PackageValidateResult {
  valid: boolean;
  format_version?: string;
  package_title?: string;
  topic_count?: number;
  passage_count?: number;
  errors?: string[];
  warnings?: string[];
}

export interface JobOut {
  id: string;
  document_id?: string | null;
  status: string;
  progress: number;
  message?: string | null;
  error?: string | null;
}

export interface SettingsOut {
  settings: Record<string, unknown>;
}

export const api = {
  getHealth: () => request<HealthOut>('/api/health'),

  listDocuments: () => request<DocumentOut[]>('/api/documents'),

  getDocument: (id: string) => request<DocumentOut>(`/api/documents/${id}`),

  updateDocument: (id: string, data: DocumentUpdate) =>
    request<DocumentOut>(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDocument: (id: string) =>
    request<void>(`/api/documents/${id}`, { method: 'DELETE' }),

  reindexDocument: (id: string) =>
    request<JobOut>(`/api/documents/${id}/reindex`, { method: 'POST' }),

  importDocument: (formData: FormData) =>
    request<JobOut>('/api/documents/import', {
      method: 'POST',
      body: formData,
    }),

  getJob: (id: string) => request<JobOut>(`/api/jobs/${id}`),

  listTopics: (documentId?: string) => {
    const params = documentId ? `?document_id=${encodeURIComponent(documentId)}` : '';
    return request<TopicOut[]>(`/api/topics${params}`);
  },

  getTopic: (id: string) => request<TopicOut>(`/api/topics/${id}`),

  getRelatedTopics: (id: string) =>
    request<RelatedTopic[]>(`/api/topics/${id}/related`),

  getToc: (documentId: string) =>
    request<TocNode[]>(`/api/toc/${documentId}`),

  search: (data: SearchRequest) =>
    request<SearchResponse>('/api/search', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  ask: (data: AskRequest) =>
    request<AskResponse>('/api/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  exportPackage: (data: PackageExportRequest) =>
    request<Blob>('/api/packages/export', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  importPackage: (formData: FormData) =>
    request<JobOut>('/api/packages/import', {
      method: 'POST',
      body: formData,
    }),

  validatePackage: (formData: FormData) =>
    request<PackageValidateResult>('/api/packages/validate', {
      method: 'POST',
      body: formData,
    }),

  getSettings: () => request<SettingsOut>('/api/settings'),

  updateSettings: (settings: Record<string, unknown>) =>
    request<SettingsOut>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
};

export function getApiBaseUrl(): string {
  return BASE_URL;
}

export async function pollJob(
  jobId: string,
  onProgress?: (job: JobOut) => void,
  intervalMs = 1000,
): Promise<JobOut> {
  const terminal = new Set(['completed', 'failed', 'cancelled']);

  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const job = await api.getJob(jobId);
        onProgress?.(job);

        if (terminal.has(job.status)) {
          if (job.status === 'failed') {
            reject(new ApiError(job.error ?? 'Job failed', 500, job));
          } else {
            resolve(job);
          }
          return;
        }

        setTimeout(tick, intervalMs);
      } catch (err) {
        reject(err);
      }
    };

    void tick();
  });
}
