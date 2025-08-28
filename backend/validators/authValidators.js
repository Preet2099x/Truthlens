// validators/authValidators.js
import { body } from 'express-validator';

export const signupValidator = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
];
