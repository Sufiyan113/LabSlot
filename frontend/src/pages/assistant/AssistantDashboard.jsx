import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Calendar, Package, AlertTriangle, Wrench, ArrowRight, Check, X, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as dashboardService from '../../services/dashboardService';
import * as bookingService from '../../services/bookingService';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const AssistantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = () => {
    setLoading(true);
    dashboardService
      .getAssistantDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === 'approve') await bookingService.approveBooking(id);
      else if (action === 'reject') await bookingService.rejectBooking(id, 'Rejected by assistant');
      else if (action === 'issue') await bookingService.issueBooking(id);
      else if (action === 'return') await bookingService.returnBooking(id);
      toast(
        action === 'approve'
          ? 'Booking approved'
          : action === 'reject'
          ? 'Booking rejected'
          : action === 'issue'
          ? 'Equipment issued'
          : 'Equipment returned',
        'success'
      );
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = data?.stats || {};
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Assistant Dashboard"
        subtitle={`Welcome, ${user?.name}. Review requests and manage equipment.`}
        actions={
          <Link to="/assistant/bookings" className="btn-primary btn-sm">
            All booking requests
          </Link>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Pending" value={stats.pendingRequests ?? 0} icon={Clock} color="amber" to="/assistant/bookings" description="Need review" />
            <StatCard label="Today" value={stats.todayBookings ?? 0} icon={Calendar} color="brand" description="Scheduled today" />
            <StatCard label="Issued" value={stats.issued ?? 0} icon={Package} color="emerald" description="Currently out" />
            <StatCard label="Overdue" value={stats.overdue ?? 0} icon={AlertTriangle} color="red" description="Past end time" />
            <StatCard label="Maintenance" value={stats.maintenanceItems ?? 0} icon={Wrench} color="violet" to="/assistant/maintenance" description="Open issues" />
            {(stats.criticalMaintenance ?? 0) > 0 && (
              <StatCard label="Critical" value={stats.criticalMaintenance} icon={AlertTriangle} color="red" to="/assistant/maintenance" description="Needs attention" />
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending with actions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Pending requests</h2>
            <Link to="/assistant/bookings" className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : !data?.pendingList?.length ? (
            <EmptyState title="No pending requests" description="All caught up — no bookings waiting for approval." />
          ) : (
            <ul className="space-y-3">
              {data.pendingList.map((b) => (
                <li key={b._id} className="rounded-xl border border-border p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{b.equipment?.name}</p>
                      <p className="text-xs text-ink-subtle">
                        {b.user?.name}
                        {b.user?.studentId ? ` · ${b.user.studentId}` : ''}
                      </p>
                      <p className="text-xs text-ink-subtle mt-0.5">
                        {b.startTime && formatTime(b.startTime)} – {b.endTime && formatTime(b.endTime)}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={!!actionLoading}
                      onClick={() => runAction(b._id, 'approve')}
                      className="btn-primary btn-sm flex-1"
                    >
                      {actionLoading === b._id + 'approve' ? (
                        <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                      ) : (
                        <><Check className="h-3.5 w-3.5" /> Approve</>
                      )}
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() => runAction(b._id, 'reject')}
                      className="btn-secondary btn-sm text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
                    >
                      {actionLoading === b._id + 'reject' ? <LoadingSpinner size="sm" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Issued — return actions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Issued equipment</h2>
            <Link to="/assistant/bookings" className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : !data?.issuedList?.length ? (
            <EmptyState title="Nothing issued" description="No equipment currently checked out." />
          ) : (
            <ul className="space-y-3">
              {data.issuedList.map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{b.equipment?.name}</p>
                    <p className="text-xs text-ink-subtle">{b.user?.name}</p>
                    <StatusBadge status={b.status} className="mt-1" />
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {b.status === 'approved' && (
                      <button
                        disabled={!!actionLoading}
                        onClick={() => runAction(b._id, 'issue')}
                        className="btn-primary btn-sm"
                      >
                        <Package className="h-3.5 w-3.5" /> Issue
                      </button>
                    )}
                    {['issued', 'overdue'].includes(b.status) && (
                      <button
                        disabled={!!actionLoading}
                        onClick={() => runAction(b._id, 'return')}
                        className="btn-primary btn-sm bg-emerald-600 hover:bg-emerald-500"
                      >
                        {actionLoading === b._id + 'return' ? (
                          <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                        ) : (
                          <><RotateCcw className="h-3.5 w-3.5" /> Return</>
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Today's bookings */}
      <div className="card p-6">
        <h2 className="section-title mb-5">Today&apos;s bookings</h2>
        {!loading && !data?.todayBookings?.length ? (
          <EmptyState title="No bookings today" description="Nothing scheduled for today." />
        ) : (
          <ul className="space-y-1">
            {(data?.todayBookings || []).map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{b.equipment?.name}</p>
                  <p className="text-xs text-ink-subtle">
                    {b.user?.name}
                    {b.user?.studentId ? ` · ${b.user.studentId}` : ''}
                    {b.startTime ? ` · ${formatTime(b.startTime)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  {b.status === 'approved' && (
                    <button
                      disabled={!!actionLoading}
                      onClick={() => runAction(b._id, 'issue')}
                      className="btn-secondary btn-sm"
                    >
                      <Package className="h-3.5 w-3.5" /> Issue
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssistantDashboard;
