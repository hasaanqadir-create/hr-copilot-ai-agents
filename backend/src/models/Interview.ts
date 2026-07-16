import { Schema, model, Document, Types } from 'mongoose';

export type InterviewDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionCategory = 'technical' | 'hr' | 'behavioral';

export interface IInterviewQuestion {
  category: QuestionCategory;
  question: string;
  difficulty: InterviewDifficulty;
}

export type InterviewStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface IInterview extends Document {
  _id: Types.ObjectId;
  application: Types.ObjectId;
  questions: IInterviewQuestion[];
  status: InterviewStatus;
  scheduledAt?: Date;
  timeZone?: string;
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    questions: [
      {
        category: { type: String, enum: ['technical', 'hr', 'behavioral'], required: true },
        question: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
      },
    ],
    status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled'], default: 'pending' },
    scheduledAt: Date,
    timeZone: String,
    calendarEventId: String,
  },
  { timestamps: true }
);

export const Interview = model<IInterview>('Interview', interviewSchema);
