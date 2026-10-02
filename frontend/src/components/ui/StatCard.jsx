import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const colorMap = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
};

const StatCard = ({ label, value, icon: Icon, color = 'brand', to, description }) => {
  const content = (
    <div className={clsx('card p-5 transition-all duration-200', to && 'hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-800 cursor-pointer')}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">{value ?? '—'}</p>
          {description && <p className="text-xs text-ink-subtle truncate">{description}</p>}
        </div>
        {Icon && (
          <div className={clsx('rounded-xl p-2.5 shrink-0', colorMap[color] || colorMap.brand)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
};

export default StatCard;
