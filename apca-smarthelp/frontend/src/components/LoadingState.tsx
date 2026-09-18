import { useI18n } from '../i18n';

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label ?? t.common.loading}</span>
    </div>
  );
}
