import { createWorker } from 'tesseract.js';
import { handleFactCheck } from './factCheckController.js';

export const performOCR = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Initialize Tesseract worker
    const worker = await createWorker();
    
    try {
      // Perform OCR on the uploaded image
      const { data: { text } } = await worker.recognize(req.file.buffer);
      
      // Clean up extracted text (remove extra whitespace)
      const cleanedText = text.trim().replace(/\s+/g, ' ');
      
      if (!cleanedText) {
        return res.status(400).json({ 
          error: 'No text could be extracted from the image' 
        });
      }

      // Create a mock request object for the fact check controller
      const mockReq = {
        body: { claim: cleanedText }
      };

      // Create a mock response object to capture the fact check result
      let factCheckResult;
      const mockRes = {
        status: (statusCode) => ({
          json: (data) => {
            factCheckResult = { statusCode, data };
          }
        }),
        json: (data) => {
          factCheckResult = { statusCode: 200, data };
        }
      };

      // Call the fact check controller
      await handleFactCheck(mockReq, mockRes);

      // Return the combined result
      res.json({
        extractedText: cleanedText,
        factCheck: factCheckResult.data
      });

    } finally {
      // Clean up the worker
      await worker.terminate();
    }

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process image', 
      details: error.message 
    });
  }
};