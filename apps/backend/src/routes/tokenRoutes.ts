import { Router } from 'express';
import tokenController from '../controllers/tokenController';

const router = Router();

// Use all routes defined in the token controller
router.use('/', tokenController);

export default router; 