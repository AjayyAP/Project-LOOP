import { body, param, validationResult } from 'express-validator';

const workspaceIdValidation = param('id').isMongoId().withMessage('A valid workspace id is required.');

export const createWorkspaceValidation = [
  body('name').trim().notEmpty().withMessage('Workspace name is required.').bail().isLength({ min: 3, max: 50 }).withMessage('Workspace name must be between 3 and 50 characters.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
  validateRequest,
];

export const workspaceIdParamValidation = [workspaceIdValidation, validateRequest];

export const addMemberValidation = [
  workspaceIdValidation,
  body('email').trim().toLowerCase().notEmpty().withMessage('Email is required.').bail().isEmail().withMessage('Enter a valid registered user email.'),
  body('role').optional().isIn(['Admin', 'Analyst', 'Viewer']).withMessage('Role must be Admin, Analyst, or Viewer.'),
  validateRequest,
];

export const updateMemberRoleValidation = [
  workspaceIdValidation,
  param('memberId').isMongoId().withMessage('A valid member id is required.'),
  body('role').isIn(['Admin', 'Analyst', 'Viewer']).withMessage('Role must be Admin, Analyst, or Viewer.'),
  validateRequest,
];

function validateRequest(request, response, next) {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
  }

  return next();
}
