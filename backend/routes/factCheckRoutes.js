// routes/factCheckRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleFactCheck } from '../controllers/factCheckController.js';

const router = express.Router();
const checkLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
});

router.post('/', checkLimiter, handleFactCheck);

export default router;