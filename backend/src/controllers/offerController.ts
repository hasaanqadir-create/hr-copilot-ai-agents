import { Request, Response } from 'express';
import { Offer } from '../models/Offer';
import { Application } from '../models/Application';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { AppError } from '../middleware/errorHandler';
import { generateOfferLetterText, renderOfferLetterPdf } from '../agents/offerLetterAgent';

export async function createOffer(req: Request, res: Response): Promise<void> {
  const { applicationId, role, salary, currency, dateOfJoining } = req.body as {
    applicationId?: string;
    role?: string;
    salary?: number;
    currency?: string;
    dateOfJoining?: string;
  };

  if (!applicationId || !role || !salary || !dateOfJoining) {
    throw new AppError(400, 'applicationId, role, salary, and dateOfJoining are required');
  }

  const application = await Application.findById(applicationId);
  if (!application) throw new AppError(404, 'Application not found');

  const [candidate, job] = await Promise.all([
    Candidate.findById(application.candidate),
    Job.findById(application.job),
  ]);
  if (!candidate || !job) throw new AppError(404, 'Candidate or job not found for this application');

  const letterText = await generateOfferLetterText({
    candidateName: candidate.name,
    role,
    company: job.company,
    salary,
    currency: currency ?? 'INR',
    dateOfJoining: new Date(dateOfJoining),
  });

  const pdfFilePath = await renderOfferLetterPdf(letterText, candidate.name);

  const offer = await Offer.create({
    application: applicationId,
    role,
    salary,
    currency: currency ?? 'INR',
    dateOfJoining: new Date(dateOfJoining),
    letterText,
    pdfFilePath,
    status: 'draft',
  });

  res.status(201).json(offer);
}

export async function sendOffer(req: Request, res: Response): Promise<void> {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new AppError(404, 'Offer not found');

  // NOTE: actual email delivery is handled by the Email Communication Agent
  // (see services/email — planned enhancement). This marks the offer as sent
  // in the data model so the pipeline/UI can reflect it immediately.
  offer.status = 'sent';
  await offer.save();

  await Application.findByIdAndUpdate(offer.application, {
    stage: 'offer_sent',
    $push: { stageHistory: { stage: 'offer_sent', at: new Date() } },
  });

  res.json(offer);
}

export async function getOffer(req: Request, res: Response): Promise<void> {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new AppError(404, 'Offer not found');
  res.json(offer);
}
