import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as equipmentService from '../services/equipmentService';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * QR deep link handler: /equipment/:equipmentId
 * Example QR payload: http://localhost:5173/equipment/ESP32-IOT-004
 */
const EquipmentByCode = () => {
  const { equipmentId } = useParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: `/equipment/${equipmentId}` } },
        replace: true,
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await equipmentService.getEquipmentById(equipmentId);
        if (cancelled) return;
        const eq = res.data.equipment;
        const base =
          user?.role === 'admin'
            ? '/admin'
            : user?.role === 'assistant'
            ? '/assistant'
            : '/student';
        navigate(`${base}/equipment/${eq._id}`, { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Equipment not found');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [equipmentId, isAuthenticated, authLoading, user, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-surface">
        <p className="text-red-600 text-sm">{error}</p>
        <Link to="/" className="btn-primary">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default EquipmentByCode;
