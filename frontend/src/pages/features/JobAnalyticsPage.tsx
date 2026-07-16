import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart2 as ChartIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/primitives';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 text-sm">
        <p className="text-muted font-mono text-xs mb-1">{label}</p>
        <p className="text-primary font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function JobAnalyticsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs').then((res) => { setJobs(res.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    api.get(`/applications/job/${selectedJob._id}`).then((res) => setApplications(res.data)).catch(() => {});
  }, [selectedJob]);

  const avgMatch = applications.length
    ? Math.round(applications.reduce((s, a) => s + (a.matchResult?.matchPercentage ?? 0), 0) / applications.length)
    : 0;

  const skillFrequency = applications.reduce((acc: Record<string, number>, app) => {
    app.matchResult?.matchedSkills?.forEach((s: string) => { acc[s] = (acc[s] ?? 0) + 1; });
    return acc;
  }, {});
  const topSkills = Object.entries(skillFrequency).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([skill, count]) => ({ skill, count }));

  const missingSkillFreq = applications.reduce((acc: Record<string, number>, app) => {
    app.matchResult?.missingSkills?.forEach((s: string) => { acc[s] = (acc[s] ?? 0) + 1; });
    return acc;
  }, {});
  const topMissing = Object.entries(missingSkillFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  const stageData = ['submitted','ats_scored','matched','ranked','hired','rejected'].map((stage) => ({
    stage: stage.replace('_', ' '),
    count: applications.filter((a) => a.stage === stage).length,
  }));

  return (
    <div className="p-8 space-y-6">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-3), var(--accent))' }}>
            <ChartIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">Job Analytics</h1>
            <p className="text-secondary text-sm">Skill gap analysis and hiring insights per job</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted px-1">Select Job</p>
          {loading ? <p className="text-secondary text-sm">Loading…</p> :
            jobs.map((j) => (
              <button key={j._id} onClick={() => setSelectedJob(j)} className="w-full text-left glass rounded-xl px-4 py-3 transition-all"
                style={selectedJob?._id === j._id ? { border: '1px solid var(--accent)', background: 'rgba(124,111,255,0.1)' } : {}}>
                <p className="text-sm font-semibold text-primary">{j.title}</p>
                <p className="text-xs text-muted">{j.company}</p>
              </button>
            ))
          }
        </div>

        <div className="lg:col-span-3 space-y-4">
          {!selectedJob ? (
            <Card><CardBody className="py-20 text-center">
              <ChartIcon size={40} className="mx-auto mb-4 text-muted" />
              <p className="text-secondary">Select a job to view analytics and skill gap reports</p>
            </CardBody></Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[['Total Applicants', applications.length, 'var(--accent)'],
                  ['Avg Match %', `${avgMatch}%`, 'var(--accent-3)'],
                  ['Hired', applications.filter(a=>a.stage==='hired').length, 'var(--success)']].map(([label, val, color]: any) => (
                  <Card key={label}><CardBody className="text-center py-4">
                    <p className="font-display text-3xl font-bold" style={{ color }}>{val}</p>
                    <p className="text-xs text-muted uppercase tracking-widest mt-1 font-mono">{label}</p>
                  </CardBody></Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><h3 className="font-display text-base font-semibold text-primary">Top Matched Skills</h3></CardHeader>
                  <CardBody>
                    {topSkills.length === 0 ? <p className="text-muted text-sm">No data yet</p> :
                      <div className="space-y-2">
                        {topSkills.map(({ skill, count }) => (
                          <div key={skill} className="flex items-center gap-3">
                            <div className="flex-1 text-sm text-primary">{skill}</div>
                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                              <div className="h-full rounded-full" style={{ width: `${(count/applications.length)*100}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
                            </div>
                            <Badge tone="accent">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    }
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader><h3 className="font-display text-base font-semibold text-primary">Skill Gap Analysis</h3><p className="text-xs text-muted">Most commonly missing skills</p></CardHeader>
                  <CardBody>
                    {topMissing.length === 0 ? <p className="text-muted text-sm">No data yet</p> :
                      <div className="space-y-2">
                        {topMissing.map(({ skill, count }) => (
                          <div key={skill} className="flex items-center gap-3">
                            <div className="flex-1 text-sm text-primary">{skill}</div>
                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                              <div className="h-full rounded-full" style={{ width: `${(count/applications.length)*100}%`, background: 'linear-gradient(90deg, var(--warn), var(--danger))' }} />
                            </div>
                            <Badge tone="warn">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    }
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader><h3 className="font-display text-base font-semibold text-primary">Pipeline Stages</h3></CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stageData} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[6,6,0,0]} fill="url(#barGrad2)" />
                      <defs>
                        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-3)" />
                          <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
