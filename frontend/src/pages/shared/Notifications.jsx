import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import * as notificationService from '../../services/notificationService';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { clsx } from 'clsx';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    await notificationService.markAsRead(id);
    load();
  };

  const handleReadAll = async () => {
    await notificationService.markAllAsRead();
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 ? (
            <button onClick={handleReadAll} className="btn-secondary btn-sm">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          ) : null
        }
      />

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}
      {!loading && notifications.length === 0 && (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      )}

      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={clsx(
              'card p-4 cursor-pointer transition-all duration-150 hover:shadow-card-hover',
              !n.isRead && 'border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-950/20'
            )}
            onClick={() => !n.isRead && handleRead(n._id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={clsx('text-sm', !n.isRead ? 'font-semibold text-ink' : 'font-medium text-ink-muted')}>{n.title}</p>
                <p className="text-sm text-ink-subtle mt-0.5">{n.message}</p>
                <p className="text-2xs text-ink-subtle mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
