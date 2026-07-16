import { Request, Response } from 'express';
import { getHiringFunnelMetrics } from '../agents/analyticsAgent';

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
  const metrics = await getHiringFunnelMetrics(jobId);
  res.json(metrics);
}
