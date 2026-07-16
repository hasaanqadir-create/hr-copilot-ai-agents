import { Application } from '../models/Application';
import { Candidate } from '../models/Candidate';

/**
 * Analytics Agent
 *
 * Pure data-aggregation agent (no AI calls needed) that powers the HR
 * dashboard: total applicants, hiring funnel breakdown by stage, average
 * ATS score, and rejection counts. Kept separate from the manager pipeline
 * since it's queried on-demand by the dashboard, not run per-candidate.
 */

export interface HiringFunnelMetrics {
  totalApplicants: number;
  byStage: Record<string, number>;
  selected: number;
  rejected: number;
  averageAtsScore: number;
  averageMatchPercentage: number;
}

export async function getHiringFunnelMetrics(jobId?: string): Promise<HiringFunnelMetrics> {
  const filter = jobId ? { job: jobId } : {};

  const applications = await Application.find(filter);
  const totalApplicants = applications.length;

  const byStage: Record<string, number> = {};
  for (const app of applications) {
    byStage[app.stage] = (byStage[app.stage] ?? 0) + 1;
  }

  const selected = byStage['hired'] ?? 0;
  const rejected = byStage['rejected'] ?? 0;

  const matchPercentages = applications
    .map((a) => a.matchResult?.matchPercentage)
    .filter((v): v is number => typeof v === 'number');
  const averageMatchPercentage = matchPercentages.length
    ? Math.round(matchPercentages.reduce((sum, v) => sum + v, 0) / matchPercentages.length)
    : 0;

  // ATS scores live on Candidate, not Application, so pull them separately.
  const candidateIds = applications.map((a) => a.candidate);
  const candidates = await Candidate.find({ _id: { $in: candidateIds } });
  const atsScores = candidates.map((c) => c.atsResult?.score).filter((v): v is number => typeof v === 'number');
  const averageAtsScore = atsScores.length
    ? Math.round(atsScores.reduce((sum, v) => sum + v, 0) / atsScores.length)
    : 0;

  return { totalApplicants, byStage, selected, rejected, averageAtsScore, averageMatchPercentage };
}
