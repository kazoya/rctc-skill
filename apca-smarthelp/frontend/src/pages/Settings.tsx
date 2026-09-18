import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

export function SettingsPage() {
  const { t } = useI18n();
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { settings } = await api.getSettings();
      setJsonText(JSON.stringify(settings, null, 2));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.backendOffline);
    } finally {
      setLoading(false);
    }
  }, [t.common.backendOffline]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      const { settings } = await api.updateSettings(parsed);
      setJsonText(JSON.stringify(settings, null, 2));
      setSuccess(true);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON');
      } else {
        setError(err instanceof ApiError ? err.message : t.common.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />
      {error && <ErrorBanner message={error} onRetry={load} retryLabel={t.common.retry} />}
      {success && <div className="success-banner">{t.settings.saved}</div>}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="settings-editor">
          <p className="section-title">{t.settings.rawJson}</p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
            aria-label={t.settings.rawJson}
          />
          <div className="inline-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {t.common.save}
            </button>
            <button type="button" className="btn btn-secondary" onClick={load} disabled={saving}>
              {t.settings.reload}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
