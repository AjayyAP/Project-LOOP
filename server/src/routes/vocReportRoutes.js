import { Router } from 'express';
import { createVocReport, getVocReport, getVocReports } from '../controllers/vocReportController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireVocReportWorkspaceMember } from '../middleware/vocReportAccess.js';
import { vocReportDetailValidation, vocReportHistoryValidation, vocReportValidation } from '../validations/vocReportValidation.js';

const router = Router();

router.post('/workspaces/:workspaceId/ai/report', authenticate, vocReportValidation, requireVocReportWorkspaceMember, createVocReport);
router.get('/workspaces/:workspaceId/ai/reports', authenticate, vocReportHistoryValidation, requireVocReportWorkspaceMember, getVocReports);
router.get('/workspaces/:workspaceId/ai/reports/:reportId', authenticate, vocReportDetailValidation, requireVocReportWorkspaceMember, getVocReport);

export default router;
