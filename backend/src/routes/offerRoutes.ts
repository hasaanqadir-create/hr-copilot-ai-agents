import { Router } from 'express';
import { createOffer, sendOffer, getOffer } from '../controllers/offerController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('admin', 'hr'), createOffer);
router.patch('/:id/send', authenticate, authorize('admin', 'hr'), sendOffer);
router.get('/:id', authenticate, getOffer);

export default router;
