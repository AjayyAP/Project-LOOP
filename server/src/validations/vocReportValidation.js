import { body, param, validationResult } from 'express-validator';

const workspaceId = param('workspaceId').isMongoId().withMessage('A valid workspace id is required.');
const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
  return next();
};

export const vocReportValidation = [
  workspaceId,
  body('dateRange').optional().isIn(['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range']).withMessage('Select a valid date range.'),
  body('startDate').optional({ values: 'falsy' }).isISO8601().withMessage('Start date must be valid.'),
  body('endDate').optional({ values: 'falsy' }).isISO8601().withMessage('End date must be valid.'),
  (request, response, next) => {
    if (request.body.dateRange === 'Custom Range' && (!request.body.startDate || !request.body.endDate)) return response.status(422).json({ success: false, message: 'Custom range requires both a start and end date.' });
    if (request.body.startDate && request.body.endDate && new Date(request.body.startDate) > new Date(request.body.endDate)) return response.status(422).json({ success: false, message: 'Start date cannot be after end date.' });
    return next();
  },
  validate,
];

export const vocReportHistoryValidation = [workspaceId, validate];
export const vocReportDetailValidation = [workspaceId, param('reportId').isMongoId().withMessage('A valid report id is required.'), validate];
