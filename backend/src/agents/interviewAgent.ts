import { completeJson } from '../services/ai';
import { IParsedResume } from '../models/Candidate';
import { IJob } from '../models/Job';
import { IInterviewQuestion, InterviewDifficulty } from '../models/Interview';

/**
 * AI Interview Agent
 *
 * Generates a mixed set of technical, HR, and behavioral questions tailored
 * to the candidate's actual resume content and the target job, at a
 * requested difficulty level. Questions reference the candidate's real
 * skills/projects rather than being generic, which is what makes this
 * useful versus a static question bank.
 */

interface InterviewAiResponse {
  questions: IInterviewQuestion[];
}

export async function runInterviewGeneration(
  parsed: IParsedResume,
  job: IJob,
  difficulty: InterviewDifficulty = 'medium',
  countPerCategory = 3
): Promise<IInterviewQuestion[]> {
  const response = await completeJson<InterviewAiResponse>({
    system:
      'You are an expert technical interviewer. Generate interview questions tailored to a specific ' +
      'candidate resume and job. Reference the candidate\'s actual listed skills/experience where possible ' +
      'instead of generic questions. Mix categories as requested. ' +
      `Difficulty should be "${difficulty}" overall. ` +
      'Return JSON: {"questions": [{"category": "technical"|"hr"|"behavioral", "question": string, "difficulty": "easy"|"medium"|"hard"}]} ' +
      `with exactly ${countPerCategory} questions per category (technical, hr, behavioral).`,
    user: `JOB: ${job.title} at ${job.company}
Required skills: ${job.requiredSkills.join(', ') || 'none specified'}

CANDIDATE:
Skills: ${parsed.skills.join(', ') || 'none listed'}
Experience: ${parsed.experienceYears ?? 'unknown'} years
Education: ${parsed.education.join('; ') || 'none listed'}
Summary: ${parsed.summary ?? 'none'}`,
    maxTokens: 1500,
  });

  return response.questions ?? [];
}
