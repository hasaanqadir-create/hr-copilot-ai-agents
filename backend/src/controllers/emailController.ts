import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { AppError } from '../middleware/errorHandler';
import { generateEmailContent, deliverEmail, EmailKind } from '../agents/emailAgent';

export async function sendStageEmail(req: Request, res: Response): Promise<void> {
  const { applicationId, kind, extraContext } = req.body as {
    applicationId?: string;
    kind?: EmailKind;
    extraContext?: string;
  };

  if (!applicationId || !kind) throw new AppError(400, 'applicationId and kind are required');

  const application = await Application.findById(applicationId);
  if (!application) throw new AppError(404, 'Application not found');

  const [candidate, job] = await Promise.all([
    Candidate.findById(application.candidate),
    Job.findById(application.job),
  ]);
  if (!candidate || !job) throw new AppError(404, 'Candidate or job not found');

  const { subject, body } = await generateEmailContent({
    kind,
    candidateName: candidate.name,
    role: job.title,
    company: job.company,
    extraContext,
  });

  const result = await deliverEmail(candidate.email, subject, body);

  res.json({ subject, body, ...result });
}
