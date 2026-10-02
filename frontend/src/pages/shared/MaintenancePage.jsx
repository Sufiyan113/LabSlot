import { useState, useEffect } from 'react';
import { Plus, Wrench } from 'lucide-react';
import * as maintenanceService from '../../services/maintenanceService';
import * as equipmentService from '../../services/equipmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const MaintenancePage = () => {
  const { isAssistant, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ equipment: '', issue: '', description: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await maintenanceService.getMaintenances({ status: statusFilter || undefined });
      setItems(res.data.maintenances || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    equipmentService.getEquipment().then((r) => setEquipment(r.data.equipment || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await maintenanceService.createMaintenance(form);
      setModal(false);
      setForm({ equipment: '', issue: '', description: '', priority: 'medium' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await maintenanceService.updateMaintenance(id, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Maintenance</h1>
          <p className="mt-1 text-sm text-ink-muted">Report and track equipment issues</p>
        </div>
        <div className="flex gap-2">
          <select className="input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="reported">Reported</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Report Issue
          </button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && items.length === 0 && <EmptyState icon={Wrench} title="No maintenance records" description="Report an equipment problem to get started." />}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m._id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink">{m.issue}</h3>
                    <StatusBadge status={m.status} />
                    <span className={`badge ${m.priority === 'critical' ? 'bg-red-100 text-red-700' : m.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-surface-muted text-ink-muted'}`}>
                      {m.priority}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted">{m.equipment?.name} · {m.equipment?.equipmentId}</p>
                  <p className="text-sm text-ink-muted">{m.description}</p>
                  <p className="text-xs text-ink-subtle">Reported by {m.reportedBy?.name} · {new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
                {(isAssistant || isAdmin) && m.status !== 'completed' && (
                  <div className="flex gap-2">
                    {m.status === 'reported' && (
                      <button onClick={() => handleStatus(m._id, 'in-progress')} className="btn-secondary text-xs py-1.5">Start</button>
                    )}
                    {['reported', 'in-progress'].includes(m.status) && (
                      <button onClick={() => handleStatus(m._id, 'completed')} className="btn-primary text-xs py-1.5 bg-green-600 hover:bg-green-700">Complete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setModal(false)} />
          <div className="relative card w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Report Equipment Issue</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Equipment *</label>
                <select className="input" required value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
                  <option value="">Select equipment</option>
                  {equipment.map((eq) => (
                    <option key={eq._id} value={eq._id}>{eq.name} ({eq.equipmentId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Issue title *</label>
                <input className="input" required value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea className="input" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MaintenancePage;
