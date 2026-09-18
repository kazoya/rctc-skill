import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type AskResponse, type DocumentOut, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  response?: AskResponse;
}

export function AskPage() {
  const { t } = useI18n();
  const [question, setQuestion] = useState('');
  const [tone, setTone] = useState<'formal' | 'casual'>('formal');
  const [verbosity, setVerbosity] = useState<'short' | 'detailed'>('detailed');
  const [mode, setMode] = useState<'ask' | 'write_topic'>('ask');
  const [documentId, setDocumentId] = useState('');
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AskResponse | null>(null);

  useEffect(() => {
    void api.listDocuments().then(setDocuments).catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setQuestion('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.ask({
        question: q,
        mode,
        tone,
        verbosity,
        document_id: documentId || undefined,
      });
      setLastResponse(response);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer || t.ask.emptyAnswer,
          response,
        },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={t.ask.title} subtitle={t.ask.subtitle} />
      {error && <ErrorBanner message={error} />}

      <div className="chat-layout">
        <div className="panel chat-panel">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                {t.ask.questionPlaceholder}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant" aria-live="polite">
                {t.common.loading}
              </div>
            )}
          </div>

          <form className="chat-input-row" onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t.ask.questionPlaceholder}
              rows={2}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()}>
              {t.ask.send}
            </button>
          </form>
        </div>

        <aside>
          <div className="panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="ask-mode">{t.ask.mode}</label>
                <select
                  id="ask-mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'ask' | 'write_topic')}
                >
                  <option value="ask">{t.ask.modeAsk}</option>
                  <option value="write_topic">{t.ask.modeWriteTopic}</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="ask-tone">{t.ask.tone}</label>
                <select
                  id="ask-tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as 'formal' | 'casual')}
                >
                  <option value="formal">{t.ask.formal}</option>
                  <option value="casual">{t.ask.casual}</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="ask-verbosity">{t.ask.verbosity}</label>
                <select
                  id="ask-verbosity"
                  value={verbosity}
                  onChange={(e) => setVerbosity(e.target.value as 'short' | 'detailed')}
                >
                  <option value="short">{t.ask.short}</option>
                  <option value="detailed">{t.ask.detailed}</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="ask-doc">{t.search.filterDocument}</label>
                <select
                  id="ask-doc"
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
          </div>

          {lastResponse && (
            <>
              <div className="panel sidebar-block">
                <h3>{t.ask.citations}</h3>
                {lastResponse.citations.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-500)', margin: 0 }}>—</p>
                ) : (
                  <ul className="citation-list">
                    {lastResponse.citations.map((c, i) => (
                      <li key={i}>
                        {c.document_title}
                        {c.page != null && <span className="ltr"> — p.{c.page}</span>}
                        {c.topic_id && (
                          <>
                            {' '}
                            <Link to={`/viewer?topic=${c.topic_id}`} className="ltr">
                              [{c.topic_id}]
                            </Link>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: '0.75rem' }}>
                  {lastResponse.ollama_used ? t.ask.ollamaUsed : t.ask.ollamaFallback}
                </p>
              </div>

              {lastResponse.evidence.length > 0 && (
                <div className="panel sidebar-block">
                  <h3>{t.ask.evidence}</h3>
                  <ul className="evidence-list">
                    {lastResponse.evidence.map((hit) => (
                      <li key={hit.passage_id}>
                        <Link to={`/viewer?document=${hit.document_id}&topic=${hit.topic_id}`}>
                          {hit.topic_title}
                        </Link>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                          {hit.snippet.slice(0, 120)}…
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
