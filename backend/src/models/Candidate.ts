import { Schema, model, Document, Types } from 'mongoose';

export interface IContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface IParsedResume {
  rawText: string;
  contact: IContactInfo;
  skills: string[];
  experienceYears?: number;
  education: string[];
  summary?: string;
}

export interface IAtsResult {
  score: number; // 0-100
  missingKeywords: string[];
  suggestions: string[];
  evaluatedAt: Date;
}

export interface ICandidate extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId; // linked account, optional (HR can upload on behalf of candidate)
  name: string;
  email: string;
  resumeFilePath: string;
  resumeFileName: string;
  parsed?: IParsedResume;
  atsResult?: IAtsResult;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    resumeFilePath: { type: String, required: true },
    resumeFileName: { type: String, required: true },
    parsed: {
      rawText: String,
      contact: {
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
      },
      skills: [String],
      experienceYears: Number,
      education: [String],
      summary: String,
    },
    atsResult: {
      score: Number,
      missingKeywords: [String],
      suggestions: [String],
      evaluatedAt: Date,
    },
  },
  { timestamps: true }
);

export const Candidate = model<ICandidate>('Candidate', candidateSchema);
