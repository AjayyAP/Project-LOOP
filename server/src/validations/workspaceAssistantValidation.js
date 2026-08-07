import { body, param, validationResult } from 'express-validator';

export const askWorkspaceValidation = [
  param('workspaceId').isMongoId().withMessage('A valid workspace id is required.'),
  body('question').trim().notEmpty().withMessage('A question is required.').bail().isLength({ min: 3, max: 1000 }).withMessage('Question must be between 3 and 1000 characters.'),
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }
    return next();
  },
];
