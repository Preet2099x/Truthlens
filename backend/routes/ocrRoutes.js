import express from 'express';
import multer from 'multer';
import { performOCR } from '../controllers/ocrController.js';
import { validateImageUpload } from '../validators/ocrValidators.js';
import { runValidation } from '../middleware/validate.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// OCR route - extract text from image and verify it
router.post(
  '/',
  upload.single('image'),
  validateImageUpload,
  runValidation,
  performOCR
);

export default router;