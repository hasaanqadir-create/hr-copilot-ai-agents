import { FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { api, apiErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/ui/Button';
import { UserRole } from '../types';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('hr');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { isDark } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role, company: role === 'hr' ? company : undefined });
      setAuth(res.data.user, res.data.token);
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--accent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--accent-2)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', boxShadow: '0 8px 32px var(--glow)' }}>
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Create account</h1>
          <p className="text-secondary text-sm">Join HR Copilot today</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['hr', 'candidate'] as UserRole[]).map((r) => (
                <button type="button" key={r} onClick={() => setRole(r)}
                  className={clsx('rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
                    role === r ? 'text-white shadow-lg' : 'text-secondary hover:text-primary')}
                  style={role === r ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' } : {}}>
                  {r === 'hr' ? '👔 HR / Recruiter' : '👤 Candidate'}
                </button>
              ))}
            </div>

            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} />
            </div>

            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} />
            </div>

            {role === 'hr' && (
              <div className="relative">
                <Building2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" required placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} style={inputStyle} />
              </div>
            )}

            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} style={inputStyle} />
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creating…' : <>Create account <ArrowRight size={16} /></>}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-secondary">
          Have an account?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
