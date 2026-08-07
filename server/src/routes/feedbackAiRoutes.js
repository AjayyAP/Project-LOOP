import { Router } from 'express';
import { reclassifyFeedback } from '../controllers/feedbackAiController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireFeedbackEditor, requireFeedbackMember } from '../middleware/feedbackAccess.js';
import { feedbackIdParamValidation } from '../validations/feedbackValidation.js';

const router = Router();

router.post(
  '/feedback/:id/reclassify-ai',
  authenticate,
  feedbackIdParamValidation,
  requireFeedbackMember,
  requireFeedbackEditor,
  reclassifyFeedback,
);

export default router;
