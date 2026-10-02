import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import * as equipmentService from '../../services/equipmentService';
import * as labService from '../../services/labService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import {
  EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES, EQUIPMENT_CONDITIONS,
} from '../../utils/constants';

const emptyForm = {
  name: '', equipmentId: '', category: 'Microcontroller', lab: '',
  description: '', manufacturer: '', model: '',
  condition: 'good', status: 'available', notes: '',
};

const EquipmentManage = () => {
  const [items, setItems] = useState([]);
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
      const res = await equipmentService.getEquipment({ search: search || undefined });
      setItems(res.data.equipment || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    labService.getLabs().then((r) => setLabs(r.data.labs || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, lab: labs[0]?._id || '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (eq) => {
    setEditing(eq);
    setForm({
      name: eq.name || '',
      equipmentId: eq.equipmentId || '',
      category: eq.category || 'Microcontroller',
      lab: eq.lab?._id || eq.lab || '',
      description: eq.description || '',
      manufacturer: eq.manufacturer || '',
      model: eq.model || '',
      condition: eq.condition || 'good',
      status: eq.status || 'available',
      notes: eq.notes || '',
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
        await equipmentService.updateEquipment(editing._id, form);
      } else {
        await equipmentService.createEquipment(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eq) => {
    if (!window.confirm(`Delete "${eq.name}" (${eq.equipmentId})?`)) return;
    try {
      await equipmentService.deleteEquipment(eq._id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Manage Equipment</h1>
          <p className="mt-1 text-sm text-ink-muted">Add, edit or remove equipment items</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Equipment
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
        <input className="input pl-10" placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && items.length === 0 && (
        <EmptyState title="No equipment yet" description="Add your first equipment item." action={<button onClick={openCreate} className="btn-primary">Add Equipment</button>} />
      )}

      {!loading && items.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Lab</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Condition</th>
                  <th className="text-right px-4 py-3 font-medium text-ink-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((eq) => (
                  <tr key={eq._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-ink">{eq.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{eq.equipmentId}</td>
                    <td className="px-4 py-3 text-ink-muted">{eq.lab?.name || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{eq.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={eq.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={eq.condition} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(eq)} className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-brand-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(eq)} className="p-1.5 rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600">
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setModalOpen(false)} />
          <div className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-ink">{editing ? 'Edit Equipment' : 'Add Equipment'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-ink-subtle hover:bg-surface-muted"><X className="h-5 w-5" /></button>
            </div>
            {formError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Name *</label>
                  <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Equipment ID *</label>
                  <input className="input" required value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })} disabled={!!editing} />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select className="input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {EQUIPMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Laboratory *</label>
                  <select className="input" required value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })}>
                    <option value="">Select lab</option>
                    {labs.map((l) => <option key={l._id} value={l._id}>{l.name} ({l.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Manufacturer</label>
                  <input className="input" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {EQUIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Condition</label>
                  <select className="input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                    {EQUIPMENT_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

export default EquipmentManage;
