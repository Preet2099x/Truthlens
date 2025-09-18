import express from 'express';
import { crawlAndVerify } from '../controllers/crawlerController.js';
import { validateURL } from '../validators/crawlerValidators.js';
import { runValidation } from '../middleware/validate.js';

const router = express.Router();

// URL crawler route - scrape URL content and verify it
router.post(
  '/',
  validateURL,
  runValidation,
  crawlAndVerify
);

export default router;