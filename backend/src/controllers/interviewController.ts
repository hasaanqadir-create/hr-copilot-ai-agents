import { Request, Response } from 'express';
import { Interview } from '../models/Interview';
import { Application } from '../models/Application';
import { AppError } from '../middleware/errorHandler';
import { runPipeline, createInitialContext } from '../agents/orchestrator';
import { interviewStep } from '../agents/managerAgent';

export async function generateInterview(req: Request, res: Response): Promise<void> {
  const application = await Application.findById(req.params.applicationId);
  if (!application) throw new AppError(404, 'Application not found');

  const { difficulty } = req.body as { difficulty?: 'easy' | 'medium' | 'hard' };

  const ctx = createInitialContext({
    applicationId: application._id.toString(),
    candidateId: application.candidate.toString(),
    jobId: application.job.toString(),
    startStage: 'interview_generation',
  });
  ctx.data.difficulty = difficulty ?? 'medium';

  const result = await runPipeline([interviewStep], ctx);

  if (result.errors.length > 0) {
    throw new AppError(500, result.errors[result.errors.length - 1].message);
  }

  const interview = await Interview.findById(result.data.interviewId);
  res.status(201).json(interview);
}

export async function scheduleInterview(req: Request, res: Response): Promise<void> {
  const { scheduledAt, timeZone } = req.body as { scheduledAt?: string; timeZone?: string };
  if (!scheduledAt) throw new AppError(400, 'scheduledAt is required (ISO date string)');

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError(404, 'Interview not found');

  // NOTE: Google Calendar API integration is a planned enhancement (see README
  // "Roadmap"). For now this records the scheduled time directly; calendarEventId
  // stays unset until that integration is added.
  interview.scheduledAt = new Date(scheduledAt);
  interview.timeZone = timeZone;
  interview.status = 'scheduled';
  await interview.save();

  await Application.findByIdAndUpdate(interview.application, {
    stage: 'interview_scheduled',
    $push: { stageHistory: { stage: 'interview_scheduled', at: new Date() } },
  });

  res.json(interview);
}

export async function getInterview(req: Request, res: Response): Promise<void> {
  const interview = await Interview.findById(req.params.id).populate('application');
  if (!interview) throw new AppError(404, 'Interview not found');
  res.json(interview);
}

export async function completeInterview(req: Request, res: Response): Promise<void> {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError(404, 'Interview not found');

  interview.status = 'completed';
  await interview.save();

  await Application.findByIdAndUpdate(interview.application, {
    stage: 'interviewed',
    $push: { stageHistory: { stage: 'interviewed', at: new Date() } },
  });

  res.json(interview);
}
