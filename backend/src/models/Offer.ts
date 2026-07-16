import { Schema, model, Document, Types } from 'mongoose';

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'rescinded';

export interface IOffer extends Document {
  _id: Types.ObjectId;
  application: Types.ObjectId;
  role: string;
  salary: number;
  currency: string;
  dateOfJoining: Date;
  letterText: string;
  pdfFilePath?: string;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    role: { type: String, required: true },
    salary: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    dateOfJoining: { type: Date, required: true },
    letterText: { type: String, required: true },
    pdfFilePath: String,
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'declined', 'rescinded'], default: 'draft' },
  },
  { timestamps: true }
);

export const Offer = model<IOffer>('Offer', offerSchema);
