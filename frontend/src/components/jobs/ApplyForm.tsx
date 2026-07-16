import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '../../lib/api';
import { Candidate } from '../../types';
import { Button } from '../ui/Button';
import { Label } from '../ui/primitives';

export function ApplyForm({ jobId, onApplied }: { jobId: string; onApplied: () => void }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateId, setCandidateId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/candidates').then((res) => setCandidates(res.data)).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!candidateId) {
      toast.error('Choose a candidate');
      return;
    }
    setLoading(true);
    try {
      toast.loading('Running full agent pipeline: ATS → Job Match → Ranking…', { id: 'apply' });
      await api.post('/applications', { candidateId, jobId });
      toast.success('Application processed', { id: 'apply' });
      onApplied();
    } catch (err) {
      toast.error(apiErrorMessage(err), { id: 'apply' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <Label htmlFor="apply-candidate">Apply a candidate to this job</Label>
        <select
          id="apply-candidate"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          className="w-full rounded-md border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Select a candidate…</option>
          {candidates.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Processing…' : 'Apply & Run Pipeline'}
      </Button>
    </form>
  );
}
