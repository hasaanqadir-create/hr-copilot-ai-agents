import { Router } from 'express';
import { generateInterview, scheduleInterview, getInterview, completeInterview } from '../controllers/interviewController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/:applicationId/generate', authenticate, authorize('admin', 'hr'), generateInterview);
router.patch('/:id/schedule', authenticate, authorize('admin', 'hr'), scheduleInterview);
router.patch('/:id/complete', authenticate, authorize('admin', 'hr'), completeInterview);
router.get('/:id', authenticate, getInterview);

export default router;
