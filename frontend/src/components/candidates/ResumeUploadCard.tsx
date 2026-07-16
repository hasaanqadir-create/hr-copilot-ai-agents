import { FormEvent, useState } from 'react';
import { UploadCloud, FileText, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { api, apiErrorMessage } from '../../lib/api';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';

export function ResumeUploadCard({ onUploaded }: { onUploaded: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'uploading' | 'processing'>('idle');

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) { toast.error('Choose a resume file'); return; }
    setLoading(true);
    try {
      setStep('uploading');
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('name', name);
      formData.append('email', email);
      const uploadRes = await api.post('/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const candidateId = uploadRes.data.candidate.id;
      setStep('processing');
      await api.post(`/candidates/${candidateId}/process`);
      toast.success('✅ Resume processed by AI agents!');
      setName(''); setEmail(''); setFile(null); setStep('idle');
      onUploaded();
    } catch (err) {
      toast.error(apiErrorMessage(err));
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-primary">Upload Resume</h2>
            <p className="text-xs text-muted">Triggers Resume Intake + ATS Scoring agents</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="john@email.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Resume (PDF or DOCX)</label>
            <label htmlFor="resume-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-all hover:border-accent"
              style={{ borderColor: file ? 'var(--accent)' : 'var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {file ? (
                <>
                  <FileText size={24} style={{ color: 'var(--accent)' }} />
                  <p className="text-sm font-medium text-primary">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / 1024).toFixed(0)} KB</p>
                </>
              ) : (
                <>
                  <UploadCloud size={24} className="text-muted" />
                  <p className="text-sm text-muted">Click to choose file</p>
                  <p className="text-xs text-muted">PDF or DOCX, max 10MB</p>
                </>
              )}
            </label>
            <input id="resume-file" type="file" accept=".pdf,.docx" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="rounded-xl p-3 text-sm text-center" style={{ background: 'rgba(124,111,255,0.1)', color: 'var(--accent)' }}>
                <Loader2 size={14} className="inline animate-spin mr-2" />
                {step === 'uploading' ? 'Uploading resume…' : '🤖 AI agents processing…'}
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? 'Processing…' : '🚀 Upload & Run Agents'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
