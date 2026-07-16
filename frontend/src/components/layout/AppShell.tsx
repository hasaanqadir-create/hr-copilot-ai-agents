import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, LogOut, Sparkles,
  Sun, Moon, Brain, Mail, FileText, Target, BarChart2, Activity, Settings, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { NotificationBell } from '../notifications/NotificationBell';
import { GlobalSearch } from '../search/GlobalSearch';

const NAV_MAIN = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/candidates', label: 'Candidates',   icon: Users           },
  { to: '/jobs',       label: 'Jobs',         icon: Briefcase       },
];
const NAV_AI = [
  { to: '/interview-generator', label: 'Interview AI',    icon: Brain   },
  { to: '/ats-improvement',     label: 'ATS Suggestions', icon: Target  },
  { to: '/email-templates',     label: 'Email Templates', icon: Mail    },
  { to: '/offer-letter',        label: 'Offer Letter',    icon: FileText},
  { to: '/job-analytics',       label: 'Job Analytics',   icon: BarChart2},
];
const NAV_SYSTEM = [
  { to: '/activity', label: 'Activity Log', icon: Activity },
  { to: '/settings', label: 'Settings',     icon: Settings },
];

function NavGroup({ title, items }: { title: string; items: typeof NAV_MAIN }) {
  return (
    <div className="mb-2">
      <p className="px-4 mb-1 text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-0.5',
            isActive ? 'text-white' : 'text-secondary hover:text-primary hover:bg-white/5'
          )}
          style={({ isActive }) => isActive
            ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', boxShadow: '0 4px 15px var(--glow)' }
            : {}}>
          <Icon size={15} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}

export function AppShell() {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '64px' : '240px', flexShrink: 0,
        background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease', overflow: 'hidden', position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px var(--glow)' }}>
            <Sparkles size={15} color="white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-sm font-bold text-primary">HR Copilot</p>
              <p className="font-mono text-[9px] tracking-widest text-muted">AI POWERED</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
            <ChevronRight size={14} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* Nav */}
        {!collapsed && (
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            <NavGroup title="Main" items={NAV_MAIN} />
            <NavGroup title="AI Agents" items={NAV_AI} />
            <NavGroup title="System" items={NAV_SYSTEM} />
          </nav>
        )}

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px' }}>
          <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
          </button>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{user?.role}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', background: 'rgba(10,10,20,0.5)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <GlobalSearch />
          <div style={{ marginLeft: 'auto' }}>
            <NotificationBell />
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
