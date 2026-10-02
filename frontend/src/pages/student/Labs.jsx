import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, FlaskConical, Beaker } from 'lucide-react';
import * as labService from '../../services/labService';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await labService.getLabs({ search: search || undefined, status: statusFilter || undefined });
        setLabs(res.data.labs || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load laboratories');
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetch, 280);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Laboratories" subtitle="Browse available laboratories and their equipment" />

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input className="input pl-10" placeholder="Search by name, code, building…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="under_renovation">Under renovation</option>
        </select>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>}
      {!loading && labs.length === 0 && <EmptyState icon={Beaker} title="No laboratories found" description="Try adjusting your search or filters." />}

      {!loading && labs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {labs.map((lab) => (
            <Link key={lab._id} to={`/student/labs/${lab._id}`} className="card-interactive p-5 block group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{lab.name}</h3>
                    <p className="text-xs font-mono text-ink-subtle">{lab.code}</p>
                  </div>
                </div>
                <StatusBadge status={lab.status} />
              </div>
              <div className="space-y-1.5 text-sm text-ink-muted">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-ink-subtle" /><span>{lab.building}{lab.floor ? `, Floor ${lab.floor}` : ''} · Room {lab.roomNumber}</span></div>
                <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-ink-subtle" /><span>Capacity {lab.capacity}</span></div>
                <div className="flex items-center gap-2"><FlaskConical className="h-3.5 w-3.5 text-ink-subtle" /><span>{lab.equipmentCount ?? 0} equipment</span></div>
              </div>
              {lab.department && <p className="mt-3 text-xs text-ink-subtle">{lab.department}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Labs;
