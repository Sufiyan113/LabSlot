import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'There is no data to display.',
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="rounded-2xl bg-surface-muted p-4 mb-4 ring-1 ring-border">
      <Icon className="h-7 w-7 text-ink-subtle" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
    <p className="text-sm text-ink-muted max-w-sm mb-5 leading-relaxed">{description}</p>
    {action}
  </div>
);

export default EmptyState;
