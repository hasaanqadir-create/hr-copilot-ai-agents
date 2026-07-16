import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { api, apiErrorMessage } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input, Label, Textarea } from '../ui/primitives';
import { Card, CardBody, CardHeader } from '../ui/Card';

export function CreateJobCard({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs', {
        title,
        company,
        description,
        requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Job posted');
      setTitle('');
      setCompany('');
      setDescription('');
      setSkills('');
      onCreated();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-ink">Post a Job</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="j-title">Title</Label>
            <Input id="j-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="j-company">Company</Label>
            <Input id="j-company" required value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="j-desc">Description</Label>
            <Textarea id="j-desc" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="j-skills">Required skills (comma separated)</Label>
            <Input id="j-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, MongoDB" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Posting…' : 'Post Job'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
