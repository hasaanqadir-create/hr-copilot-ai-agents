import { Request, Response } from 'express';
import { Job } from '../models/Job';
import { createJobSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

export async function createJob(req: Request, res: Response): Promise<void> {
  const input = createJobSchema.parse(req.body);

  const job = await Job.create({
    ...input,
    postedBy: req.auth!.userId,
  });

  res.status(201).json(job);
}

export async function listJobs(req: Request, res: Response): Promise<void> {
  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(jobs);
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError(404, 'Job not found');
  res.json(job);
}
