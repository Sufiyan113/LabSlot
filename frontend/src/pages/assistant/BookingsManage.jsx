import { useState, useEffect } from 'react';
import {
  Check, X, Package, RotateCcw, Filter,
} from 'lucide-react';
import * as bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const BookingsManage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const runAction = async (id, action, extra) => {
    setActionLoading(id);
    try {
      if (action === 'approve') await bookingService.approveBooking(id);
      else if (action === 'reject') await bookingService.rejectBooking(id, extra);
      else if (action === 'issue') await bookingService.issueBooking(id);
      else if (action === 'return') await bookingService.returnBooking(id);
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Booking Requests</h1>
          <p className="mt-1 text-sm text-ink-muted">Approve, issue and return equipment</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-subtle" />
          <select
            className="input sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
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
        <EmptyState title="No bookings" description="No bookings match the current filter." />
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink">
                      {b.equipment?.name}
                    </h3>
                    <span className="text-xs font-mono text-ink-muted">
                      {b.equipment?.equipmentId}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium">{b.user?.name}</span>
                    {b.user?.studentId && (
                      <span className="text-ink-subtle"> · {b.user.studentId}</span>
                    )}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {formatDate(b.bookingDate)} · {formatTime(b.startTime)} –{' '}
                    {formatTime(b.endTime)}
                  </p>
                  <p className="text-sm text-ink-muted">{b.purpose}</p>
                  {b.lab && (
                    <p className="text-xs text-ink-subtle">
                      {b.lab.name} ({b.lab.code})
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => runAction(b._id, 'approve')}
                        disabled={actionLoading === b._id}
                        className="btn-primary text-xs py-1.5"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal(b)}
                        disabled={actionLoading === b._id}
                        className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-xs py-1.5"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {b.status === 'approved' && (
                    <button
                      onClick={() => runAction(b._id, 'issue')}
                      disabled={actionLoading === b._id}
                      className="btn-primary text-xs py-1.5"
                    >
                      <Package className="h-3.5 w-3.5" /> Issue
                    </button>
                  )}
                  {['issued', 'overdue'].includes(b.status) && (
                    <button
                      onClick={() => runAction(b._id, 'return')}
                      disabled={actionLoading === b._id}
                      className="btn-primary text-xs py-1.5 bg-green-600 hover:bg-green-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Return
                    </button>
                  )}
                  {actionLoading === b._id && <LoadingSpinner size="sm" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setRejectModal(null)} />
          <div className="relative card w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-ink mb-3">Reject Booking</h2>
            <p className="text-sm text-ink-muted mb-4">
              {rejectModal.equipment?.name} · {rejectModal.user?.name}
            </p>
            <label className="label">Reason (optional)</label>
            <textarea
              className="input mb-4"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Equipment reserved for exam"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => runAction(rejectModal._id, 'reject', rejectReason)}
                className="btn-danger"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManage;
