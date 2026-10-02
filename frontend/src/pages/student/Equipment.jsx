import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FlaskConical, ArrowUpRight } from 'lucide-react';
import * as equipmentService from '../../services/equipmentService';
import * as labService from '../../services/labService';
import PageHeader from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES, EQUIPMENT_CONDITIONS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Equipment = () => {
  const { isStudent, isAdmin, isAssistant } = useAuth();
  const [items, setItems] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ lab: '', category: '', status: '', condition: '' });

  const base = isAdmin ? '/admin' : isAssistant ? '/assistant' : '/student';

  useEffect(() => {
    labService.getLabs().then((res) => setLabs(res.data.labs || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { search: search || undefined };
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
        const res = await equipmentService.getEquipment(params);
        setItems(res.data.equipment || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetch, 280);
    return () => clearTimeout(t);
  }, [search, filters]);

  const updateFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Equipment" subtitle="Browse and search laboratory equipment" />

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search by name or equipment ID…"
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <select className="input" value={filters.lab} onChange={(e) => updateFilter('lab', e.target.value)}>
            <option value="">All labs</option>
            {labs.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <select className="input" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
            <option value="">All categories</option>
            {EQUIPMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            {EQUIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={filters.condition} onChange={(e) => updateFilter('condition', e.target.value)}>
            <option value="">All conditions</option>
            {EQUIPMENT_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState icon={FlaskConical} title="No equipment found" description="Try adjusting search or filters." />
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((eq) => (
            <Link key={eq._id} to={`${base}/equipment/${eq._id}`} className="card-interactive group overflow-hidden block">
              <div className="h-36 bg-gradient-to-br from-surface-muted to-surface flex items-center justify-center relative">
                {eq.image ? (
                  <img src={eq.image} alt={eq.name} className="h-full w-full object-cover" />
                ) : (
                  <FlaskConical className="h-12 w-12 text-ink-subtle/40" strokeWidth={1.25} />
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={eq.status} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                      {eq.name}
                    </h3>
                    <p className="text-xs font-mono text-ink-subtle mt-0.5">{eq.equipmentId}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="badge bg-surface-muted text-ink-muted ring-1 ring-border">{eq.category}</span>
                  <StatusBadge status={eq.condition} />
                </div>
                {eq.lab && (
                  <p className="mt-2.5 text-xs text-ink-subtle">{eq.lab.name} · {eq.lab.code}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Equipment;
