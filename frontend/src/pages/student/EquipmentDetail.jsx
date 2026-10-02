import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, FlaskConical, Building2, Tag, Info, QrCode, AlertTriangle, Wrench,
} from 'lucide-react';
import * as equipmentService from '../../services/equipmentService';
import * as maintenanceService from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/ui/Modal';

const EquipmentDetail = () => {
  const { id } = useParams();
  const { isAdmin, isStudent } = useAuth();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ issue: '', description: '', priority: 'medium', markDamaged: false });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = async () => {
    try {
      const res = await equipmentService.getEquipmentById(id);
      setEquipment(res.data.equipment);
      const eqId = res.data.equipment._id;
      try {
        const mRes = await maintenanceService.getMaintenance({ equipment: eqId });
        setMaintenance(mRes.data.maintenance || []);
      } catch {
        setMaintenance([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleReport = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await maintenanceService.createMaintenance({
        equipment: equipment._id,
        issue: reportForm.issue,
        description: reportForm.description,
        priority: reportForm.priority,
        markDamaged: reportForm.markDamaged,
      });
      toast('Problem reported. Equipment marked unavailable.', 'success');
      setReportOpen(false);
      setReportForm({ issue: '', description: '', priority: 'medium', markDamaged: false });
      setLoading(true);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to report problem');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
        {error || 'Equipment not found'}
      </div>
    );
  }

  const canBook = equipment.status === 'available' || equipment.status === 'booked';
  const unbookable = ['maintenance', 'damaged', 'retired'].includes(equipment.status);
  const base = isAdmin ? '/admin' : isStudent ? '/student' : '/assistant';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <Link
        to={`${base}/equipment`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Equipment
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-surface-muted to-surface flex items-center justify-center">
            {equipment.image ? (
              <img src={equipment.image} alt={equipment.name} className="h-full w-full object-cover" />
            ) : (
              <FlaskConical className="h-20 w-20 text-ink-subtle/30" strokeWidth={1.25} />
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">{equipment.name}</h1>
                <p className="text-sm font-mono text-ink-subtle mt-1">{equipment.equipmentId}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={equipment.status} />
                <StatusBadge status={equipment.condition} />
              </div>
            </div>
            {equipment.description && (
              <p className="mt-4 text-sm text-ink-muted leading-relaxed">{equipment.description}</p>
            )}
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Tag className="h-4 w-4 text-ink-subtle mt-0.5" />
                <div>
                  <dt className="text-ink-subtle text-xs">Category</dt>
                  <dd className="font-medium text-ink">{equipment.category}</dd>
                </div>
              </div>
              {equipment.lab && (
                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-ink-subtle mt-0.5" />
                  <div>
                    <dt className="text-ink-subtle text-xs">Laboratory</dt>
                    <dd className="font-medium text-ink">
                      {equipment.lab.name} ({equipment.lab.code})
                    </dd>
                  </div>
                </div>
              )}
              {equipment.manufacturer && (
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-ink-subtle mt-0.5" />
                  <div>
                    <dt className="text-ink-subtle text-xs">Manufacturer</dt>
                    <dd className="font-medium text-ink">{equipment.manufacturer}</dd>
                  </div>
                </div>
              )}
              {equipment.model && (
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-ink-subtle mt-0.5" />
                  <div>
                    <dt className="text-ink-subtle text-xs">Model</dt>
                    <dd className="font-medium text-ink">{equipment.model}</dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-ink-subtle mt-0.5" />
                <div>
                  <dt className="text-ink-subtle text-xs">Total bookings</dt>
                  <dd className="font-medium text-ink">{equipment.totalBookings ?? 0}</dd>
                </div>
              </div>
            </dl>
          </div>

          {isStudent && (
            <div className="card p-5 space-y-3">
              {canBook && !unbookable ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">Ready to book?</p>
                    <p className="text-sm text-ink-muted">Select a date and time slot to request this equipment.</p>
                  </div>
                  <Link to={`/student/equipment/${equipment._id}/book`} className="btn-primary shrink-0">
                    Book Equipment
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                  This equipment is currently <strong>{equipment.status}</strong> and cannot be booked.
                </div>
              )}
              {equipment.status !== 'retired' && (
                <button type="button" onClick={() => setReportOpen(true)} className="btn-secondary w-full sm:w-auto">
                  <AlertTriangle className="h-4 w-4" /> Report Problem
                </button>
              )}
            </div>
          )}

          {/* Maintenance history */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-4 w-4 text-ink-muted" />
              <h3 className="font-semibold text-ink">Maintenance history</h3>
            </div>
            {maintenance.length === 0 ? (
              <p className="text-sm text-ink-subtle">No maintenance records for this equipment.</p>
            ) : (
              <ul className="space-y-3">
                {maintenance.map((m) => (
                  <li key={m._id} className="rounded-xl border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-ink">{m.issue}</p>
                      <StatusBadge status={m.status} />
                      <StatusBadge status={m.priority} />
                    </div>
                    <p className="text-xs text-ink-subtle line-clamp-2">{m.description}</p>
                    <p className="text-2xs text-ink-subtle mt-1">
                      {m.reportedBy?.name} · {new Date(m.createdAt).toLocaleDateString()}
                      {m.completedAt ? ` · Completed ${new Date(m.completedAt).toLocaleDateString()}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isAdmin && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-4 w-4 text-ink-muted" />
                <h3 className="font-semibold text-ink">QR Code</h3>
              </div>
              {equipment.qrCode ? (
                <img src={equipment.qrCode} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl" />
              ) : (
                <p className="text-sm text-ink-muted mb-3 text-center">No QR code generated yet.</p>
              )}
              <button
                className="btn-secondary w-full mt-3"
                disabled={qrLoading}
                onClick={async () => {
                  setQrLoading(true);
                  try {
                    const res = await equipmentService.generateQR(equipment._id);
                    setEquipment({ ...equipment, qrCode: res.data.qrCode });
                    toast('QR code generated', 'success');
                  } catch (e) {
                    toast(e.response?.data?.message || 'QR generation failed', 'error');
                  } finally {
                    setQrLoading(false);
                  }
                }}
              >
                {qrLoading ? 'Generating…' : equipment.qrCode ? 'Regenerate QR' : 'Generate QR Code'}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report Equipment Problem"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setReportOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="report-form" className="btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : 'Submit Report'}
            </button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {formError}
          </div>
        )}
        <form id="report-form" onSubmit={handleReport} className="space-y-4">
          <div>
            <label className="label">Equipment</label>
            <input className="input bg-surface-muted" value={`${equipment.name} (${equipment.equipmentId})`} disabled />
          </div>
          <div>
            <label className="label">Issue title *</label>
            <input
              className="input"
              required
              maxLength={150}
              value={reportForm.issue}
              onChange={(e) => setReportForm({ ...reportForm, issue: e.target.value })}
              placeholder="e.g. Power LED not lighting"
            />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              className="input"
              rows={3}
              required
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              placeholder="Describe the problem in detail"
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={reportForm.priority}
              onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={reportForm.markDamaged}
              onChange={(e) => setReportForm({ ...reportForm, markDamaged: e.target.checked })}
            />
            Mark equipment as damaged (blocks booking until repaired)
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default EquipmentDetail;
