import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin', 'hr'), getDashboardMetrics);

export default router;
