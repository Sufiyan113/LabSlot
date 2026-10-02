import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import * as notificationService from '../../services/notificationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const NotificationsPage = () => {
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
    await notificationService.markRead(id);
    load();
  };

  const handleReadAll = async () => {
    await notificationService.markAllRead();
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-ink-muted">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleReadAll} className="btn-secondary text-xs">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You will see booking and system updates here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleRead(n._id)}
              className={`card p-4 cursor-pointer transition-colors ${!n.isRead ? 'bg-brand-50/50 border-primary-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-ink' : 'font-medium text-ink-muted'}`}>{n.title}</p>
                  <p className="text-sm text-ink-muted mt-0.5">{n.message}</p>
                  <p className="text-xs text-ink-subtle mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
