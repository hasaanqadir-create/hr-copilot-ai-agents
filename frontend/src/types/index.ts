export type UserRole = 'admin' | 'hr' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}

export interface ParsedResume {
  rawText: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  skills: string[];
  experienceYears?: number;
  education: string[];
  summary?: string;
}

export interface AtsResult {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
  evaluatedAt: string;
}

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  resumeFileName: string;
  parsed?: ParsedResume;
  atsResult?: AtsResult;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceRequired?: number;
  company: string;
  isActive: boolean;
  createdAt: string;
}

export type ApplicationStage =
  | 'submitted'
  | 'ats_scored'
  | 'matched'
  | 'ranked'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_sent'
  | 'hired'
  | 'rejected';

export interface MatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  bestFitNotes: string;
}

export interface Application {
  _id: string;
  candidate: Candidate;
  job: Job;
  stage: ApplicationStage;
  matchResult?: MatchResult;
  rankScore?: number;
  stageHistory: { stage: ApplicationStage; at: string; note?: string }[];
  createdAt: string;
}

export interface InterviewQuestion {
  category: 'technical' | 'hr' | 'behavioral';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Interview {
  _id: string;
  application: string | Application;
  questions: InterviewQuestion[];
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduledAt?: string;
  timeZone?: string;
}

export interface DashboardMetrics {
  totalApplicants: number;
  byStage: Record<string, number>;
  selected: number;
  rejected: number;
  averageAtsScore: number;
  averageMatchPercentage: number;
}
