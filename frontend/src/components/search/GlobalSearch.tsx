import { useState, useEffect, useRef } from 'react';
import { Search, Users, Briefcase, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ candidates: any[]; jobs: any[] }>({ candidates: [], jobs: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults({ candidates: [], jobs: [] }); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [cRes, jRes] = await Promise.all([
          api.get('/candidates'),
          api.get('/jobs'),
        ]);
        const q = query.toLowerCase();
        setResults({
          candidates: cRes.data.filter((c: any) =>
            c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) ||
            c.parsed?.skills?.some((s: string) => s.toLowerCase().includes(q))
          ).slice(0, 4),
          jobs: jRes.data.filter((j: any) =>
            j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) ||
            j.requiredSkills?.some((s: string) => s.toLowerCase().includes(q))
          ).slice(0, 4),
        });
      } catch { }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results.candidates.length > 0 || results.jobs.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '13px', minWidth: '180px',
        }}
      >
        <Search size={14} />
        <span>Search…</span>
        <kbd style={{ marginLeft: 'auto', fontSize: '10px', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '560px', background: 'rgba(15,15,26,0.98)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <Search size={16} style={{ color: 'var(--accent)' }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search candidates, jobs, skills…"
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '15px', color: 'var(--text-primary)' }}
                />
                {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>}
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Searching…</div>}
                {!loading && query && !hasResults && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No results for "{query}"</div>}
                {!loading && !query && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Type to search candidates, jobs, or skills</div>}

                {results.candidates.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ padding: '6px 12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Candidates</div>
                    {results.candidates.map((c) => (
                      <button key={c._id} onClick={() => { navigate('/candidates'); setOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>{c.name?.[0]}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email} {c.atsResult ? `· ATS: ${c.atsResult.score}` : ''}</div>
                        </div>
                        <Users size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                      </button>
                    ))}
                  </div>
                )}

                {results.jobs.length > 0 && (
                  <div>
                    <div style={{ padding: '6px 12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Jobs</div>
                    {results.jobs.map((j) => (
                      <button key={j._id} onClick={() => { navigate('/jobs'); setOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: '14px' }}>💼</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{j.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{j.company}</div>
                        </div>
                        <Briefcase size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
