import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle, FlaskConical, ArrowRight, Bell, LayoutGrid,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as dashboardService from '../../services/dashboardService';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardService
      .getStudentDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const formatTime = (d) =>
    new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'Student'}`}
        subtitle="Manage your laboratory equipment and bookings."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/student/equipment" className="btn-primary btn-sm">
              <FlaskConical className="h-3.5 w-3.5" /> Browse Equipment
            </Link>
            <Link to="/student/bookings" className="btn-secondary btn-sm">
              <Calendar className="h-3.5 w-3.5" /> My Bookings
            </Link>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Active Bookings" value={stats.activeBookings ?? 0} icon={Calendar} color="brand" to="/student/bookings" description="Approved or in use" />
            <StatCard label="Pending Requests" value={stats.pendingRequests ?? 0} icon={Clock} color="amber" to="/student/bookings" description="Awaiting review" />
            <StatCard label="Completed" value={stats.completed ?? 0} icon={CheckCircle} color="emerald" description="Returned successfully" />
            <StatCard label="Available Equipment" value={stats.availableEquipment ?? 0} icon={FlaskConical} color="violet" to="/student/equipment" description="Ready to book" />
          </>
        )}
      </div>

      {stats.unreadNotifications > 0 && (
        <Link
          to="/student/notifications"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow border-brand-200 dark:border-brand-800"
        >
          <div className="rounded-xl bg-brand-50 dark:bg-brand-950 p-2.5 text-brand-600 dark:text-brand-400">
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">
              You have {stats.unreadNotifications} unread notification{stats.unreadNotifications > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-ink-subtle">Tap to view booking updates and alerts</p>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-subtle shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming bookings</h2>
            <Link to="/student/bookings" className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : !data?.upcoming?.length ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming bookings"
              description="Browse available equipment and submit a request."
              action={
                <Link to="/student/equipment" className="btn-primary btn-sm">
                  <LayoutGrid className="h-3.5 w-3.5" /> Browse Equipment
                </Link>
              }
            />
          ) : (
            <ul className="space-y-1">
              {data.upcoming.map((b) => (
                <li
                  key={b._id}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{b.equipment?.name}</p>
                    <p className="text-xs text-ink-subtle mt-0.5">
                      {formatTime(b.startTime)}
                      {b.lab ? ` · ${b.lab.code}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-5">Recent activity</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : !data?.recentActivity?.length ? (
            <EmptyState title="No activity yet" description="Your booking activity will appear here." />
          ) : (
            <ul className="relative">
              {data.recentActivity.map((b, i) => (
                <li key={b._id} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 ring-4 ring-brand-50 dark:ring-brand-950" />
                    {i < data.recentActivity.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-sm font-medium text-ink">{b.equipment?.name}</p>
                    <p className="text-xs text-ink-subtle mt-0.5 line-clamp-1">{b.purpose}</p>
                    <div className="mt-1.5">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
