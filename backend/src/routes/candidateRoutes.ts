import { Router } from 'express';
import { uploadResume, processCandidate, getCandidate, listCandidates } from '../controllers/candidateController';
import { authenticate, authorize } from '../middleware/auth';
import { resumeUpload } from '../middleware/upload';

const router = Router();

// Resume upload is open to authenticated users (candidates uploading their own, or HR uploading on behalf of someone).
router.post('/', authenticate, resumeUpload.single('resume'), uploadResume);
router.post('/:id/process', authenticate, processCandidate);
router.get('/:id', authenticate, getCandidate);
router.get('/', authenticate, authorize('admin', 'hr'), listCandidates);

export default router;
