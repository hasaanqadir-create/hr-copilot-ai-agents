import { Router } from 'express';
import { createJob, listJobs, getJob } from '../controllers/jobController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('admin', 'hr'), createJob);
router.get('/', listJobs); // public listing, like a careers page
router.get('/:id', getJob);

export default router;
