import fs from 'fs';
import path from 'path';
import { completeJson } from '../services/ai';
import { IParsedResume } from '../models/Candidate';

export async function extractRawText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.promises.readFile(filePath);

  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (ext === '.docx') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}. Only .pdf and .docx are supported.`);
}

interface StructuredResumeResponse {
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
  summary: string;
}

export async function parseResumeWithAi(rawText: string): Promise<StructuredResumeResponse> {
  return completeJson<StructuredResumeResponse>({
    system:
      'You are a precise resume parser. Extract structured data from raw resume text. ' +
      'Never invent information that is not present in the text. If a field is not found, omit it or use an empty array. ' +
      'Return JSON with exactly this shape: ' +
      '{"contact": {"email": string, "phone": string, "location": string, "linkedin": string, "github": string}, ' +
      '"skills": string[], "experienceYears": number, "education": string[], "summary": string}',
    user: `Resume text:\n\n${rawText.slice(0, 12000)}`,
    maxTokens: 4000,
  });
}

export async function runResumeIntake(filePath: string): Promise<IParsedResume> {
  const rawText = await extractRawText(filePath);

  if (!rawText || rawText.trim().length < 20) {
    throw new Error(
      'Could not extract meaningful text from resume. File may be scanned/image-based.'
    );
  }

  const structured = await parseResumeWithAi(rawText);

  return {
    rawText,
    contact: structured.contact ?? {},
    skills: structured.skills ?? [],
    experienceYears: structured.experienceYears,
    education: structured.education ?? [],
    summary: structured.summary,
  };
}