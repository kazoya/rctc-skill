import { useEffect, useState } from 'react';
import { api, getApiBaseUrl, type HealthOut, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

export function AboutPage() {
  const { t } = useI18n();
  const [health, setHealth] = useState<HealthOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.common.backendOffline);
      } finally {
        setLoading(false);
      }
    })();
  }, [t.common.backendOffline]);

  return (
    <>
      <PageHeader title={t.about.title} />
      {error && <ErrorBanner message={error} />}

      <div className="panel" style={{ padding: '1.5rem', maxWidth: '720px' }}>
        <p style={{ marginTop: 0, lineHeight: 1.65 }}>{t.about.description}</p>

        {loading ? (
          <LoadingState />
        ) : health ? (
          <dl className="source-info" style={{ marginTop: '1.5rem' }}>
            <dt>{t.about.version}</dt>
            <dd className="ltr">
              {health.app} {health.version}
            </dd>
            <dt>API</dt>
            <dd className="ltr">{getApiBaseUrl()}</dd>
            <dt>{t.about.embedding}</dt>
            <dd>
              {health.embedding_available ? t.about.available : t.about.unavailable}
            </dd>
            <dt>{t.about.ollama}</dt>
            <dd>
              {health.ollama_reachable ? t.about.reachable : t.about.unreachable}
            </dd>
            <dt>Status</dt>
            <dd className="ltr">{health.status}</dd>
          </dl>
        ) : null}
      </div>
    </>
  );
}
