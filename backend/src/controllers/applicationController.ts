import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { applyToJobSchema } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';
import { runPipeline, createInitialContext } from '../agents/orchestrator';
import { managerAgentSteps } from '../agents/managerAgent';

/**
 * Creates an Application linking a candidate to a job, then runs the full
 * manager-agent pipeline: intake -> ats_scoring -> job_matching -> ranking.
 * This is the main "apply" flow and the clearest end-to-end demo of the
 * multi-agent system.
 */
export async function applyToJob(req: Request, res: Response): Promise<void> {
  const input = applyToJobSchema.parse(req.body);

  const [candidate, job] = await Promise.all([
    Candidate.findById(input.candidateId),
    Job.findById(input.jobId),
  ]);
  if (!candidate) throw new AppError(404, 'Candidate not found');
  if (!job) throw new AppError(404, 'Job not found');

  const existing = await Application.findOne({ candidate: candidate._id, job: job._id });
  if (existing) throw new AppError(409, 'Candidate has already applied to this job');

  const application = await Application.create({
    candidate: candidate._id,
    job: job._id,
    stage: 'submitted',
    stageHistory: [{ stage: 'submitted', at: new Date() }],
  });

  const ctx = createInitialContext({
    applicationId: application._id.toString(),
    candidateId: candidate._id.toString(),
    jobId: job._id.toString(),
  });

  const result = await runPipeline(managerAgentSteps, ctx);

  const updatedApplication = await Application.findById(application._id).populate('candidate').populate('job');

  res.status(201).json({
    application: updatedApplication,
    pipelineErrors: result.errors,
  });
}

export async function listApplicationsForJob(req: Request, res: Response): Promise<void> {
  const applications = await Application.find({ job: req.params.jobId })
    .populate('candidate')
    .sort({ rankScore: -1 });
  res.json(applications);
}

export async function getApplication(req: Request, res: Response): Promise<void> {
  const application = await Application.findById(req.params.id).populate('candidate').populate('job');
  if (!application) throw new AppError(404, 'Application not found');
  res.json(application);
}
