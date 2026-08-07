import { Router } from 'express';
import { getWorkspaceDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireDashboardWorkspaceMember } from '../middleware/dashboardAccess.js';
import { workspaceDashboardValidation } from '../validations/dashboardValidation.js';

const router = Router();

router.get('/workspaces/:workspaceId/dashboard', authenticate, workspaceDashboardValidation, requireDashboardWorkspaceMember, getWorkspaceDashboard);

export default router;
