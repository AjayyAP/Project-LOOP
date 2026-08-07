import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').bail().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters.'),
  body('email').trim().notEmpty().withMessage('Email is required.').bail().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.').bail().isLength({ min: 8 }).withMessage('Password must contain at least 8 characters.'),
  validateRequest,
];

export const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required.').bail().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  validateRequest,
];

function validateRequest(request, response, next) {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
  }

  return next();
}
