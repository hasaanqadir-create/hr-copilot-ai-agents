import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Users, CheckCircle2, XCircle, TrendingUp, Brain, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, apiErrorMessage } from '../lib/api';
import { DashboardMetrics } from '../types';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import toast from 'react-hot-toast';

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted', ats_scored: 'ATS', matched: 'Matched',
  ranked: 'Ranked', interview_scheduled: 'Scheduled', interviewed: 'Interviewed',
  offer_sent: 'Offer', hired: 'Hired', rejected: 'Rejected',
};

function StatCard({ icon: Icon, label, value, gradient, delay }: {
  icon: typeof Users; label: string; value: string | number; gradient: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="relative overflow-hidden group cursor-default">
        <CardBody className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: gradient, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <Icon size={20} />
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-primary">{value}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
          </div>
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
            style={{ background: gradient }} />
        </CardBody>
      </Card>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 text-sm">
        <p className="text-muted font-mono text-xs mb-1">{label}</p>
        <p className="text-primary font-bold">{payload[0].value} applicants</p>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setMetrics(res.data))
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const chartData = metrics
    ? Object.entries(STAGE_LABELS).map(([key, label]) => ({ stage: label, count: metrics.byStage[key] ?? 0 }))
    : [];

  const agents = [
    { name: 'Resume Intake', desc: 'Parses PDF/DOCX resumes', icon: Brain, color: 'var(--accent)' },
    { name: 'ATS Scoring', desc: 'Scores 0–100 with feedback', icon: Target, color: 'var(--accent-2)' },
    { name: 'Job Matching', desc: 'Match % + skill gap', icon: Zap, color: 'var(--accent-3)' },
  ];

  return (
    <div className="p-8 space-y-8">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-4xl font-bold">
          <span className="gradient-text">Hiring Analytics</span>
        </h1>
        <p className="mt-2 text-secondary text-sm">Live output from the Analytics Agent</p>
      </motion.header>

      {loading ? (
        <div className="flex items-center gap-3 text-secondary">
          <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          Loading metrics…
        </div>
      ) : !metrics || metrics.totalApplicants === 0 ? (
        <>
          {/* Empty state — show agent grid */}
          <Card>
            <CardBody className="py-12 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">Agents Ready</h3>
              <p className="text-secondary text-sm max-w-md mx-auto">
                Upload a resume in Candidates and apply to a job to see the full AI pipeline in action.
                Analytics will appear here automatically.
              </p>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent, i) => (
              <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardBody className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${agent.color}20`, color: agent.color }}>
                      <agent.icon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-primary text-sm">{agent.name} Agent</p>
                      <p className="text-muted text-xs mt-0.5">{agent.desc}</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Applicants" value={metrics.totalApplicants} gradient="linear-gradient(135deg, var(--accent), #5b4ff5)" delay={0} />
            <StatCard icon={CheckCircle2} label="Hired" value={metrics.selected} gradient="linear-gradient(135deg, var(--success), #00a884)" delay={0.1} />
            <StatCard icon={XCircle} label="Rejected" value={metrics.rejected} gradient="linear-gradient(135deg, var(--danger), #cc2244)" delay={0.2} />
            <StatCard icon={TrendingUp} label="Avg ATS Score" value={`${metrics.averageAtsScore}`} gradient="linear-gradient(135deg, var(--warn), #e8932d)" delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <h2 className="font-display text-lg font-semibold text-primary">Hiring Funnel</h2>
                  <p className="text-xs text-muted">Applicants by pipeline stage</p>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="stage" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}
                        fill="url(#barGradient)" />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" />
                          <stop offset="100%" stopColor="var(--accent-2)" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <h2 className="font-display text-lg font-semibold text-primary">Match Quality</h2>
                  <p className="text-xs text-muted">Average job match percentage</p>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center justify-center h-[260px]">
                    <div className="text-center">
                      <p className="font-display text-7xl font-bold gradient-text">{metrics.averageMatchPercentage}%</p>
                      <p className="text-muted text-sm mt-3">Average candidate-job match</p>
                      <p className="text-xs text-muted mt-1">across {metrics.totalApplicants} applications</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
