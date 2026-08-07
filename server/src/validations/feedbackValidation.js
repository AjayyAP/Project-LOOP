import { body, param, query, validationResult } from 'express-validator';

const workspaceId = param('workspaceId').isMongoId().withMessage('A valid workspace id is required.');
const feedbackId = param('id').isMongoId().withMessage('A valid feedback id is required.');

export const createFeedbackValidation = [
  workspaceId,
  body('title').trim().notEmpty().withMessage('Title is required.').bail().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.').bail().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters.'),
  body('category').isIn(['Bug', 'Feature Request', 'Improvement', 'Other']).withMessage('Select a valid category.'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Select a valid priority.'),
  body('assignedTo').optional({ values: 'falsy' }).isMongoId().withMessage('A valid assignee id is required.'),
  validateRequest,
];

export const workspaceFeedbackParamValidation = [workspaceId, validateRequest];
export const workspaceFeedbackListValidation = [
  workspaceId,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50.').toInt(),
  query('status').optional().isIn(['NEW', 'REVIEWED', 'ACTIONED']).withMessage('Select a valid status.'),
  query('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Select a valid priority.'),
  query('category').optional().isIn(['Bug', 'Feature Request', 'Improvement', 'Other']).withMessage('Select a valid category.'),
  query('channel').optional().isIn(['Email', 'Website', 'Play Store', 'App Store', 'Slack', 'Twitter/X']).withMessage('Select a valid channel.'),
  query('sentiment').optional().isIn(['Positive', 'Neutral', 'Negative']).withMessage('Select a valid sentiment.'),
  query('sort').optional().isIn(['newest', 'oldest', 'priority']).withMessage('Select a valid sort option.'),
  query('dateRange').optional().isIn(['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range']).withMessage('Select a valid date range.'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid.'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid.'),
  (request, response, next) => {
    if (request.query.dateRange === 'Custom Range' && (!request.query.startDate || !request.query.endDate)) {
      return response.status(422).json({ success: false, message: 'Custom range requires both a start and end date.' });
    }
    if (request.query.startDate && request.query.endDate && new Date(request.query.startDate) > new Date(request.query.endDate)) {
      return response.status(422).json({ success: false, message: 'Start date cannot be after end date.' });
    }
    return next();
  },
  validateRequest,
];
export const feedbackIdParamValidation = [feedbackId, validateRequest];

export const updateFeedbackValidation = [
  feedbackId,
  body('title').trim().notEmpty().withMessage('Title is required.').bail().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.').bail().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters.'),
  body('category').isIn(['Bug', 'Feature Request', 'Improvement', 'Other']).withMessage('Select a valid category.'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Select a valid priority.'),
  validateRequest,
];

export const statusValidation = [
  feedbackId,
  body('status').isIn(['NEW', 'REVIEWED', 'ACTIONED']).withMessage('Select a valid status.'),
  validateRequest,
];

export const assignFeedbackValidation = [
  feedbackId,
  body('assignedTo').notEmpty().withMessage('Assigned user is required.').bail().isMongoId().withMessage('A valid assigned user id is required.'),
  validateRequest,
];

function validateRequest(request, response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
  }
  return next();
}
