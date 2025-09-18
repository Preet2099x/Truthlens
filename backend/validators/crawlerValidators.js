import { body } from 'express-validator';

export const validateURL = [
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ 
      protocols: ['http', 'https'],
      require_protocol: true 
    })
    .withMessage('Must be a valid HTTP or HTTPS URL')
    .isLength({ max: 2048 })
    .withMessage('URL is too long')
    .custom((value) => {
      // Additional URL validation
      try {
        const url = new URL(value);
        
        // Block localhost and private IPs
        const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
        if (blockedHosts.some(host => url.hostname.includes(host))) {
          throw new Error('Local URLs are not allowed');
        }
        
        // Block private network ranges
        if (url.hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[01])\./)) {
          throw new Error('Private network URLs are not allowed');
        }
        
        return true;
      } catch (error) {
        throw new Error('Invalid URL format');
      }
    })
];