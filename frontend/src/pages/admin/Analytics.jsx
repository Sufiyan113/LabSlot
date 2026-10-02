import { useState, useEffect } from 'react';
import * as analyticsService from '../../services/analyticsService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#6366f1', '#f59e0b', '#ef4444', '#94a3b8', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [labs, setLabs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getOverview(),
      analyticsService.getBookingAnalytics(),
      analyticsService.getEquipmentAnalytics(),
      analyticsService.getLabAnalytics(),
    ]).then(([o, b, e, l]) => {
      setOverview(o.data);
      setBookings(b.data);
      setEquipment(e.data);
      setLabs(l.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const statusPie = Object.entries(equipment?.byStatus || {}).map(([name, value]) => ({ name, value }));
  const bookingStatus = Object.entries(bookings?.byStatus || {}).map(([name, value]) => ({ name, value }));
  const categories = (equipment?.byCategory || []).map((c) => ({ name: c._id, count: c.count }));
  const labUsage = (labs?.labs || []).map((l) => ({ name: l.code || l.name, bookings: l.bookingCount, equipment: l.equipmentCount }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">Real data from the LabSlot database</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Users', overview?.totalUsers],
          ['Labs', overview?.totalLabs],
          ['Equipment', overview?.totalEquipment],
          ['Active Bookings', overview?.activeBookings],
        ].map(([label, val]) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-semibold tracking-tight text-ink">{val ?? 0}</p>
            <p className="text-xs text-ink-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-ink mb-4">Monthly Booking Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookings?.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-ink mb-4">Equipment by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-ink mb-4">Booking Status Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={bookingStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                {bookingStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4 sm:p-6 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-ink mb-4">Equipment by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categories} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-ink mb-4">Lab Utilization</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={labUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="equipment" fill="#6366f1" name="Equipment" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bookings" fill="#22c55e" name="Bookings" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {bookings?.mostBooked?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-ink mb-4">Most Booked Equipment</h2>
          <ul className="space-y-2">
            {bookings.mostBooked.map((item, i) => (
              <li key={i} className="flex justify-between text-sm border-b border-border pb-2">
                <span>{item.name || 'Unknown'} <span className="text-xs font-mono text-ink-subtle">{item.equipmentId}</span></span>
                <span className="font-semibold text-ink">{item.count} bookings</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analytics;
