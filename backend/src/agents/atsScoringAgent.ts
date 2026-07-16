import { completeJson } from '../services/ai';
import { IParsedResume, IAtsResult } from '../models/Candidate';

/**
 * ATS Scoring Agent
 *
 * Scores a parsed resume 0-100 against general Applicant Tracking System
 * heuristics (keyword density, quantified achievements, formatting clarity,
 * skills coverage) and returns concrete improvement suggestions.
 *
 * This is intentionally a "general" ATS score (no job description yet) so
 * candidates get baseline feedback immediately on upload. Job-specific
 * scoring happens later in the Job Matching Agent.
 */

interface AtsAiResponse {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}

export async function runAtsScoring(parsed: IParsedResume): Promise<IAtsResult> {
  const response = await completeJson<AtsAiResponse>({
    system:
      'You are an ATS (Applicant Tracking System) resume evaluator. Score resumes the way real ATS ' +
      'software and recruiters do: keyword/skill coverage for the stated field, quantified achievements ' +
      '(numbers, %, $), clear section structure, action verbs, and absence of generic filler. ' +
      'Be a strict, honest grader, not a flatterer. ' +
      'Return JSON: {"score": number (0-100), "missingKeywords": string[] (common keywords/skills this resume ' +
      'lacks for its apparent target field), "suggestions": string[] (3-6 specific, actionable improvements)}',
    user: `Candidate skills: ${parsed.skills.join(', ') || 'none listed'}
Experience: ${parsed.experienceYears ?? 'unknown'} years
Education: ${parsed.education.join('; ') || 'none listed'}
Summary: ${parsed.summary ?? 'none'}

Full resume text:
${parsed.rawText.slice(0, 8000)}`,
    maxTokens:2000,
  });

  const score = Math.max(0, Math.min(100, Math.round(response.score)));

  return {
    score,
    missingKeywords: response.missingKeywords ?? [],
    suggestions: response.suggestions ?? [],
    evaluatedAt: new Date(),
  };
}
