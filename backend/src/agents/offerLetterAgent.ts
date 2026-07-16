import { completeJson } from '../services/ai';
import { getStorageProvider } from '../services/storage';
import { IParsedResume } from '../models/Candidate';
import { IJob } from '../models/Job';

/**
 * Offer Letter Agent
 *
 * Generates formal offer letter text via AI (role, salary, DOJ, company
 * name plugged into a professional template) then renders it to a PDF
 * using pdf-lib (pure JS, no native deps — works the same on any host).
 */

interface OfferLetterParams {
  candidateName: string;
  role: string;
  company: string;
  salary: number;
  currency: string;
  dateOfJoining: Date;
}

export async function generateOfferLetterText(params: OfferLetterParams): Promise<string> {
  const response = await completeJson<{ letterText: string }>({
    system:
      'You write formal, professional job offer letters. Use a standard business letter structure: ' +
      'greeting, offer statement, role, compensation, start date, brief next steps, warm closing. ' +
      'Do not invent any details not provided. Keep it under 350 words. ' +
      'Return JSON: {"letterText": string}',
    user: `Candidate: ${params.candidateName}
Role: ${params.role}
Company: ${params.company}
Salary: ${params.salary} ${params.currency} per annum
Date of joining: ${params.dateOfJoining.toDateString()}`,
    maxTokens: 700,
  });

  return response.letterText;
}

export async function renderOfferLetterPdf(letterText: string, candidateName: string): Promise<string> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]); // US Letter
  const margin = 60;
  const maxWidth = 612 - margin * 2;
  const fontSize = 11;
  const lineHeight = 16;

  let y = 792 - margin;

  page.drawText('Offer Letter', { x: margin, y, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  y -= 30;

  // Simple word-wrap since pdf-lib has no built-in text wrapping.
  const words = letterText.split(/\s+/);
  let line = '';
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth) {
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
      line = word;
      if (y < margin) break; // simple guard; a multi-page offer letter is unlikely given the 350-word limit
    } else {
      line = testLine;
    }
  }
  if (line && y >= margin) {
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
  }

  const pdfBytes = await pdfDoc.save();

  const storage = getStorageProvider();
  const safeName = candidateName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const stored = await storage.save(Buffer.from(pdfBytes), `offer_${safeName}.pdf`);

  return stored.path;
}
