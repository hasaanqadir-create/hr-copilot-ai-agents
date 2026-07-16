import { Schema, model, Document, Types } from 'mongoose';

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceRequired?: number;
  company: string;
  postedBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: [String],
    niceToHaveSkills: [String],
    experienceRequired: Number,
    company: { type: String, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Job = model<IJob>('Job', jobSchema);
