import { Router } from 'express';
import { sendStageEmail } from '../controllers/emailController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/send', authenticate, authorize('admin', 'hr'), sendStageEmail);

export default router;
