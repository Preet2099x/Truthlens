// routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, me } from '../controllers/authController.js';
import { signupValidator, loginValidator } from '../validators/authValidators.js';
import { runValidation } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many auth attempts, please try again later.' },
});

router.post('/signup', authLimiter, signupValidator, runValidation, signup);
router.post('/login', authLimiter, loginValidator, runValidation, login);
router.get('/me', requireAuth, me);

export default router;
