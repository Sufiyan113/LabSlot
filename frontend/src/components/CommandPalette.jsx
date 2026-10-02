import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FlaskConical, Beaker, Calendar, LayoutDashboard, Users, BarChart3, Wrench, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

const CommandPalette = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAdmin, isAssistant, isStudent } = useAuth();

  const pages = useMemo(() => {
    const common = [
      { label: 'Dashboard', path: isAdmin ? '/admin' : isAssistant ? '/assistant' : '/student', icon: LayoutDashboard, group: 'Pages' },
      { label: 'Equipment', path: isAdmin ? '/admin/equipment' : isAssistant ? '/assistant/equipment' : '/student/equipment', icon: FlaskConical, group: 'Pages' },
      { label: 'Maintenance', path: isAdmin ? '/admin/maintenance' : isAssistant ? '/assistant/maintenance' : '/student/maintenance', icon: Wrench, group: 'Pages' },
      { label: 'Notifications', path: isAdmin ? '/admin/notifications' : isAssistant ? '/assistant/notifications' : '/student/notifications', icon: Bell, group: 'Pages' },
      { label: 'Profile', path: '/profile', icon: Users, group: 'Pages' },
    ];
    if (isStudent) {
      common.push(
        { label: 'Laboratories', path: '/student/labs', icon: Beaker, group: 'Pages' },
        { label: 'My Bookings', path: '/student/bookings', icon: Calendar, group: 'Pages' }
      );
    }
    if (isAssistant) {
      common.push({ label: 'Booking Requests', path: '/assistant/bookings', icon: Calendar, group: 'Pages' });
    }
    if (isAdmin) {
      common.push(
        { label: 'Users', path: '/admin/users', icon: Users, group: 'Pages' },
        { label: 'Laboratories', path: '/admin/labs', icon: Beaker, group: 'Pages' },
        { label: 'Bookings', path: '/admin/bookings', icon: Calendar, group: 'Pages' },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, group: 'Pages' }
      );
    }
    return common;
  }, [isAdmin, isAssistant, isStudent]);

  const filtered = useMemo(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) => p.label.toLowerCase().includes(q) || p.path.includes(q));
  }, [query, pages]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === 'Enter' && filtered[active]) {
        navigate(filtered[active].path);
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, filtered, active, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[8vh] sm:pt-[15vh] px-3 sm:px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg card shadow-elevated animate-scale-in overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-4 w-4 text-ink-subtle shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search pages, navigate…"
            className="flex-1 py-3.5 text-sm bg-transparent outline-none text-ink placeholder:text-ink-subtle"
          />
          <kbd className="hidden sm:inline text-2xs text-ink-subtle border border-border rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-ink-subtle">No results</li>
          )}
          {filtered.map((item, i) => (
            <li key={item.path}>
              <button
                onClick={() => { navigate(item.path); onClose(); }}
                onMouseEnter={() => setActive(i)}
                className={clsx(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  i === active ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-ink-muted hover:bg-surface-muted'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-70" />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto text-2xs text-ink-subtle font-mono">{item.path}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-4 py-2 text-2xs text-ink-subtle flex gap-3">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>esc Close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
