import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, type DocumentOut, type SearchHit, type SearchResponse, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

export function SearchResultsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const autoOpened = useRef(false);

  const queryParam = searchParams.get('q') ?? '';
  const documentParam = searchParams.get('document') ?? '';

  const [query, setQuery] = useState(queryParam);
  const [documentId, setDocumentId] = useState(documentParam);
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.listDocuments().then(setDocuments).catch(() => undefined);
  }, []);

  const runSearch = useCallback(
    async (q: string, docId?: string) => {
      if (!q.trim()) return;
      setLoading(true);
      setError(null);
      autoOpened.current = false;
      try {
        const result = await api.search({
          query: q.trim(),
          document_id: docId || undefined,
        });
        setResponse(result);

        if (result.action === 'auto_open' && result.results.length > 0 && !autoOpened.current) {
          autoOpened.current = true;
          const hit = result.results[0];
          navigate(`/viewer?document=${hit.document_id}&topic=${hit.topic_id}`);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.common.error);
      } finally {
        setLoading(false);
      }
    },
    [navigate, t.common.error],
  );

  useEffect(() => {
    if (queryParam) {
      void runSearch(queryParam, documentParam || undefined);
    }
  }, [queryParam, documentParam, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = { q: query };
    if (documentId) params.document = documentId;
    setSearchParams(params);
  };

  const renderHit = (hit: SearchHit) => (
    <article key={hit.passage_id} className="search-hit">
      <h3>
        <Link to={`/viewer?document=${hit.document_id}&topic=${hit.topic_id}`}>
          {hit.topic_title}
        </Link>
      </h3>
      <div className="hit-meta">
        <span>{hit.document_title}</span>
        {hit.page_from != null && (
          <>
            {' · '}
            <span className="ltr">
              {t.common.page} {hit.page_from}
              {hit.page_to != null && hit.page_to !== hit.page_from ? `–${hit.page_to}` : ''}
            </span>
          </>
        )}
        {' · '}
        <span>
          {t.common.confidence}:{' '}
          <span className="score-value">{(hit.final_score * 100).toFixed(1)}%</span>
        </span>
      </div>
      <p className="hit-snippet">{hit.snippet}</p>
      <div className="hit-explanation">
        <strong>{t.search.explanation}:</strong> {hit.explanation}
      </div>
    </article>
  );

  const message =
    response &&
    (locale === 'ar' ? response.message_ar : response.message_en);

  return (
    <>
      <PageHeader title={t.search.title} subtitle={t.search.subtitle} />

      <form onSubmit={handleSubmit} className="panel" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div className="form-grid two-col">
          <div className="field">
            <label htmlFor="search-query">{t.search.queryPlaceholder}</label>
            <input
              id="search-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.queryPlaceholder}
            />
          </div>
          <div className="field">
            <label htmlFor="search-doc">{t.search.filterDocument}</label>
            <select
              id="search-doc"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
            >
              <option value="">{t.search.allDocuments}</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
          {t.search.search}
        </button>
      </form>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && response?.action === 'auto_open' && (
        <div className="success-banner">{t.search.autoOpen}</div>
      )}
      {!loading && response && (
        <>
          {message && <p style={{ color: 'var(--ink-600)' }}>{message}</p>}
          {response.action === 'no_match' || response.results.length === 0 ? (
            <div className="panel empty-state">{t.search.noMatch}</div>
          ) : (
            <div className="panel">{response.results.map(renderHit)}</div>
          )}
        </>
      )}
    </>
  );
}
