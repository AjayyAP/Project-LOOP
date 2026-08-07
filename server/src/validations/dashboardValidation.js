import { param, query, validationResult } from 'express-validator';

export const workspaceDashboardValidation = [
  param('workspaceId').isMongoId().withMessage('A valid workspace id is required.'),
  query('channel').optional().isIn(['Manual', 'Email', 'Website', 'Play Store', 'App Store', 'Slack', 'Twitter/X']).withMessage('Select a valid channel.'),
  query('status').optional().isIn(['NEW', 'REVIEWED', 'ACTIONED']).withMessage('Select a valid status.'),
  query('theme').optional().trim().isLength({ min: 1, max: 80 }).withMessage('Select a valid theme.'),
  query('sentiment').optional().isIn(['Positive', 'Neutral', 'Negative']).withMessage('Select a valid sentiment.'),
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
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }
    return next();
  },
];
