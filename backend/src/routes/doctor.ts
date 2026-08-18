import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorizeRoles';

const router = Router();

// All doctor profile endpoints require authenticating as a doctor
router.use(authenticate, authorizeRoles('doctor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
