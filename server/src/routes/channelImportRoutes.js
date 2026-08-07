import { Router } from 'express';
import { importSampleChannel } from '../controllers/channelImportController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireFeedbackWorkspaceMember } from '../middleware/feedbackAccess.js';
import { requireWorkspaceRole } from '../middleware/rbac.js';
import { sampleChannelImportValidation } from '../validations/channelImportValidation.js';

const router = Router();

router.post('/workspaces/:workspaceId/feedback/import-sample-channel', authenticate, sampleChannelImportValidation, requireFeedbackWorkspaceMember, requireWorkspaceRole('Admin', 'Analyst'), importSampleChannel);

export default router;
