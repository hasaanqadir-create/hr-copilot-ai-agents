import { AgentStep, PipelineContext } from './orchestrator';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { getStorageProvider } from '../services/storage';
import { runResumeIntake } from './resumeIntakeAgent';
import { runAtsScoring } from './atsScoringAgent';
import { runJobMatching } from './jobMatchingAgent';
import { runInterviewGeneration } from './interviewAgent';

/**
 * Manager Agent pipeline definition.
 *
 * This wires the abstract orchestrator (orchestrator.ts) to concrete domain
 * agents and persists results to MongoDB after each step. Stages not yet
 * implemented (interview generation, scheduling, email, offer, analytics)
 * are stubbed to end the pipeline early — they'll be filled in during
 * Phase 3/4/5 of the build without touching this file's existing stages.
 */

const intakeStep: AgentStep = {
  stage: 'intake',
  name: 'Resume Intake Agent',
  run: async (ctx: PipelineContext) => {
    const candidate = await Candidate.findById(ctx.candidateId);
    if (!candidate) throw new Error(`Candidate ${ctx.candidateId} not found`);

    const storage = getStorageProvider();
    const fullPath = storage.resolve(candidate.resumeFilePath);

    const parsed = await runResumeIntake(fullPath);
    candidate.parsed = parsed;
    await candidate.save();

    return { data: { parsedResume: parsed } };
  },
};

const atsStep: AgentStep = {
  stage: 'ats_scoring',
  name: 'ATS Scoring Agent',
  run: async (ctx: PipelineContext) => {
    const candidate = await Candidate.findById(ctx.candidateId);
    if (!candidate?.parsed) throw new Error('Candidate has no parsed resume to score');

    const atsResult = await runAtsScoring(candidate.parsed);
    candidate.atsResult = atsResult;
    await candidate.save();

    if (ctx.applicationId !== 'standalone') {
      await Application.findByIdAndUpdate(ctx.applicationId, {
        stage: 'ats_scored',
        $push: { stageHistory: { stage: 'ats_scored', at: new Date() } },
      });
    }

    return { data: { atsResult } };
  },
};

const jobMatchingStep: AgentStep = {
  stage: 'job_matching',
  name: 'Job Matching Agent',
  run: async (ctx: PipelineContext) => {
    if (!ctx.jobId) {
      // No job attached to this pipeline run (e.g. candidate just checking ATS score) — skip to done.
      return { stage: 'done' };
    }

    const candidate = await Candidate.findById(ctx.candidateId);
    const job = await Job.findById(ctx.jobId);
    if (!candidate?.parsed) throw new Error('Candidate has no parsed resume to match');
    if (!job) throw new Error(`Job ${ctx.jobId} not found`);

    const matchResult = await runJobMatching(candidate.parsed, job);

    await Application.findByIdAndUpdate(ctx.applicationId, {
      stage: 'matched',
      matchResult,
      $push: { stageHistory: { stage: 'matched', at: new Date() } },
    });

    return { data: { matchResult } };
  },
  next: () => 'ranking',
};

const rankingStep: AgentStep = {
  stage: 'ranking',
  name: 'Candidate Ranking Agent',
  run: async (ctx: PipelineContext) => {
    const candidate = await Candidate.findById(ctx.candidateId);
    const application = await Application.findById(ctx.applicationId);
    if (!candidate?.atsResult || !application?.matchResult) {
      throw new Error('Missing ATS or match result needed for ranking');
    }

    // Composite score: weighted blend of ATS quality and job-fit percentage.
    // Weights are tunable; job match counts more since it's role-specific.
    const rankScore = Math.round(candidate.atsResult.score * 0.35 + application.matchResult.matchPercentage * 0.65);

    application.rankScore = rankScore;
    application.stage = 'ranked';
    application.stageHistory.push({ stage: 'ranked', at: new Date() });
    await application.save();

    return { data: { rankScore } };
  },
  // Automatic generation of interview questions for every ranked candidate is
  // often wasteful (most applicants won't be interviewed). In practice HR
  // triggers interview generation manually per-candidate via
  // POST /api/interviews/:applicationId/generate, so the automatic pipeline
  // stops here. See interviewGenerationStep below — it's registered but not
  // chained automatically; it's invoked directly by that route instead.
  next: () => 'done',
};

const interviewGenerationStep: AgentStep = {
  stage: 'interview_generation',
  name: 'AI Interview Agent',
  run: async (ctx: PipelineContext) => {
    const candidate = await Candidate.findById(ctx.candidateId);
    const job = ctx.jobId ? await Job.findById(ctx.jobId) : null;
    if (!candidate?.parsed) throw new Error('Candidate has no parsed resume');
    if (!job) throw new Error('Interview generation requires a job');

    const difficulty = (ctx.data.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium';
    const questions = await runInterviewGeneration(candidate.parsed, job, difficulty);

    const interview = await Interview.create({
      application: ctx.applicationId,
      questions,
      status: 'pending',
    });

    await Application.findByIdAndUpdate(ctx.applicationId, {
      stage: 'ranked', // stays 'ranked' until interview is actually scheduled via PATCH /api/interviews/:id/schedule
      $push: { stageHistory: { stage: 'ranked', at: new Date(), note: 'Interview questions generated' } },
    });

    return { data: { interviewId: interview._id.toString(), questions }, stage: 'done' };
  },
};

export const managerAgentSteps: AgentStep[] = [intakeStep, atsStep, jobMatchingStep, rankingStep];
export const interviewStep = interviewGenerationStep;
