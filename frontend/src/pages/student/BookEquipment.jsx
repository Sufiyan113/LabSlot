import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import * as equipmentService from '../../services/equipmentService';
import * as bookingService from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const BookEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availability, setAvailability] = useState(null);

  const [form, setForm] = useState({
    bookingDate: '',
    startTime: '10:00',
    endTime: '12:00',
    purpose: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await equipmentService.getEquipmentById(id);
        setEquipment(res.data.equipment);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Load availability when date changes
  useEffect(() => {
    if (!form.bookingDate || !equipment) return;
    const load = async () => {
      try {
        const res = await equipmentService.getAvailability(equipment._id, form.bookingDate);
        setAvailability(res.data);
      } catch {
        setAvailability(null);
      }
    };
    load();
  }, [form.bookingDate, equipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      // Build ISO datetimes
      const startISO = new Date(`${form.bookingDate}T${form.startTime}:00`);
      const endISO = new Date(`${form.bookingDate}T${form.endTime}:00`);

      if (startISO >= endISO) {
        setError('End time must be after start time');
        setSubmitting(false);
        return;
      }

      const res = await bookingService.createBooking({
        equipment: equipment._id,
        bookingDate: form.bookingDate,
        startTime: startISO.toISOString(),
        endTime: endISO.toISOString(),
        purpose: form.purpose,
      });

      setSuccess('Booking request submitted successfully!');
      setTimeout(() => navigate('/student/bookings'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  if (!equipment) {
    return <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error || 'Equipment not found'}</div>;
  }

  const canBook = equipment.status === 'available' || equipment.status === 'booked';

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Link to={`/student/equipment/${equipment._id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to Equipment
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Book Equipment</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {equipment.name} · <span className="font-mono">{equipment.equipmentId}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <StatusBadge status={equipment.status} />
        <StatusBadge status={equipment.condition} />
      </div>

      {!canBook && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          This equipment is currently <strong>{equipment.status}</strong> and cannot be booked.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {success}
        </div>
      )}

      {canBook && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="label flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Booking Date *
            </label>
            <input
              type="date"
              className="input"
              required
              min={new Date().toISOString().split('T')[0]}
              value={form.bookingDate}
              onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Start Time *
              </label>
              <input
                type="time"
                className="input"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> End Time *
              </label>
              <input
                type="time"
                className="input"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Existing bookings for the day */}
          {availability?.bookings?.length > 0 && (
            <div className="rounded-xl bg-surface-muted border border-border p-4">
              <p className="text-sm font-medium text-ink-muted mb-2">Existing bookings on this date:</p>
              <ul className="space-y-1.5 text-sm text-ink-muted">
                {availability.bookings.map((b) => (
                  <li key={b._id} className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <StatusBadge status={b.status} />
                    <span className="text-xs text-ink-subtle">{b.user?.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availability && availability.bookings?.length === 0 && form.bookingDate && (
            <div className="rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              No existing bookings on this date — fully available.
            </div>
          )}

          <div>
            <label className="label">Purpose *</label>
            <textarea
              className="input"
              rows={3}
              required
              minLength={5}
              placeholder="e.g. IoT project – sensor data logging for final year project"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
            <p className="mt-1 text-xs text-ink-subtle">Minimum 5 characters</p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? (
              <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            ) : (
              'Submit Booking Request'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEquipment;
