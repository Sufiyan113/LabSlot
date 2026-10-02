import { useState, useEffect } from 'react';
import { Plus, Wrench, X } from 'lucide-react';
import * as maintenanceService from '../../services/maintenanceService';
import * as equipmentService from '../../services/equipmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/ui/Modal';
import { clsx } from 'clsx';

const TABS = [
  { value: '', label: 'All' },
  { value: 'reported', label: 'Reported' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const Maintenance = () => {
  const { isAdmin, isAssistant, isStudent } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    equipment: '',
    issue: '',
    description: '',
    priority: 'medium',
    markDamaged: false,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await maintenanceService.getMaintenance({
        status: statusFilter || undefined,
      });
      setRecords(res.data.maintenance || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  useEffect(() => {
    equipmentService
      .getEquipment()
      .then((r) => setEquipment(r.data.equipment || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await maintenanceService.createMaintenance(form);
      toast('Maintenance issue reported', 'success');
      setModalOpen(false);
      setForm({ equipment: '', issue: '', description: '', priority: 'medium', markDamaged: false });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(id);
    try {
      await maintenanceService.updateMaintenance(id, { status: 'in-progress' });
      toast('Maintenance started', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    setActionLoading(id);
    try {
      await maintenanceService.completeMaintenance(id);
      toast('Maintenance completed — equipment available again', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Maintenance"
        subtitle={
          isStudent
            ? 'Report equipment problems and track your issues'
            : 'Track and resolve equipment maintenance issues'
        }
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Report Issue
          </button>
        }
      />

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value || 'all'}
            onClick={() => setStatusFilter(t.value)}
            className={clsx(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === t.value
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'text-ink-muted hover:bg-surface-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && records.length === 0 && (
        <EmptyState
          icon={Wrench}
          title="No maintenance records"
          description={
            isStudent
              ? 'You have not reported any issues yet.'
              : 'Report an equipment problem to get started.'
          }
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary btn-sm">
              Report Issue
            </button>
          }
        />
      )}

      {!loading && records.length > 0 && (
        <div className="space-y-3">
          {records.map((m) => (
            <div key={m._id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink">{m.issue}</h3>
                    <StatusBadge status={m.status} />
                    <StatusBadge status={m.priority} />
                  </div>
                  <p className="text-sm text-ink-muted">
                    {m.equipment?.name}{' '}
                    <span className="font-mono text-xs text-ink-subtle">
                      ({m.equipment?.equipmentId})
                    </span>
                    {m.equipment?.status && (
                      <span className="ml-2">
                        <StatusBadge status={m.equipment.status} />
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-ink-subtle">{m.description}</p>
                  <p className="text-xs text-ink-subtle">
                    Reported by {m.reportedBy?.name} · {new Date(m.createdAt).toLocaleString()}
                    {m.assignedTo ? ` · Assigned to ${m.assignedTo.name}` : ''}
                  </p>
                  {m.resolutionNotes && (
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Resolution: {m.resolutionNotes}
                    </p>
                  )}
                </div>
                {(isAdmin || isAssistant) && m.status !== 'completed' && (
                  <div className="flex gap-2 shrink-0">
                    {m.status === 'reported' && (
                      <button
                        onClick={() => handleStart(m._id)}
                        disabled={actionLoading === m._id}
                        className="btn-secondary btn-sm"
                      >
                        {actionLoading === m._id ? <LoadingSpinner size="sm" /> : 'Start'}
                      </button>
                    )}
                    {['reported', 'in-progress'].includes(m.status) && (
                      <button
                        onClick={() => handleComplete(m._id)}
                        disabled={actionLoading === m._id}
                        className="btn-primary btn-sm bg-emerald-600 hover:bg-emerald-500"
                      >
                        {actionLoading === m._id ? (
                          <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                        ) : (
                          'Complete'
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Equipment Issue"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="maint-form" className="btn-primary" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : 'Submit'}
            </button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}
        <form id="maint-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Equipment *</label>
            <select
              className="input"
              required
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            >
              <option value="">Select equipment</option>
              {equipment
                .filter((eq) => eq.status !== 'retired')
                .map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.name} ({eq.equipmentId}) — {eq.status}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="label">Issue title *</label>
            <input
              className="input"
              required
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              className="input"
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
              checked={form.markDamaged}
              onChange={(e) => setForm({ ...form, markDamaged: e.target.checked })}
            />
            Mark as damaged
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
