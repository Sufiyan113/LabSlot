import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Beaker, FlaskConical, Calendar, Clock, Wrench, ArrowRight, GraduationCap, UserCog,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as dashboardService from '../../services/dashboardService';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#6366f1', '#f59e0b', '#ef4444', '#94a3b8'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardService
      .getAdminDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const statusPie = Object.entries(data?.equipmentByStatus || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const monthly = data?.monthly || [];
  const mostBooked = data?.mostBooked || [];
  const labUtilization = data?.labUtilization || [];

  const chartTooltip = {
    contentStyle: {
      background: 'rgb(var(--surface-elevated))',
      border: '1px solid rgb(var(--border))',
      borderRadius: '12px',
      fontSize: '12px',
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`System overview · ${user?.name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/users" className="btn-secondary btn-sm">
              <Users className="h-3.5 w-3.5" /> Users
            </Link>
            <Link to="/admin/analytics" className="btn-primary btn-sm">
              Full analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Students" value={stats.totalStudents ?? 0} icon={GraduationCap} color="brand" to="/admin/users" />
            <StatCard label="Assistants" value={stats.totalAssistants ?? 0} icon={UserCog} color="cyan" to="/admin/users" />
            <StatCard label="Laboratories" value={stats.totalLabs ?? 0} icon={Beaker} color="violet" to="/admin/labs" />
            <StatCard label="Equipment" value={stats.totalEquipment ?? 0} icon={FlaskConical} color="emerald" to="/admin/equipment" />
            <StatCard label="Active Bookings" value={stats.activeBookings ?? 0} icon={Calendar} color="brand" to="/admin/bookings" />
            <StatCard label="Pending Requests" value={stats.pendingRequests ?? 0} icon={Clock} color="amber" to="/admin/bookings" />
            <StatCard label="Active Maintenance" value={stats.maintenanceItems ?? 0} icon={Wrench} color="red" to="/admin/maintenance" description="Reported + in progress" />
            <StatCard label="Critical Issues" value={stats.criticalMaintenance ?? 0} icon={Wrench} color="amber" to="/admin/maintenance" description="Priority critical" />
            <StatCard label="Completed Maintenance" value={stats.completedMaintenance ?? 0} icon={Wrench} color="emerald" to="/admin/maintenance" />
            <StatCard label="Total Users" value={stats.totalUsers ?? 0} icon={Users} color="slate" to="/admin/users" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="section-title mb-4">Monthly booking activity</h2>
          {!loading && monthly.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-ink-subtle">
              No booking data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--ink-subtle))' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgb(var(--ink-subtle))' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="section-title mb-4">Equipment status distribution</h2>
          {!loading && statusPie.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-ink-subtle">
              No equipment data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  strokeWidth={0}
                >
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="section-title mb-4">Most-booked equipment</h2>
          {!loading && mostBooked.length === 0 ? (
            <EmptyState title="No booking history" description="Most-booked equipment will appear after bookings are made." />
          ) : (
            <ul className="space-y-2">
              {mostBooked.map((item, i) => (
                <li
                  key={item._id || i}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-surface-muted text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-ink">{item.name || 'Unknown'}</span>
                    {item.equipmentId && (
                      <span className="text-xs font-mono text-ink-subtle ml-2">{item.equipmentId}</span>
                    )}
                  </div>
                  <span className="tabular-nums font-semibold text-ink shrink-0">{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="section-title mb-4">Lab utilization</h2>
          {!loading && labUtilization.length === 0 ? (
            <EmptyState title="No labs" description="Add laboratories to see utilization." />
          ) : labUtilization.some((l) => l.bookingCount > 0 || l.equipmentCount > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={labUtilization.map((l) => ({ name: l.code || l.name, equipment: l.equipmentCount, bookings: l.bookingCount }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(var(--ink-subtle))' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgb(var(--ink-subtle))' }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip} />
                <Legend />
                <Bar dataKey="equipment" fill="#6366f1" name="Equipment" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookings" fill="#22c55e" name="Bookings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ul className="space-y-2">
              {labUtilization.map((l) => (
                <li key={l._id} className="flex justify-between text-sm rounded-xl px-3 py-2.5 hover:bg-surface-muted">
                  <span className="font-medium text-ink">{l.name} <span className="text-ink-subtle font-normal">({l.code})</span></span>
                  <span className="text-ink-muted">{l.equipmentCount} eq · {l.bookingCount} bookings</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {data?.recentBookings?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent bookings</h2>
            <Link to="/admin/bookings" className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-1">
            {data.recentBookings.map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between text-sm rounded-xl px-3 py-2.5 hover:bg-surface-muted"
              >
                <span className="text-ink font-medium">
                  {b.equipment?.name}{' '}
                  <span className="text-ink-subtle font-normal">· {b.user?.name}</span>
                </span>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
