import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNotificationStore } from '../../store/notificationStore';

export function OfferLetterPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [doj, setDoj] = useState('');
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    api.get('/jobs').then(async (jobsRes) => {
      const apps: any[] = [];
      for (const job of jobsRes.data.slice(0, 5)) {
        const res = await api.get(`/applications/job/${job._id}`).catch(() => ({ data: [] }));
        for (const app of res.data) apps.push({ ...app, jobTitle: job.title });
      }
      setApplications(apps);
    }).catch(() => {});
  }, []);

  async function generate() {
    if (!selectedAppId || !role || !salary || !doj) { toast.error('Fill all required fields'); return; }
    setLoading(true);
    try {
      const res = await api.post('/offers', { applicationId: selectedAppId, role, salary: parseFloat(salary), currency, dateOfJoining: doj });
      setOffer(res.data);
      addNotification({ title: 'Offer Letter Generated', message: `${role} offer letter ready for download`, type: 'success' });
      toast.success('Offer letter generated!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally { setLoading(false); }
  }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="p-8 space-y-6">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-3), var(--accent))' }}>
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">Offer Letter Generator</h1>
            <p className="text-secondary text-sm">AI generates professional offer letters with PDF export</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="font-display text-base font-semibold text-primary">Generate Offer</h2></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Select Application</label>
              <select value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                <option value="">Choose application…</option>
                {applications.map((a) => (
                  <option key={a._id} value={a._id}>{a.candidate?.name} — {a.jobTitle}</option>
                ))}
              </select>
            </div>
            {[['Role / Position', role, setRole, 'Senior Developer'],
              ['Salary', salary, setSalary, '1200000']].map(([label, val, setter, ph]: any) => (
              <div key={label}>
                <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">{label}</label>
                <input value={val} onChange={(e) => setter(e.target.value)} placeholder={ph}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle}>
                  <option>INR</option><option>USD</option><option>EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted mb-1.5">Joining Date</label>
                <input type="date" value={doj} onChange={(e) => setDoj(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={inputStyle} />
              </div>
            </div>
            <Button variant="gradient" className="w-full" disabled={loading} onClick={generate}>
              {loading ? <><Sparkles size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate Letter</>}
            </Button>
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          {!offer ? (
            <Card><CardBody className="py-20 text-center">
              <FileText size={40} className="mx-auto mb-4 text-muted" />
              <p className="text-secondary">Fill in the details to generate a professional AI offer letter with PDF export</p>
            </CardBody></Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-semibold text-primary">Offer Letter Preview</h2>
                      <p className="text-xs text-muted">Generated by AI Offer Letter Agent</p>
                    </div>
                    <div className="flex gap-2">
                      {offer.pdfFilePath && (
                        
                          href={`${import.meta.env.VITE_API_URL ?? ''}/uploads/${offer.pdfFilePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="gradient" size="sm"><Download size={13} /> Download PDF</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="rounded-xl p-6 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between text-xs text-muted mb-4">
                      <span className="font-mono">OFFER LETTER</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <pre className="text-sm text-primary whitespace-pre-wrap font-sans leading-relaxed">{offer.letterText}</pre>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[['Role', offer.role], ['Salary', `${offer.salary?.toLocaleString()} ${offer.currency}`], ['Joining', new Date(offer.dateOfJoining).toLocaleDateString()]].map(([label, value]) => (
                      <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-semibold text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
