import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Copy, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/primitives';
import { useNotificationStore } from '../../store/notificationStore';

const categoryColors: Record<string, string> = {
  technical: 'var(--accent)',
  hr: 'var(--accent-2)',
  behavioral: 'var(--accent-3)',
};
const categoryEmoji: Record<string, string> = { technical: '⚙️', hr: '🤝', behavioral: '🧠' };

export function InterviewGeneratorPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    api.get('/jobs').then(async (jobsRes) => {
      const allApps: any[] = [];
      for (const job of jobsRes.data) {
        const res = await api.get(`/applications/job/${job._id}`).catch(() => ({ data: [] }));
        for (const app of res.data) {
          allApps.push({
            _id: app._id,
            name: `${app.candidate?.name} — ${job.title}`,
          });
        }
      }
      setApplications(allApps);
    }).catch(() => {});
  }, []);

  async function generate() {
    if (!selectedApp) { toast.error('Select a candidate first'); return; }
    setLoading(true);
    try {
      const res = await api.post(`/interviews/${selectedApp}/generate`, { difficulty });
      setQuestions(res.data.questions || []);
      addNotification({ title: 'Interview Questions Ready', message: `${res.data.questions?.length || 0} questions generated`, type: 'agent' });
      toast.success('Questions generated!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally { setLoading(false); }
  }

  function copyQuestion(q: string, id: string) {
    navigator.clipboard.writeText(q);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const grouped = questions.reduce((acc: any, q: any) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-6">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">Interview Generator</h1>
            <p className="text-secondary text-sm">AI generates resume-based questions tailored to each candidate</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="font-display text-base font-semibold text-primary">Configure</h2></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">Select Candidate</label>
              <select value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="">Choose candidate…</option>
                {applications.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy','medium','hard'] as const).map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className="py-2 rounded-xl text-xs font-medium capitalize transition-all"
                    style={{
                      background: difficulty === d ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                      color: difficulty === d ? 'white' : 'var(--text-secondary)',
                      border: '1px solid ' + (difficulty === d ? 'transparent' : 'var(--border)'),
                    }}>
                    {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="gradient" className="w-full" disabled={loading} onClick={generate}>
              {loading ? <><Zap size={14} className="animate-pulse" /> Generating…</> : <><Zap size={14} /> Generate Questions</>}
            </Button>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {questions.length === 0 ? (
            <Card><CardBody className="py-16 text-center">
              <Brain size={40} className="mx-auto mb-4 text-muted" />
              <p className="text-secondary">Select a candidate and click Generate to create AI-powered interview questions</p>
            </CardBody></Card>
          ) : (
            Object.entries(grouped).map(([category, qs]: any) => (
              <motion.div key={category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span>{categoryEmoji[category]}</span>
                      <h3 className="font-display text-base font-semibold text-primary capitalize">{category} Questions</h3>
                      <Badge tone="accent">{qs.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    {qs.map((q: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl p-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                        <span className="font-mono text-xs font-bold mt-0.5 w-5 flex-shrink-0"
                          style={{ color: categoryColors[category] }}>{i + 1}.</span>
                        <p className="flex-1 text-sm text-primary leading-relaxed">{q.question}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-mono px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>{q.difficulty}</span>
                          <button onClick={() => copyQuestion(q.question, `${category}-${i}`)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)', color: copied === `${category}-${i}` ? 'var(--success)' : 'var(--text-muted)' }}>
                            {copied === `${category}-${i}` ? <CheckCheck size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
