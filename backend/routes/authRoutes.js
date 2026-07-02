import express from 'express';
import { login, profile } from '../controllers/authController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/profile', verifyAdmin, profile);

export default router;
