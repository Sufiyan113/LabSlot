import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

/**
 * Admin booking overview — view all, filter, cancel when appropriate.
 * Approve/issue/return can also be done by admin (same API).
 */
const AdminBookingsManage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookings({
        status: statusFilter || undefined,
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

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

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">All Bookings</h1>
          <p className="mt-1 text-sm text-ink-muted">System-wide booking management</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-subtle" />
          <select
            className="input sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {['pending', 'approved', 'issued', 'returned', 'rejected', 'cancelled', 'overdue'].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && bookings.length === 0 && (
        <EmptyState title="No bookings" description="No bookings match the filter." />
      )}

      {!loading && bookings.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Equipment</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Date / Time</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Purpose</th>
                  <th className="text-right px-4 py-3 font-medium text-ink-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{b.equipment?.name}</p>
                      <p className="text-xs font-mono text-ink-muted">
                        {b.equipment?.equipmentId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{b.user?.name}</p>
                      <p className="text-xs text-ink-subtle">{b.user?.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatDate(b.bookingDate)}
                      <br />
                      <span className="text-xs">
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted max-w-[200px] truncate">
                      {b.purpose}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {['pending', 'approved'].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          disabled={actionLoading === b._id}
                          className="p-1.5 rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600"
                          title="Cancel"
                        >
                          {actionLoading === b._id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsManage;
