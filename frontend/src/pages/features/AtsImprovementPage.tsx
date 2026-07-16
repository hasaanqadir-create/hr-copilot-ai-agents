import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { Badge } from '../../components/ui/primitives';

export function AtsImprovementPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/candidates').then((res) => {
      setCandidates(res.data.filter((c: any) => c.atsResult));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--warn), #e8932d)' }}>
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">ATS Improvement</h1>
            <p className="text-secondary text-sm">AI suggestions to improve resume ATS scores</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted px-1">Candidates with ATS Scores</p>
          {loading ? (
            <p className="text-secondary text-sm">Loading…</p>
          ) : candidates.length === 0 ? (
            <Card><CardBody className="text-center py-8">
              <p className="text-secondary text-sm">No candidates with ATS scores yet. Upload and process a resume first.</p>
            </CardBody></Card>
          ) : candidates.map((c) => (
            <button key={c._id} onClick={() => setSelected(c)} className="w-full text-left glass rounded-xl px-4 py-3 transition-all"
              style={selected?._id === c._id ? { border: '1px solid var(--accent)', background: 'rgba(124,111,255,0.1)' } : {}}>
              <div className="flex items-center gap-3">
                <ScoreRing score={c.atsResult.score} label="" size={44} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{c.name}</p>
                  <p className="text-xs text-muted truncate">{c.email}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <Card><CardBody className="py-20 text-center">
              <Target size={40} className="mx-auto mb-4 text-muted" />
              <p className="text-secondary">Select a candidate to view their ATS analysis and improvement suggestions</p>
            </CardBody></Card>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card>
                <CardBody>
                  <div className="flex items-center gap-6">
                    <ScoreRing score={selected.atsResult.score} label="ATS Score" size={96} />
                    <div>
                      <h2 className="font-display text-2xl font-bold text-primary">{selected.name}</h2>
                      <p className="text-muted text-sm mb-3">{selected.email}</p>
                      <div className="flex gap-2">
                        <Badge tone={selected.atsResult.score >= 75 ? 'success' : selected.atsResult.score >= 50 ? 'warn' : 'danger'}>
                          {selected.atsResult.score >= 75 ? '✓ Strong' : selected.atsResult.score >= 50 ? '⚠ Average' : '✕ Weak'}
                        </Badge>
                        {selected.parsed?.experienceYears && <Badge tone="accent">{selected.parsed.experienceYears}y exp</Badge>}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {selected.atsResult.suggestions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                      <h3 className="font-display text-base font-semibold text-primary">AI Improvement Suggestions</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    {selected.atsResult.suggestions.map((s: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 rounded-xl p-4"
                        style={{ background: 'rgba(124,111,255,0.06)', border: '1px solid rgba(124,111,255,0.15)' }}>
                        <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                        <p className="text-sm text-primary leading-relaxed">{s}</p>
                      </motion.div>
                    ))}
                  </CardBody>
                </Card>
              )}

              {selected.atsResult.missingKeywords?.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} style={{ color: 'var(--warn)' }} />
                      <h3 className="font-display text-base font-semibold text-primary">Missing Keywords</h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap gap-2">
                      {selected.atsResult.missingKeywords.map((kw: string) => (
                        <Badge key={kw} tone="warn">+ {kw}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted mt-3">Add these keywords to your resume to improve ATS ranking</p>
                  </CardBody>
                </Card>
              )}

              {selected.parsed?.skills?.length > 0 && (
                <Card>
                  <CardHeader><h3 className="font-display text-base font-semibold text-primary">Current Skills</h3></CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap gap-2">
                      {selected.parsed.skills.map((s: string) => (
                        <Badge key={s} tone="success">{s}</Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
