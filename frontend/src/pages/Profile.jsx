import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    authService.getMe()
      .then((res) => {
        const u = res.data.user;
        setProfile(u);
        reset({
          name: u.name || '',
          phone: u.phone || '',
          department: u.department || '',
          profileImage: u.profileImage || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authService.updateProfile(data);
      setProfile(res.data.user);
      setSuccess('Profile updated successfully');
      // Refresh localStorage user snapshot if present
      const stored = localStorage.getItem('labslot_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('labslot_user', JSON.stringify({ ...parsed, ...res.data.user }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">Update your account information</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xl font-bold">
            {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-ink">{profile?.name}</p>
            <p className="text-sm text-ink-muted">{profile?.email}</p>
            <p className="text-xs text-ink-subtle capitalize mt-0.5">{profile?.role}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" {...register('name', { required: 'Name is required', minLength: 2 })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input bg-surface" value={profile?.email || ''} disabled />
          </div>
          {profile?.studentId && (
            <div>
              <label className="label">Student ID (read-only)</label>
              <input className="input bg-surface" value={profile.studentId} disabled />
            </div>
          )}
          <div>
            <label className="label">Department</label>
            <input className="input" {...register('department')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Profile image URL</label>
            <input className="input" placeholder="https://..." {...register('profileImage')} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : <><Save className="h-4 w-4" /> Save changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
