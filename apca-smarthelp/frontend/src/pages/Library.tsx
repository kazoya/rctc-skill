import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type DocumentOut, type DocumentUpdate, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('ready') || s.includes('complete')) return 'status-ready';
  if (s.includes('fail') || s.includes('error')) return 'status-failed';
  return 'status-processing';
}

interface EditModalProps {
  doc: DocumentOut;
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ doc, onClose, onSaved }: EditModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<DocumentUpdate>({
    title: doc.title,
    author: doc.author ?? '',
    language: doc.language ?? '',
    copyright_owner: doc.copyright_owner ?? '',
    user_notes: doc.user_notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateDocument(doc.id, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>{t.library.editMetadata}</h2>
        {error && <ErrorBanner message={error} />}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="edit-title">{t.import.titleField}</label>
            <input
              id="edit-title"
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-author">{t.import.author}</label>
            <input
              id="edit-author"
              value={form.author ?? ''}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-language">{t.import.language}</label>
            <input
              id="edit-language"
              value={form.language ?? ''}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-copyright">{t.import.copyrightOwner}</label>
            <input
              id="edit-copyright"
              value={form.copyright_owner ?? ''}
              onChange={(e) => setForm({ ...form, copyright_owner: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-notes">{t.import.notes}</label>
            <textarea
              id="edit-notes"
              value={form.user_notes ?? ''}
              onChange={(e) => setForm({ ...form, user_notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LibraryPage() {
  const { t } = useI18n();
  const [documents, setDocuments] = useState<DocumentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DocumentOut | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.backendOffline);
    } finally {
      setLoading(false);
    }
  }, [t.common.backendOffline]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.library.deleteConfirm)) return;
    setBusyId(id);
    try {
      await api.deleteDocument(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setBusyId(null);
    }
  };

  const handleReindex = async (id: string) => {
    setBusyId(id);
    try {
      const job = await api.reindexDocument(id);
      await api.getJob(job.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title={t.library.title} subtitle={t.library.subtitle} />
      {error && <ErrorBanner message={error} onRetry={load} retryLabel={t.common.retry} />}
      {loading ? (
        <LoadingState />
      ) : documents.length === 0 ? (
        <div className="panel empty-state">
          <p>{t.library.empty}</p>
          <Link to="/import" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t.nav.import}
          </Link>
        </div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.import.titleField}</th>
                <th>{t.common.status}</th>
                <th>{t.common.pages}</th>
                <th>{t.library.importedAt}</th>
                <th>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.title}</strong>
                    <div className="ltr" style={{ fontSize: '0.78rem', color: 'var(--ink-500)' }}>
                      {doc.original_filename}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass(doc.status)} ltr`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="ltr">{doc.page_count}</td>
                  <td className="ltr">{new Date(doc.imported_at).toLocaleString()}</td>
                  <td>
                    <div className="inline-actions">
                      <Link to={`/viewer?document=${doc.id}`} className="btn btn-ghost">
                        {t.nav.viewer}
                      </Link>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditing(doc)}
                      >
                        {t.common.edit}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={busyId === doc.id}
                        onClick={() => handleReindex(doc.id)}
                      >
                        {t.library.reindex}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={busyId === doc.id}
                        onClick={() => handleDelete(doc.id)}
                      >
                        {t.common.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <EditModal doc={editing} onClose={() => setEditing(null)} onSaved={load} />
      )}
    </>
  );
}
