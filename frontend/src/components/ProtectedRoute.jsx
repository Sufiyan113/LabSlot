import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protects routes that require authentication.
 * Optionally restricts by role: roles={['admin', 'assistant']}
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to the appropriate dashboard for their role
    const roleHome =
      user?.role === 'admin'
        ? '/admin'
        : user?.role === 'assistant'
        ? '/assistant'
        : '/student';
    return <Navigate to={roleHome} replace />;
  }

  return children;
};

export default ProtectedRoute;
