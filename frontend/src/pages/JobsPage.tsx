import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Briefcase, Plus, ChevronRight } from 'lucide-react';
import { api, apiErrorMessage } from '../lib/api';
import { Application, Job } from '../types';
import { ApplicationCard } from '../components/jobs/ApplicationCard';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/primitives';
import { Button } from '../components/ui/Button';

function CreateJobModal({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs', {
        title, company, description,
        requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Job posted!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-semibold text-primary">Post a New Job</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Job Title</label>
                  <input required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} placeholder="Senior Developer" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Company</label>
                  <input required value={company} onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} placeholder="Acme Inc." />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Description</label>
                <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none" style={inputStyle}
                  placeholder="Job description…" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Required Skills (comma separated)</label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}
                  placeholder="React, Node.js, TypeScript" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={loading}>
                  {loading ? 'Posting…' : '🚀 Post Job'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

function ApplyModal({ jobId, onApplied, onClose }: { jobId: string; onApplied: () => void; onClose: () => void }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateId, setCandidateId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/candidates').then((res) => setCandidates(res.data)).catch(() => {});
  }, []);

  async function handleApply() {
    if (!candidateId) { toast.error('Select a candidate'); return; }
    setLoading(true);
    try {
      toast.loading('🤖 Running full AI pipeline…', { id: 'apply' });
      await api.post('/applications', { candidateId, jobId });
      toast.success('Pipeline complete!', { id: 'apply' });
      onApplied();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err), { id: 'apply' });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-semibold text-primary">Apply Candidate</h2>
            <p className="text-xs text-muted mt-1">Runs ATS → Job Match → Ranking agents</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Select Candidate</label>
              <select value={candidateId} onChange={(e) => setCandidateId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                <option value="">Choose a candidate…</option>
                {candidates.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="gradient" className="flex-1" disabled={loading} onClick={handleApply}>
                {loading ? 'Processing…' : '🤖 Run Pipeline'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchJobs = useCallback(() => {
    setLoadingJobs(true);
    api.get('/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoadingJobs(false));
  }, []);

  const fetchApplications = useCallback((jobId: string) => {
    setLoadingApps(true);
    api.get(`/applications/job/${jobId}`)
      .then((res) => setApplications(res.data))
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoadingApps(false));
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { if (selectedJobId) fetchApplications(selectedJobId); }, [selectedJobId, fetchApplications]);

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="p-8 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold gradient-text">Jobs</h1>
          <p className="mt-2 text-secondary text-sm">Post roles and run the AI matching pipeline</p>
        </div>
        <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Post Job
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Jobs list */}
        <div className="lg:col-span-1 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted px-1">
            Open Roles ({jobs.length})
          </p>
          {loadingJobs ? (
            <div className="text-secondary text-sm py-4">Loading…</div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardBody className="text-center py-8">
                <Briefcase size={32} className="mx-auto mb-3 text-muted" />
                <p className="text-secondary text-sm">No jobs yet</p>
                <Button variant="gradient" size="sm" className="mt-3" onClick={() => setShowCreateModal(true)}>
                  Post first job
                </Button>
              </CardBody>
            </Card>
          ) : (
            jobs.map((job) => (
              <motion.button key={job._id} whileHover={{ x: 2 }}
                onClick={() => setSelectedJobId(job._id)}
                className={clsx('w-full text-left rounded-xl px-4 py-3.5 transition-all duration-200 flex items-center justify-between gap-2', 'glass')}
                style={selectedJobId === job._id
                  ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', border: 'none' }
                  : {}}>
                <div className="min-w-0">
                  <p className={clsx('text-sm font-semibold truncate', selectedJobId === job._id ? 'text-white' : 'text-primary')}>{job.title}</p>
                  <p className={clsx('text-xs truncate', selectedJobId === job._id ? 'text-white/70' : 'text-muted')}>{job.company}</p>
                </div>
                <ChevronRight size={14} className={selectedJobId === job._id ? 'text-white/70' : 'text-muted'} />
              </motion.button>
            ))
          )}
        </div>

        {/* Job detail + applicants */}
        <div className="space-y-4 lg:col-span-2">
          {!selectedJob ? (
            <Card>
              <CardBody className="py-16 text-center">
                <div className="text-5xl mb-4">👈</div>
                <p className="text-secondary">Select a job to view applicants and run the AI pipeline</p>
              </CardBody>
            </Card>
          ) : (
            <>
              <Card>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-primary">{selectedJob.title}</h2>
                      <p className="text-muted text-sm">{selectedJob.company}</p>
                    </div>
                    <Button variant="gradient" size="sm" onClick={() => setShowApplyModal(true)}>
                      🤖 Apply Candidate
                    </Button>
                  </div>
                  <p className="text-secondary text-sm mb-4 line-clamp-3">{selectedJob.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((s) => (
                      <Badge key={s} tone="accent">{s}</Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Applicants ({applications.length}) · sorted by rank score
                </p>
                {loadingApps ? (
                  <div className="flex items-center gap-3 text-secondary py-4">
                    <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    Loading…
                  </div>
                ) : applications.length === 0 ? (
                  <Card>
                    <CardBody className="text-center py-8">
                      <p className="text-secondary text-sm">No applicants yet. Click "Apply Candidate" to run the pipeline.</p>
                    </CardBody>
                  </Card>
                ) : (
                  applications.map((app, i) => <ApplicationCard key={app._id} application={app} index={i} />)
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateJobModal onCreated={fetchJobs} onClose={() => setShowCreateModal(false)} />
      )}
      {showApplyModal && selectedJobId && (
        <ApplyModal jobId={selectedJobId} onApplied={() => fetchApplications(selectedJobId)} onClose={() => setShowApplyModal(false)} />
      )}
    </div>
  );
}
