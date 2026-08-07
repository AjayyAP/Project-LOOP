import mongoose from 'mongoose';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { createAccessToken } from '../utils/token.js';

function defaultWorkspaceName(fullName) {
  return `${fullName.trim().slice(0, 38)}'s Workspace`;
}

function sendAuthenticationResponse(response, statusCode, user) {
  const token = createAccessToken(user._id.toString());

  return response.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? 'Registration successful.' : 'Login successful.',
    data: { token, user: user.toSafeObject() },
  });
}

export async function register(request, response, next) {
  try {
    const { fullName, email, password } = request.body;
    const existingUser = await User.exists({ email });

    if (existingUser) {
      return response.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    let user;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        [user] = await User.create([{ fullName, email, password }], { session });
        const [workspace] = await Workspace.create([{
          name: defaultWorkspaceName(fullName),
          owner: user._id,
        }], { session });
        await WorkspaceMember.create([{
          workspace: workspace._id,
          user: user._id,
          role: 'Admin',
        }], { session });
      });
    } finally {
      await session.endSession();
    }

    return sendAuthenticationResponse(response, 201, user);
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    return next(error);
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return response.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return sendAuthenticationResponse(response, 200, user);
  } catch (error) {
    return next(error);
  }
}

export function getCurrentUser(request, response) {
  return response.status(200).json({ success: true, data: { user: request.user.toSafeObject() } });
}
