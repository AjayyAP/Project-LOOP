import { Router } from 'express';
import { importFeedbackCsv } from '../controllers/csvImportController.js';
import { assignFeedback, createFeedback, deleteFeedback, getFeedback, getWorkspaceFeedback, updateFeedback, updateFeedbackStatus } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadCsv } from '../middleware/csvUpload.js';
import { requireFeedbackAdmin, requireFeedbackEditor, requireFeedbackMember, requireFeedbackWorkspaceMember } from '../middleware/feedbackAccess.js';
import { requireWorkspaceRole } from '../middleware/rbac.js';
import { assignFeedbackValidation, createFeedbackValidation, feedbackIdParamValidation, statusValidation, updateFeedbackValidation, workspaceFeedbackListValidation, workspaceFeedbackParamValidation } from '../validations/feedbackValidation.js';

const router = Router();

router.post('/workspaces/:workspaceId/feedback', authenticate, createFeedbackValidation, requireFeedbackWorkspaceMember, requireWorkspaceRole('Admin', 'Analyst'), createFeedback);
router.get('/workspaces/:workspaceId/feedback', authenticate, workspaceFeedbackListValidation, requireFeedbackWorkspaceMember, getWorkspaceFeedback);
router.post('/workspaces/:workspaceId/feedback/import', authenticate, workspaceFeedbackParamValidation, requireFeedbackWorkspaceMember, requireWorkspaceRole('Admin', 'Analyst'), uploadCsv, importFeedbackCsv);
router.get('/feedback/:id', authenticate, feedbackIdParamValidation, requireFeedbackMember, getFeedback);
router.put('/feedback/:id', authenticate, updateFeedbackValidation, requireFeedbackMember, requireFeedbackEditor, updateFeedback);
router.delete('/feedback/:id', authenticate, feedbackIdParamValidation, requireFeedbackMember, requireWorkspaceRole('Admin'), deleteFeedback);
router.patch('/feedback/:id/status', authenticate, statusValidation, requireFeedbackMember, requireFeedbackEditor, updateFeedbackStatus);
router.patch('/feedback/:id/assign', authenticate, assignFeedbackValidation, requireFeedbackMember, requireFeedbackAdmin, assignFeedback);

export default router;
