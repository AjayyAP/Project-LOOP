import { Router } from 'express';
import { askWorkspace } from '../controllers/workspaceAssistantController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireWorkspaceAssistantMember } from '../middleware/workspaceAssistantAccess.js';
import { askWorkspaceValidation } from '../validations/workspaceAssistantValidation.js';

const router = Router();

router.post('/workspaces/:workspaceId/ai/ask', authenticate, askWorkspaceValidation, requireWorkspaceAssistantMember, askWorkspace);

export default router;
