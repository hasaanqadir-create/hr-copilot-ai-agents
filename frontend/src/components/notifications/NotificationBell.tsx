import { useState, useRef, useEffect } from 'react';
import { Bell, Bot, CheckCircle, Info, AlertTriangle, X, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const icons = {
  agent: Bot,
  success: CheckCircle,
  info: Info,
  warn: AlertTriangle,
};
const colors = {
  agent: 'var(--accent)',
  success: 'var(--success)',
  info: '#60a5fa',
  warn: 'var(--warn)',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
          padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            fontSize: '9px', color: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>{unread}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            style={{
              position: 'absolute', right: 0, top: '44px', width: '320px', zIndex: 100,
              background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
              <button onClick={clearAll} style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCheck size={12} /> Clear all
              </button>
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No notifications
                </div>
              ) : notifications.map((n) => {
                const Icon = icons[n.type];
                return (
                  <div key={n.id} style={{
                    padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                    background: n.read ? 'transparent' : 'rgba(124,111,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${colors[n.type]}18`, color: colors[n.type] }}>
                      <Icon size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>{timeAgo(n.time)}</p>
                    </div>
                    {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '4px' }} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
