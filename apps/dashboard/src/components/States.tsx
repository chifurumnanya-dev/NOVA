import { AlertCircle, SearchX, Database, RefreshCw } from 'lucide-react';

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search query.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        {icon ?? <SearchX size={24} className="text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong while loading data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">Failed to load</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline gap-2">
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

// ─── No Data State ────────────────────────────────────────────────────────────

export function NoDataState({ entity = 'records' }: { entity?: string }) {
  return (
    <EmptyState
      title={`No ${entity} yet`}
      description={`${entity.charAt(0).toUpperCase() + entity.slice(1)} will appear here once data has been added.`}
      icon={<Database size={24} className="text-slate-400" />}
    />
  );
}

// ─── Inline Alert ─────────────────────────────────────────────────────────────

interface InlineAlertProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

const ALERT_STYLES = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function InlineAlert({ message, type = 'error' }: InlineAlertProps) {
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-4 text-sm ${ALERT_STYLES[type]}`}>
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
}
