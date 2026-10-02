import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import * as labService from '../../services/labService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { LAB_STATUSES } from '../../utils/constants';

const emptyForm = {
  name: '', code: '', building: '', floor: '', roomNumber: '',
  department: '', description: '', capacity: 30, status: 'active',
};

const LabsManage = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await labService.getLabs({ search: search || undefined });
      setLabs(res.data.labs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (lab) => {
    setEditing(lab);
    setForm({
      name: lab.name || '',
      code: lab.code || '',
      building: lab.building || '',
      floor: lab.floor || '',
      roomNumber: lab.roomNumber || '',
      department: lab.department || '',
      description: lab.description || '',
      capacity: lab.capacity || 30,
      status: lab.status || 'active',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await labService.updateLab(editing._id, form);
      } else {
        await labService.createLab(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lab) => {
    if (!window.confirm(`Delete lab "${lab.name}"? This cannot be undone.`)) return;
    try {
      await labService.deleteLab(lab._id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Manage Laboratories</h1>
          <p className="mt-1 text-sm text-ink-muted">Add, edit or remove labs</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Lab
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
        <input
          className="input pl-10"
          placeholder="Search labs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && labs.length === 0 && <EmptyState title="No labs yet" description="Create your first laboratory." action={<button onClick={openCreate} className="btn-primary">Add Lab</button>} />}

      {!loading && labs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Equipment</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-ink-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {labs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-ink">{lab.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{lab.code}</td>
                    <td className="px-4 py-3 text-ink-muted">{lab.building} · {lab.roomNumber}</td>
                    <td className="px-4 py-3 text-ink-muted">{lab.equipmentCount ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge status={lab.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(lab)} className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-brand-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(lab)} className="p-1.5 rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setModalOpen(false)} />
          <div className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-ink">
                {editing ? 'Edit Lab' : 'Add Lab'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-ink-subtle hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Name *</label>
                  <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Code *</label>
                  <input className="input" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div>
                  <label className="label">Department *</label>
                  <input className="input" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
                <div>
                  <label className="label">Building *</label>
                  <input className="input" required value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
                </div>
                <div>
                  <label className="label">Floor</label>
                  <input className="input" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
                </div>
                <div>
                  <label className="label">Room Number *</label>
                  <input className="input" required value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" min="1" className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {LAB_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabsManage;
