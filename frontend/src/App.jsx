import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EquipmentByCode from './pages/EquipmentByCode';

import StudentDashboard from './pages/student/StudentDashboard';
import Labs from './pages/student/Labs';
import LabDetail from './pages/student/LabDetail';
import Equipment from './pages/student/Equipment';
import EquipmentDetail from './pages/student/EquipmentDetail';
import BookEquipment from './pages/student/BookEquipment';
import MyBookings from './pages/student/MyBookings';

import AssistantDashboard from './pages/assistant/AssistantDashboard';
import AssistantBookings from './pages/assistant/BookingsManage';

import AdminDashboard from './pages/admin/AdminDashboard';
import LabsManage from './pages/admin/LabsManage';
import EquipmentManage from './pages/admin/EquipmentManage';
import AdminBookings from './pages/admin/BookingsManage';
import Analytics from './pages/admin/Analytics';
import UsersManage from './pages/admin/UsersManage';

import Maintenance from './pages/shared/Maintenance';
import Notifications from './pages/shared/Notifications';

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const PublicOnly = ({ children }) => {
    if (isAuthenticated) {
      const home = user?.role === 'admin' ? '/admin' : user?.role === 'assistant' ? '/assistant' : '/student';
      return <Navigate to={home} replace />;
    }
    return children;
  };

  const roleHome = user?.role === 'admin' ? '/admin' : user?.role === 'assistant' ? '/assistant' : '/student';

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      </Route>

      {/* QR deep link — any authenticated role */}
      <Route path="/equipment/:equipmentId" element={<EquipmentByCode />} />

      {/* Shared profile for all roles */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
      </Route>

      <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="labs" element={<Labs />} />
        <Route path="labs/:id" element={<LabDetail />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="equipment/:id" element={<EquipmentDetail />} />
        <Route path="equipment/:id/book" element={<BookEquipment />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/assistant" element={<ProtectedRoute roles={['assistant']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AssistantDashboard />} />
        <Route path="bookings" element={<AssistantBookings />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="equipment/:id" element={<EquipmentDetail />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManage />} />
        <Route path="labs" element={<LabsManage />} />
        <Route path="equipment" element={<EquipmentManage />} />
        <Route path="equipment/:id" element={<EquipmentDetail />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? roleHome : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
