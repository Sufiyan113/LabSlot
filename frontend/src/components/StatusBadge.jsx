import { clsx } from 'clsx';

const styles = {
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-400/20',
  booked: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-950 dark:text-blue-400',
  issued: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-950 dark:text-indigo-400',
  maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950 dark:text-amber-400',
  damaged: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-950 dark:text-red-400',
  retired: 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-zinc-800 dark:text-zinc-400',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950 dark:text-emerald-400',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
  under_renovation: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  excellent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  good: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  fair: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  poor: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950 dark:text-amber-400',
  approved: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-950 dark:text-blue-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  cancelled: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
  returned: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  reported: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  'in-progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  critical: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
};

const StatusBadge = ({ status, className }) => {
  if (!status) return null;
  const label = String(status).replace(/_/g, ' ').replace(/-/g, ' ');
  return (
    <span
      className={clsx(
        'badge ring-1 ring-inset capitalize',
        styles[status] || 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};

export default StatusBadge;
