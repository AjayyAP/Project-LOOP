import { body, param, validationResult } from 'express-validator';

const channels = ['Email', 'Website', 'Play Store', 'App Store', 'Slack', 'Twitter/X'];

export const sampleChannelImportValidation = [
  param('workspaceId').isMongoId().withMessage('A valid workspace id is required.'),
  body('channel').isIn(channels).withMessage('Select a valid sample channel.'),
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }
    return next();
  },
];
