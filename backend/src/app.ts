import 'express-async-errors'; // must be imported before routes so thrown errors in async handlers reach errorHandler
import express, { Application as ExpressApp } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import candidateRoutes from './routes/candidateRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import interviewRoutes from './routes/interviewRoutes';
import offerRoutes from './routes/offerRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import emailRoutes from './routes/emailRoutes';

export function createApp(): ExpressApp {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

  // Basic rate limiting to protect AI-backed endpoints from abuse/cost overrun.
  const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
  app.use('/api', apiLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/candidates', candidateRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/offers', offerRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/emails', emailRoutes);

  // Serves uploaded resumes and generated offer-letter PDFs. In production,
  // swap STORAGE_PROVIDER to cloudinary and this becomes unnecessary since
  // files are served from Cloudinary's CDN instead.
  app.use('/uploads', express.static(env.uploadDir));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
