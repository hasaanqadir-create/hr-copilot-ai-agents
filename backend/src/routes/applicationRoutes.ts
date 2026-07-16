import { Router } from 'express';
import { applyToJob, listApplicationsForJob, getApplication } from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, applyToJob);
router.get('/job/:jobId', authenticate, authorize('admin', 'hr'), listApplicationsForJob);
router.get('/:id', authenticate, getApplication);

export default router;
