import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, pollJob, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

export function ImportWizardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [copyrightOwner, setCopyrightOwner] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !title) {
      setTitle(selected.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError(t.import.fileRequired);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (author) formData.append('author', author);
    if (language) formData.append('language', language);
    if (copyrightOwner) formData.append('copyright_owner', copyrightOwner);
    if (notes) formData.append('user_notes', notes);

    try {
      const job = await api.importDocument(formData);
      await pollJob(job.id, (j) => {
        setProgress(j.progress);
        setStatusMessage(j.message ?? j.status);
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title={t.import.title} subtitle={t.import.subtitle} />
      {error && <ErrorBanner message={error} />}
      {success && <div className="success-banner">{t.import.success}</div>}

      <form onSubmit={handleSubmit} className="panel" style={{ padding: '1.25rem' }}>
        <div className="form-grid two-col">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="pdf-file">{t.import.selectFile}</label>
            <input
              id="pdf-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="import-title">{t.import.titleField}</label>
            <input
              id="import-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="import-author">{t.import.author}</label>
            <input
              id="import-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="import-language">{t.import.language}</label>
            <input
              id="import-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en / ar"
              disabled={submitting}
            />
          </div>
          <div className="field">
            <label htmlFor="import-copyright">{t.import.copyrightOwner}</label>
            <input
              id="import-copyright"
              value={copyrightOwner}
              onChange={(e) => setCopyrightOwner(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="import-notes">{t.import.notes}</label>
            <textarea
              id="import-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        {submitting && (
          <div className="section" style={{ marginTop: '1.25rem' }}>
            <p className="section-title">{t.import.progress}</p>
            <div className="progress-bar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            {statusMessage && (
              <p className="ltr" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                {statusMessage}
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: '1.25rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {t.import.startImport}
          </button>
        </div>
      </form>
    </>
  );
}
