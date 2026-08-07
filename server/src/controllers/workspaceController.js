import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

function serializeWorkspace(workspace, role, memberCount) {
  return {
    id: workspace._id,
    name: workspace.name,
    description: workspace.description,
    owner: workspace.owner,
    role,
    memberCount,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

export async function createWorkspace(request, response, next) {
  try {
    const workspace = await Workspace.create({
      name: request.body.name,
      description: request.body.description || '',
      owner: request.user._id,
    });

    try {
      await WorkspaceMember.create({ workspace: workspace._id, user: request.user._id, role: 'Admin' });
    } catch (error) {
      await Workspace.findByIdAndDelete(workspace._id);
      throw error;
    }

    return response.status(201).json({
      success: true,
      message: 'Workspace created successfully.',
      data: { workspace: serializeWorkspace(workspace, 'Admin', 1) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkspaces(request, response, next) {
  try {
    const memberships = await WorkspaceMember.find({ user: request.user._id }).populate('workspace').sort({ createdAt: -1 }).lean();
    const workspaceIds = memberships.filter((membership) => membership.workspace).map((membership) => membership.workspace._id);
    const counts = await WorkspaceMember.aggregate([
      { $match: { workspace: { $in: workspaceIds } } },
      { $group: { _id: '$workspace', count: { $sum: 1 } } },
    ]);
    const memberCounts = new Map(counts.map((item) => [item._id.toString(), item.count]));
    const workspaces = memberships
      .filter((membership) => membership.workspace)
      .map((membership) => serializeWorkspace(membership.workspace, membership.role, memberCounts.get(membership.workspace._id.toString()) || 0));

    return response.status(200).json({ success: true, data: { workspaces } });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkspace(request, response, next) {
  try {
    const memberCount = await WorkspaceMember.countDocuments({ workspace: request.workspace._id });
    return response.status(200).json({
      success: true,
      data: { workspace: serializeWorkspace(request.workspace, request.workspaceMembership.role, memberCount) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkspaceMembers(request, response, next) {
  try {
    const members = await WorkspaceMember.find({ workspace: request.workspace._id })
      .populate('user', 'fullName email')
      .sort({ role: 1, createdAt: 1 })
      .lean();
    const safeMembers = members.filter((member) => member.user).map((member) => ({
      id: member._id,
      role: member.role,
      user: { id: member.user._id, fullName: member.user.fullName, email: member.user.email },
      createdAt: member.createdAt,
    }));

    return response.status(200).json({ success: true, data: { members: safeMembers } });
  } catch (error) {
    return next(error);
  }
}

export async function addWorkspaceMember(request, response, next) {
  try {
    const { email, role = 'Analyst' } = request.body;
    const user = await User.findOne({ email }).select('_id');

    if (!user) {
      return response.status(404).json({ success: false, message: 'No registered user was found for this email.' });
    }

    const existingMember = await WorkspaceMember.exists({ workspace: request.workspace._id, user: user._id });
    if (existingMember) {
      return response.status(409).json({ success: false, message: 'This user is already a workspace member.' });
    }

    const member = await WorkspaceMember.create({ workspace: request.workspace._id, user: user._id, role });
    const populatedMember = await member.populate('user', 'fullName email');
    return response.status(201).json({
      success: true,
      message: 'Workspace member added successfully.',
      data: { member: { id: populatedMember._id, role: populatedMember.role, user: { id: populatedMember.user._id, fullName: populatedMember.user.fullName, email: populatedMember.user.email } } },
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ success: false, message: 'This user is already a workspace member.' });
    }

    return next(error);
  }
}

export async function updateWorkspaceMemberRole(request, response, next) {
  try {
    const member = await WorkspaceMember.findOne({ _id: request.params.memberId, workspace: request.workspace._id });
    if (!member) {
      return response.status(404).json({ success: false, message: 'Workspace member not found.' });
    }

    if (member.role === 'Admin' && request.body.role !== 'Admin') {
      const adminCount = await WorkspaceMember.countDocuments({ workspace: request.workspace._id, role: 'Admin' });
      if (adminCount <= 1) {
        return response.status(422).json({ success: false, message: 'A workspace must have at least one Admin.' });
      }
    }

    member.role = request.body.role;
    await member.save();
    return response.status(200).json({ success: true, message: 'Member role updated successfully.', data: { member: { id: member._id, role: member.role } } });
  } catch (error) {
    return next(error);
  }
}
