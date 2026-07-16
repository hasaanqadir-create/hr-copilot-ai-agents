import { Schema, model, Document, Types } from 'mongoose';

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

export interface IMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  bestFitNotes: string;
}

export interface IApplication extends Document {
  _id: Types.ObjectId;
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  stage: ApplicationStage;
  matchResult?: IMatchResult;
  rankScore?: number; // composite score used for ranking against other applicants for same job
  rejectionReason?: string;
  stageHistory: { stage: ApplicationStage; at: Date; note?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    stage: {
      type: String,
      enum: [
        'submitted',
        'ats_scored',
        'matched',
        'ranked',
        'interview_scheduled',
        'interviewed',
        'offer_sent',
        'hired',
        'rejected',
      ],
      default: 'submitted',
    },
    matchResult: {
      matchPercentage: Number,
      matchedSkills: [String],
      missingSkills: [String],
      bestFitNotes: String,
    },
    rankScore: Number,
    rejectionReason: String,
    stageHistory: [
      {
        stage: { type: String, required: true },
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

export const Application = model<IApplication>('Application', applicationSchema);
