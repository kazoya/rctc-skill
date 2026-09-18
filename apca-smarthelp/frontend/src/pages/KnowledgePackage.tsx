import { useState } from 'react';
import { api, pollJob, type PackageValidateResult, ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { PageHeader } from '../components/PageHeader';
import { useI18n } from '../i18n';

export function KnowledgePackagePage() {
  const { t } = useI18n();
  const [packageTitle, setPackageTitle] = useState('APCA Knowledge Package');
  const [includePdfs, setIncludePdfs] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validateFile, setValidateFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<PackageValidateResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(null);
    try {
      const blob = await api.exportPackage({
        package_title: packageTitle,
        include_original_pdfs: includePdfs,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packageTitle.replace(/\s+/g, '_')}.apcahelp`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(t.packages.download);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const job = await api.importPackage(formData);
      await pollJob(job.id, (j) => {
        setProgress(j.progress);
        setStatusMessage(j.message ?? j.status);
      });
      setSuccess(t.import.success);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setImporting(false);
    }
  };

  const handleValidate = async () => {
    if (!validateFile) return;
    setValidating(true);
    setError(null);
    setValidation(null);

    const formData = new FormData();
    formData.append('file', validateFile);

    try {
      const result = await api.validatePackage(formData);
      setValidation(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setValidating(false);
    }
  };

  return (
    <>
      <PageHeader title={t.packages.title} subtitle={t.packages.subtitle} />
      {error && <ErrorBanner message={error} />}
      {success && <div className="success-banner">{success}</div>}

      <section className="section">
        <h2 className="section-title">{t.packages.export}</h2>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="form-grid two-col">
            <div className="field">
              <label htmlFor="pkg-title">{t.packages.packageTitle}</label>
              <input
                id="pkg-title"
                value={packageTitle}
                onChange={(e) => setPackageTitle(e.target.value)}
                disabled={exporting}
              />
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePdfs}
                  onChange={(e) => setIncludePdfs(e.target.checked)}
                  disabled={exporting}
                />
                {t.packages.includePdfs}
              </label>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={handleExport}
            disabled={exporting}
          >
            {t.packages.export}
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">{t.packages.import}</h2>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="field">
            <label htmlFor="import-pkg">{t.packages.selectFile}</label>
            <input
              id="import-pkg"
              type="file"
              accept=".apcahelp,application/zip"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              disabled={importing}
            />
          </div>
          {importing && (
            <div style={{ marginTop: '1rem' }}>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              {statusMessage && (
                <p className="ltr" style={{ fontSize: '0.85rem', color: 'var(--ink-500)' }}>
                  {statusMessage}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={handleImport}
            disabled={importing || !importFile}
          >
            {t.packages.import}
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">{t.packages.validate}</h2>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="field">
            <label htmlFor="validate-pkg">{t.packages.selectFile}</label>
            <input
              id="validate-pkg"
              type="file"
              accept=".apcahelp,application/zip"
              onChange={(e) => setValidateFile(e.target.files?.[0] ?? null)}
              disabled={validating}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={handleValidate}
            disabled={validating || !validateFile}
          >
            {t.packages.validate}
          </button>

          {validation && (
            <div style={{ marginTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
                {t.packages.validationResult}
              </h3>
              <p
                className={validation.valid ? 'success-banner' : 'error-banner'}
                style={{ display: 'block' }}
              >
                {validation.valid ? t.packages.valid : t.packages.invalid}
              </p>
              <dl className="source-info ltr">
                {validation.format_version && (
                  <>
                    <dt>format_version</dt>
                    <dd>{validation.format_version}</dd>
                  </>
                )}
                {validation.package_title && (
                  <>
                    <dt>package_title</dt>
                    <dd>{validation.package_title}</dd>
                  </>
                )}
                {validation.topic_count != null && (
                  <>
                    <dt>topic_count</dt>
                    <dd>{validation.topic_count}</dd>
                  </>
                )}
                {validation.passage_count != null && (
                  <>
                    <dt>passage_count</dt>
                    <dd>{validation.passage_count}</dd>
                  </>
                )}
              </dl>
              {validation.errors && validation.errors.length > 0 && (
                <ul style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                  {validation.errors.map((e) => (
                    <li key={e} className="ltr">
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
