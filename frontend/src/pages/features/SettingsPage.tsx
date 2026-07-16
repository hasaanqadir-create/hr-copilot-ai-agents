import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Bell, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export function SettingsPage() {
  const { user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className="relative w-11 h-6 rounded-full transition-all duration-300"
      style={{ background: on ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.12)' }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
        style={{ left: on ? '24px' : '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-3))' }}>
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">Settings</h1>
            <p className="text-secondary text-sm">Manage your profile and preferences</p>
          </div>
        </div>
      </motion.header>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><User size={15} style={{ color: 'var(--accent)' }} /><h2 className="font-display text-base font-semibold text-primary">Profile</h2></div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-primary">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <p className="font-mono text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--accent)' }}>{user?.role}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Sun size={15} style={{ color: 'var(--warn)' }} /><h2 className="font-display text-base font-semibold text-primary">Appearance</h2></div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Dark Mode</p>
              <p className="text-xs text-muted">Glassmorphism dark theme</p>
            </div>
            <Toggle on={isDark} onClick={toggle} />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div onClick={() => { if (!isDark) toggle(); }}
              className="rounded-xl p-4 cursor-pointer transition-all flex items-center gap-2"
              style={{ background: isDark ? 'rgba(124,111,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isDark ? 'var(--accent)' : 'var(--border)'}` }}>
              <Moon size={16} style={{ color: isDark ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="text-sm text-primary">Dark</span>
              {isDark && <span className="ml-auto font-mono text-xs" style={{ color: 'var(--accent)' }}>Active</span>}
            </div>
            <div onClick={() => { if (isDark) toggle(); }}
              className="rounded-xl p-4 cursor-pointer transition-all flex items-center gap-2"
              style={{ background: !isDark ? 'rgba(124,111,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${!isDark ? 'var(--accent)' : 'var(--border)'}` }}>
              <Sun size={16} style={{ color: !isDark ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="text-sm text-primary">Light</span>
              {!isDark && <span className="ml-auto font-mono text-xs" style={{ color: 'var(--accent)' }}>Active</span>}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Bell size={15} style={{ color: 'var(--accent-2)' }} /><h2 className="font-display text-base font-semibold text-primary">Notifications</h2></div>
        </CardHeader>
        <CardBody className="space-y-4">
          {[['In-app Notifications', 'Agent alerts, pipeline updates', notifications, setNotifications],
            ['Email Alerts', 'Daily summary of hiring activity', emailAlerts, setEmailAlerts]].map(([label, desc, val, setter]: any) => (
            <div key={label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-primary">{label}</p><p className="text-xs text-muted">{desc}</p></div>
              <Toggle on={val} onClick={() => setter(!val)} />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Shield size={15} style={{ color: 'var(--success)' }} /><h2 className="font-display text-base font-semibold text-primary">AI Provider</h2></div>
        </CardHeader>
        <CardBody>
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)' }}>
            <p className="text-xs font-mono uppercase tracking-widest text-success mb-1">Configured in backend/.env</p>
            <p className="text-sm text-primary">AI provider settings are managed server-side for security. Edit <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>backend/.env</code> to change the provider or API key.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
