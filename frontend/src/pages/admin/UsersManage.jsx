import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, UserX, X } from 'lucide-react';
import * as userService from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  name: '', email: '', password: '', role: 'student',
  studentId: '', department: '', phone: '',
};

const UsersManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      studentId: u.studentId || '',
      department: u.department || '',
      phone: u.phone || '',
      isActive: u.isActive !== false,
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
        const payload = {
          name: form.name,
          department: form.department,
          phone: form.phone,
          studentId: form.studentId || undefined,
          isActive: form.isActive,
          role: form.role,
        };
        await userService.updateUser(editing._id, payload);
      } else {
        await userService.createUser(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (!window.confirm(`Deactivate ${u.name} (${u.email})?`)) return;
    try {
      await userService.deactivateUser(u._id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Manage Users</h1>
          <p className="mt-1 text-sm text-ink-muted">Students, lab assistants, and account status</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input className="input pl-10" placeholder="Search name, email, student ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="assistant">Assistant</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && users.length === 0 && <EmptyState title="No users found" description="Adjust filters or add a user." />}

      {!loading && users.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Student ID</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-ink-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                    <td className="px-4 py-3 capitalize text-ink-muted">{u.role}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{u.studentId || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-ink-muted'}`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-brand-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {u.isActive !== false && (
                        <button onClick={() => handleDeactivate(u)} className="p-1.5 rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600" title="Deactivate">
                          <UserX className="h-4 w-4" />
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setModalOpen(false)} />
          <div className="relative card w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-ink-subtle" /></button>
            </div>
            {formError && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="label">Name *</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              {!editing && (
                <>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <input type="password" className="input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={editing?.role === 'admin'}>
                  <option value="student">Student</option>
                  <option value="assistant">Assistant</option>
                </select>
              </div>
              <div>
                <label className="label">Student ID</label>
                <input className="input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
              </div>
              <div>
                <label className="label">Department</label>
                <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              {editing && (
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  Active account
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2">
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

export default UsersManage;
