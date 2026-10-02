import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FlaskConical, LayoutDashboard, Beaker, Calendar, Wrench, Users,
  BarChart3, Bell, LogOut, Menu, X, ChevronLeft, Settings, Search, Moon, Sun, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CommandPalette from '../components/CommandPalette';
import * as notificationService from '../services/notificationService';
import { clsx } from 'clsx';

const DashboardLayout = () => {
  const { user, logout, isAdmin, isAssistant, isStudent } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService.getNotifications()
      .then((res) => setUnread(res.data?.unreadCount || 0))
      .catch(() => {});
  }, [location.pathname]);

  // Close mobile drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNav = [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/labs', label: 'Laboratories', icon: Beaker },
    { to: '/student/equipment', label: 'Equipment', icon: FlaskConical },
    { to: '/student/bookings', label: 'My Bookings', icon: Calendar },
    { to: '/student/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
  ];

  const assistantNav = [
    { to: '/assistant', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/assistant/bookings', label: 'Booking Requests', icon: Calendar },
    { to: '/assistant/equipment', label: 'Equipment', icon: FlaskConical },
    { to: '/assistant/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/assistant/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/labs', label: 'Laboratories', icon: Beaker },
    { to: '/admin/equipment', label: 'Equipment', icon: FlaskConical },
    { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  ];

  const navItems = isAdmin ? adminNav : isAssistant ? assistantNav : studentNav;
  const roleLabel = isAdmin ? 'Admin' : isAssistant ? 'Assistant' : 'Student';
  const notifPath = isAdmin ? '/admin/notifications' : isAssistant ? '/assistant/notifications' : '/student/notifications';

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex h-16 items-center gap-2.5 border-b border-border shrink-0', collapsed && !mobile ? 'justify-center px-2' : 'px-5')}>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft shrink-0">
          <FlaskConical className="h-4 w-4" />
        </div>
        {(!collapsed || mobile) && (
          <span className="text-base font-semibold tracking-tight text-ink">LabSlot</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {(!collapsed || mobile) && (
          <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-wider text-ink-subtle">Menu</p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            title={collapsed && !mobile ? item.label : undefined}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150',
                collapsed && !mobile ? 'justify-center px-2.5 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand-600 dark:text-brand-400' : 'opacity-70')} strokeWidth={isActive ? 2.25 : 1.75} />
                {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                {(!collapsed || mobile) && item.label === 'Notifications' && unread > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-2xs font-semibold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className={clsx('border-t border-border p-3 shrink-0', collapsed && !mobile && 'flex justify-center')}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold dark:bg-brand-900 dark:text-brand-300 shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-2xs text-ink-subtle truncate">{roleLabel}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold dark:bg-brand-900 dark:text-brand-300">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-surface-elevated border-r border-border z-30 transition-all duration-300',
          collapsed ? 'lg:w-[68px]' : 'lg:w-60'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[min(18rem,85vw)] bg-surface-elevated shadow-elevated flex flex-col z-50 animate-slide-in-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-subtle hover:bg-surface-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className={clsx('flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300', collapsed ? 'lg:pl-[68px]' : 'lg:pl-60')}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-1.5 sm:gap-3 border-b border-border bg-surface-elevated/80 backdrop-blur-xl px-3 sm:px-6">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg text-ink-muted hover:bg-surface-muted"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            className="hidden lg:flex p-2 -ml-2 rounded-lg text-ink-muted hover:bg-surface-muted"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          {/* Search trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex flex-1 max-w-xs items-center gap-2 rounded-xl border border-border bg-surface-muted/50 px-3 py-1.5 text-sm text-ink-subtle hover:border-border-subtle transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="text-2xs font-mono border border-border rounded px-1 py-0.5">⌘K</kbd>
          </button>

          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCmdOpen(true)}
              className="sm:hidden p-2 rounded-lg text-ink-muted hover:bg-surface-muted"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              to={notifPath}
              className="relative p-2 rounded-lg text-ink-muted hover:bg-surface-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 ring-2 ring-surface-elevated" />
              )}
            </Link>

            {/* User menu */}
            <div className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-surface-muted transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold dark:bg-brand-900 dark:text-brand-300">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-medium text-ink leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-2xs text-ink-subtle">{roleLabel}</p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-56 rounded-2xl border border-border bg-surface-elevated py-1.5 shadow-elevated z-20 animate-scale-in">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-sm font-medium text-ink">{user?.name}</p>
                      <p className="text-xs text-ink-subtle truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink"
                    >
                      <Settings className="h-4 w-4" /> Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
