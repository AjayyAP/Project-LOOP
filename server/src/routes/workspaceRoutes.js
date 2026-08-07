import { Router } from 'express';
import { addWorkspaceMember, createWorkspace, getWorkspace, getWorkspaceMembers, getWorkspaces, updateWorkspaceMemberRole } from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireWorkspaceMember } from '../middleware/workspaceAccess.js';
import { requireUserRole, requireWorkspaceRole } from '../middleware/rbac.js';
import { addMemberValidation, createWorkspaceValidation, updateMemberRoleValidation, workspaceIdParamValidation } from '../validations/workspaceValidation.js';

const router = Router();

router.use(authenticate);
router.post('/', requireUserRole('Admin'), createWorkspaceValidation, createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', workspaceIdParamValidation, requireWorkspaceMember, getWorkspace);
router.get('/:id/members', workspaceIdParamValidation, requireWorkspaceMember, getWorkspaceMembers);
router.post('/:id/members', addMemberValidation, requireWorkspaceMember, requireWorkspaceRole('Admin'), addWorkspaceMember);
router.patch('/:id/members/:memberId/role', updateMemberRoleValidation, requireWorkspaceMember, requireWorkspaceRole('Admin'), updateWorkspaceMemberRole);

export default router;
