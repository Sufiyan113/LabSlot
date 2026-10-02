import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, FlaskConical } from 'lucide-react';
import * as labService from '../../services/labService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const LabDetail = () => {
  const { id } = useParams();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await labService.getLab(id);
        setLab(res.data.lab);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lab');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error || 'Lab not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/student/labs"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Laboratories
      </Link>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{lab.name}</h1>
              <StatusBadge status={lab.status} />
            </div>
            <p className="text-sm font-mono text-ink-muted">{lab.code}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-ink-muted">
            <MapPin className="h-4 w-4 text-ink-subtle" />
            {lab.building}{lab.floor ? `, Fl. ${lab.floor}` : ''} · Room {lab.roomNumber}
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Users className="h-4 w-4 text-ink-subtle" />
            Capacity: {lab.capacity}
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <FlaskConical className="h-4 w-4 text-ink-subtle" />
            {lab.equipmentCount ?? 0} equipment
          </div>
        </div>

        {lab.description && (
          <p className="mt-4 text-sm text-ink-muted leading-relaxed">{lab.description}</p>
        )}
        {lab.department && (
          <p className="mt-2 text-xs text-ink-subtle">Department: {lab.department}</p>
        )}
      </div>

      {/* Equipment in this lab */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Equipment in this lab</h2>
        {(!lab.equipment || lab.equipment.length === 0) ? (
          <div className="card p-8 text-center text-sm text-ink-subtle">
            No equipment assigned to this lab yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {lab.equipment.map((eq) => (
              <Link
                key={eq._id}
                to={`../equipment/${eq._id}`}
                className="card p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-ink">{eq.name}</h3>
                    <p className="text-xs font-mono text-ink-muted">{eq.equipmentId}</p>
                  </div>
                  <StatusBadge status={eq.status} />
                </div>
                <div className="mt-2 flex gap-2 text-xs text-ink-muted">
                  <span>{eq.category}</span>
                  <span>·</span>
                  <span className="capitalize">{eq.condition}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDetail;
