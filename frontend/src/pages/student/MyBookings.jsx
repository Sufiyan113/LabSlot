import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { clsx } from 'clsx';

const TABS = ['', 'pending', 'approved', 'issued', 'returned', 'cancelled', 'overdue'];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookings({ status: statusFilter || undefined });
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading(id);
    try {
      await bookingService.cancelBooking(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => new Date(d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Bookings" subtitle="Track and manage your booking requests" />

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={clsx(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize',
              statusFilter === s
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'text-ink-muted hover:bg-surface-muted'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="Browse equipment and submit a booking request."
          action={<Link to="/student/equipment" className="btn-primary btn-sm">Browse Equipment</Link>}
        />
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink">{b.equipment?.name || 'Equipment'}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs font-mono text-ink-subtle">{b.equipment?.equipmentId}</p>
                  <p className="text-sm text-ink-muted">{formatDate(b.bookingDate)} · {formatTime(b.startTime)} – {formatTime(b.endTime)}</p>
                  <p className="text-sm text-ink-subtle">{b.purpose}</p>
                  {b.lab && <p className="text-xs text-ink-subtle">{b.lab.name} ({b.lab.code})</p>}
                  {b.rejectionReason && <p className="text-sm text-red-600">Reason: {b.rejectionReason}</p>}
                </div>
                {['pending', 'approved'].includes(b.status) && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={actionLoading === b._id}
                    className="btn-secondary btn-sm text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40 shrink-0"
                  >
                    {actionLoading === b._id ? <LoadingSpinner size="sm" /> : <><X className="h-3.5 w-3.5" /> Cancel</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
