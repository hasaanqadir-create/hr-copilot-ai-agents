import { completeJson } from '../services/ai';
import { IParsedResume } from '../models/Candidate';
import { IJob } from '../models/Job';
import { IMatchResult } from '../models/Application';

interface MatchAiResponse {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  bestFitNotes: string;
}

/**
 * Job Matching Agent
 *
 * Compares a candidate's parsed resume against a specific job's requirements
 * and produces a match percentage, skill gap analysis, and a short note on
 * fit (e.g. "strong backend fit, weak on cloud infra experience").
 */
export async function runJobMatching(parsed: IParsedResume, job: IJob): Promise<IMatchResult> {
  const response = await completeJson<MatchAiResponse>({
    system:
      'You are a job-matching evaluator. Compare a candidate resume against a job description and ' +
      'required/nice-to-have skills. Be realistic, not generous — most candidates are NOT a 90%+ match. ' +
      'Return JSON: {"matchPercentage": number (0-100), "matchedSkills": string[], "missingSkills": string[], ' +
      '"bestFitNotes": string (1-2 sentences on overall fit and what role/level suits them best)}',
    user: `JOB: ${job.title} at ${job.company}
Required skills: ${job.requiredSkills.join(', ') || 'none specified'}
Nice-to-have skills: ${job.niceToHaveSkills.join(', ') || 'none specified'}
Experience required: ${job.experienceRequired ?? 'not specified'} years
Job description: ${job.description.slice(0, 3000)}

CANDIDATE:
Skills: ${parsed.skills.join(', ') || 'none listed'}
Experience: ${parsed.experienceYears ?? 'unknown'} years
Education: ${parsed.education.join('; ') || 'none listed'}
Summary: ${parsed.summary ?? 'none'}`,
    maxTokens: 1200,
  });

  return {
    matchPercentage: Math.max(0, Math.min(100, Math.round(response.matchPercentage))),
    matchedSkills: response.matchedSkills ?? [],
    missingSkills: response.missingSkills ?? [],
    bestFitNotes: response.bestFitNotes ?? '',
  };
}
