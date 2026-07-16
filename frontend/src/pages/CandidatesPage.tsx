import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { api, apiErrorMessage } from '../lib/api';
import { Candidate } from '../types';
import { ResumeUploadCard } from '../components/candidates/ResumeUploadCard';
import { CandidateCard } from '../components/candidates/CandidateCard';

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(() => {
    setLoading(true);
    api.get('/candidates')
      .then((res) => setCandidates(res.data))
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  return (
    <div className="p-8 space-y-8">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-4xl font-bold gradient-text">Candidates</h1>
        <p className="mt-2 text-secondary text-sm">Upload resumes to trigger the Resume Intake and ATS Scoring agents</p>
      </motion.header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ResumeUploadCard onUploaded={fetchCandidates} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <div className="flex items-center gap-3 text-secondary py-8">
              <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              Loading candidates…
            </div>
          ) : candidates.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users size={40} className="mx-auto mb-4 text-muted" />
              <p className="text-secondary">No candidates yet. Upload a resume to get started.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                </p>
              </div>
              {candidates.map((c, i) => (
                <CandidateCard key={c._id} candidate={c} index={i} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
