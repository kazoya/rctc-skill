import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  api,
  type DocumentOut,
  type RelatedTopic,
  type TopicOut,
  type TocNode,
  ApiError,
} from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { TocTree } from '../components/TocTree';
import { useI18n } from '../i18n';

export function HelpViewerPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const documentId = searchParams.get('document') ?? '';
  const topicId = searchParams.get('topic') ?? '';
  const searchQuery = searchParams.get('q') ?? '';

  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [toc, setToc] = useState<TocNode[]>([]);
  const [topic, setTopic] = useState<TopicOut | null>(null);
  const [related, setRelated] = useState<RelatedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicLoading, setTopicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      if (!documentId && docs.length > 0) {
        setSearchParams({ document: docs[0].id }, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.backendOffline);
    }
  }, [documentId, setSearchParams, t.common.backendOffline]);

  const loadToc = useCallback(async (docId: string) => {
    try {
      const tree = await api.getToc(docId);
      setToc(tree);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    }
  }, [t.common.error]);

  const loadTopic = useCallback(async (id: string) => {
    setTopicLoading(true);
    try {
      const [topicData, relatedData] = await Promise.all([
        api.getTopic(id),
        api.getRelatedTopics(id),
      ]);
      setTopic(topicData);
      setRelated(relatedData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setTopicLoading(false);
    }
  }, [t.common.error]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadDocuments();
      setLoading(false);
    })();
  }, [loadDocuments]);

  useEffect(() => {
    if (documentId) {
      void loadToc(documentId);
    }
  }, [documentId, loadToc]);

  useEffect(() => {
    if (topicId) {
      void loadTopic(topicId);
    } else {
      setTopic(null);
      setRelated([]);
    }
  }, [topicId, loadTopic]);

  const handleDocumentChange = (docId: string) => {
    setSearchParams({ document: docId });
  };

  const handleTopicSelect = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('topic', id);
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    navigate(`/search?q=${encodeURIComponent(localSearch.trim())}${documentId ? `&document=${documentId}` : ''}`);
  };

  const activeDoc = documents.find((d) => d.id === documentId);

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={t.viewer.title} subtitle={t.viewer.subtitle} />
      {error && <ErrorBanner message={error} />}

      <div className="help-viewer">
        <form className="help-viewer-toolbar" onSubmit={handleSearchSubmit}>
          <select
            value={documentId}
            onChange={(e) => handleDocumentChange(e.target.value)}
            aria-label={t.viewer.selectDocument}
          >
            <option value="">{t.viewer.selectDocument}</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t.viewer.searchPlaceholder}
          />
          <button type="submit" className="btn btn-primary">
            {t.search.search}
          </button>
        </form>

        <aside className="help-toc" aria-label={t.viewer.toc}>
          <div className="help-toc-header">{t.viewer.toc}</div>
          {toc.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              {documentId ? t.common.noResults : t.viewer.selectDocument}
            </div>
          ) : (
            <TocTree nodes={toc} activeId={topicId} onSelect={handleTopicSelect} />
          )}
        </aside>

        <article className="help-content">
          {topicLoading ? (
            <LoadingState />
          ) : topic ? (
            <>
              <h2>{topic.title}</h2>
              <div className="topic-meta">
                {topic.heading_path && (
                  <div>
                    {t.viewer.headingPath}: {topic.heading_path}
                  </div>
                )}
                {(topic.page_from != null || topic.page_to != null) && (
                  <div className="ltr">
                    {t.viewer.pageRange}: {topic.page_from ?? '—'} – {topic.page_to ?? '—'}
                  </div>
                )}
              </div>
              <div className="topic-body">
                {topic.body_text || topic.summary || t.common.noResults}
              </div>
            </>
          ) : (
            <div className="empty-state">{t.viewer.selectTopic}</div>
          )}
        </article>

        <aside className="help-sidebar">
          <div className="sidebar-block">
            <h3>{t.viewer.related}</h3>
            {related.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', margin: 0 }}>
                {t.viewer.noRelated}
              </p>
            ) : (
              <ul className="related-list">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/viewer?document=${documentId}&topic=${item.id}`}
                      onClick={() => handleTopicSelect(item.id)}
                    >
                      {item.title}
                    </Link>
                    <span className="related-reason">{item.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="sidebar-block source-info">
            <h3>{t.viewer.source}</h3>
            {topic && activeDoc ? (
              <dl>
                <dt>{t.common.document}</dt>
                <dd>{activeDoc.title}</dd>
                <dt>{t.library.filename}</dt>
                <dd className="ltr">{activeDoc.original_filename}</dd>
                {topic.page_from != null && (
                  <>
                    <dt>{t.common.page}</dt>
                    <dd className="ltr">{topic.page_from}</dd>
                  </>
                )}
                <dt className="ltr">topic_id</dt>
                <dd className="ltr">{topic.id}</dd>
              </dl>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', margin: 0 }}>—</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
