import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bot, UserCheck, Briefcase, FileText, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/primitives';

function timeAgo(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
}

const stageConfig: Record<string, { icon: any; color: string; label: string }> = {
  submitted:            { icon: FileText,   color: 'var(--text-muted)', label: 'Application Submitted' },
  ats_scored:           { icon: Bot,        color: 'var(--accent)',      label: 'ATS Agent Scored'     },
  matched:              { icon: Bot,        color: 'var(--accent-2)',    label: 'Job Match Complete'   },
  ranked:               { icon: Bot,        color: 'var(--accent-3)',    label: 'Candidate Ranked'     },
  interview_scheduled:  { icon: Activity,   color: 'var(--warn)',        label: 'Interview Scheduled'  },
  interviewed:          { icon: UserCheck,  color: 'var(--accent)',      label: 'Interview Completed'  },
  offer_sent:           { icon: Mail,       color: 'var(--accent-3)',    label: 'Offer Letter Sent'    },
  hired:                { icon: UserCheck,  color: 'var(--success)',     label: 'Candidate Hired'      },
  rejected:             { icon: Activity,   color: 'var(--danger)',      label: 'Application Rejected' },
};

export function ActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs').then(async (jobsRes) => {
      const all: any[] = [];
      for (const job of jobsRes.data) {
        const res = await api.get(`/applications/job/${job._id}`).catch(() => ({ data: [] }));
        for (const app of res.data) {
          for (const h of (app.stageHistory || [])) {
            all.push({
              id: `${app._id}-${h.stage}-${h.at}`,
              candidateName: app.candidate?.name,
              jobTitle: job.title,
              company: job.company,
              stage: h.stage,
              at: h.at,
              note: h.note,
            });
          }
        }
      }
      setEvents(all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-2), var(--accent))' }}>
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">Activity Timeline</h1>
            <p className="text-secondary text-sm">Full audit log of all hiring pipeline events</p>
          </div>
        </div>
      </motion.header>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-primary">All Events</h2>
          <p className="text-xs text-muted">{events.length} total events</p>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center text-secondary text-sm">Loading activity…</div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center">
              <Activity size={36} className="mx-auto mb-3 text-muted" />
              <p className="text-secondary text-sm">No activity yet. Start by uploading a resume and applying to a job.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-10 top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(180deg, var(--accent), var(--accent-2), transparent)' }} />
              {events.map((e, i) => {
                const cfg = stageConfig[e.stage] ?? { icon: Activity, color: 'var(--text-muted)', label: e.stage };
                const Icon = cfg.icon;
                return (
                  <motion.div key={e.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}
                    className="flex items-start gap-4 px-6 py-4"
                    style={{ borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div className="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-primary">{cfg.label}</span>
                        <Badge tone="neutral">{e.stage.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        <span className="text-secondary font-medium">{e.candidateName}</span>
                        {' '}&rarr;{' '}{e.jobTitle} at {e.company}
                      </p>
                      {e.note && <p className="text-xs text-muted mt-0.5 italic">{e.note}</p>}
                    </div>
                    <span className="font-mono text-[10px] text-muted flex-shrink-0">{timeAgo(e.at)}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
