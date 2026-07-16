import { completeJson } from '../services/ai';

/**
 * Email Communication Agent
 *
 * Generates the TEXT for hiring-related emails (interview invite, rejection,
 * follow-up, offer, reminder). Actual sending via Resend or Gmail API is
 * intentionally left as a thin, swappable function (`deliverEmail`) so this
 * works in a demo/portfolio context without requiring real email credentials,
 * while still showing the full agent design.
 *
 * To wire up real sending: set RESEND_API_KEY in .env and replace the body
 * of deliverEmail() with a fetch call to https://api.resend.com/emails.
 */

export type EmailKind = 'interview_invite' | 'rejection' | 'follow_up' | 'offer' | 'reminder';

interface EmailContentParams {
  kind: EmailKind;
  candidateName: string;
  role: string;
  company: string;
  extraContext?: string; // e.g. interview date/time, offer salary, rejection reason
}

export async function generateEmailContent(
  params: EmailContentParams
): Promise<{ subject: string; body: string }> {
  const kindInstructions: Record<EmailKind, string> = {
    interview_invite: 'Invite the candidate to an interview. Warm, professional, include placeholder for date/time if not given.',
    rejection: 'Politely inform the candidate they were not selected. Be kind, brief, and encouraging without being insincere.',
    follow_up: 'Follow up on application status. Friendly, brief, no false promises.',
    offer: 'Inform the candidate a formal offer is attached/forthcoming. Congratulatory and clear on next steps.',
    reminder: 'Remind the candidate of an upcoming interview or deadline. Brief and clear.',
  };

  const response = await completeJson<{ subject: string; body: string }>({
    system:
      'You write professional HR emails. Keep them concise (under 150 words for the body), ' +
      'warm but businesslike, and free of generic filler. ' +
      `Email type: ${params.kind}. Instructions: ${kindInstructions[params.kind]} ` +
      'Return JSON: {"subject": string, "body": string}',
    user: `Candidate: ${params.candidateName}
Role: ${params.role}
Company: ${params.company}
${params.extraContext ? `Additional context: ${params.extraContext}` : ''}`,
    maxTokens: 500,
  });

  return response;
}

/**
 * Stub delivery function. Logs instead of sending so the project runs
 * end-to-end without external email credentials. Swap this implementation
 * for a real Resend/Gmail API call when ready.
 */
export async function deliverEmail(to: string, subject: string, body: string): Promise<{ delivered: boolean }> {
  console.log(`[email-agent] (stub) Would send email to ${to}\nSubject: ${subject}\n\n${body}\n`);
  return { delivered: false };
}
