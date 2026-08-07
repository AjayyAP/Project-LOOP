import { Router } from 'express';
import { getThemeTrends } from '../controllers/aiInsightsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAiInsightsWorkspaceMember } from '../middleware/aiInsightsAccess.js';
import { themeTrendsValidation } from '../validations/aiInsightsValidation.js';

const router = Router();

router.get('/workspaces/:workspaceId/ai/theme-trends', authenticate, themeTrendsValidation, requireAiInsightsWorkspaceMember, getThemeTrends);

export default router;
