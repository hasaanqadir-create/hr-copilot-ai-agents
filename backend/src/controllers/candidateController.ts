import { Request, Response } from 'express';
import { Candidate } from '../models/Candidate';
import { getStorageProvider } from '../services/storage';
import { AppError } from '../middleware/errorHandler';
import { runPipeline, createInitialContext } from '../agents/orchestrator';
import { managerAgentSteps } from '../agents/managerAgent';

export async function uploadResume(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(400, 'No resume file uploaded. Field name must be "resume".');
  }

  const { name, email } = req.body as { name?: string; email?: string };
  if (!name || !email) {
    throw new AppError(400, 'name and email are required');
  }

  const storage = getStorageProvider();
  const stored = await storage.save(req.file.buffer, req.file.originalname);

  const candidate = await Candidate.create({
    user: req.auth?.userId,
    name,
    email,
    resumeFilePath: stored.path,
    resumeFileName: stored.fileName,
  });

  res.status(201).json({
    candidate: {
      id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      resumeFileName: candidate.resumeFileName,
    },
    message: 'Resume uploaded. Call POST /api/candidates/:id/process to run the intake + ATS pipeline.',
  });
}

/**
 * Runs Resume Intake + ATS Scoring for a candidate, independent of any job.
 * For full job-matching + ranking against a specific job, use
 * POST /api/applications which creates a real Application and runs the
 * complete manager-agent pipeline.
 */
export async function processCandidate(req: Request, res: Response): Promise<void> {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) throw new AppError(404, 'Candidate not found');

  const ctx = createInitialContext({
    applicationId: 'standalone', // no Application document for job-less processing
    candidateId: candidate._id.toString(),
  });

  const standaloneSteps = managerAgentSteps.filter((s) => s.stage === 'intake' || s.stage === 'ats_scoring');
  const result = await runPipeline(
    standaloneSteps.map((s, i) => ({
      ...s,
      next: () => (i === standaloneSteps.length - 1 ? 'done' : standaloneSteps[i + 1].stage),
    })),
    ctx
  );

  const updated = await Candidate.findById(candidate._id);

  res.json({
    candidate: {
      id: updated!._id,
      parsed: updated!.parsed,
      atsResult: updated!.atsResult,
    },
    pipelineErrors: result.errors,
  });
}

export async function getCandidate(req: Request, res: Response): Promise<void> {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) throw new AppError(404, 'Candidate not found');
  res.json(candidate);
}

export async function listCandidates(req: Request, res: Response): Promise<void> {
  const candidates = await Candidate.find().sort({ createdAt: -1 }).limit(100);
  res.json(candidates);
}
