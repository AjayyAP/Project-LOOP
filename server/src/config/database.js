import mongoose from 'mongoose';
import User from '../models/User.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Feedback from '../models/Feedback.js';

async function migrateRoles() {
  await User.updateMany({ role: { $in: ['member', 'Member', 'analyst'] } }, { $set: { role: 'Analyst' } });
  await User.updateMany({ role: 'admin' }, { $set: { role: 'Admin' } });
  await WorkspaceMember.updateMany({ role: { $in: ['Member', 'member', 'analyst'] } }, { $set: { role: 'Analyst' } });
  await WorkspaceMember.updateMany({ role: 'admin' }, { $set: { role: 'Admin' } });

}

async function migrateFeedbackStatuses() {
  const migration = [
    ['Open', 'NEW'],
    ['In Progress', 'REVIEWED'],
    ['Closed', 'ACTIONED'],
  ];

  for (const [legacyStatus, status] of migration) {
    await Feedback.updateMany({ status: legacyStatus }, { $set: { status } });
  }
}

async function connectDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Add it to server/.env.');
  }

  await mongoose.connect(MONGODB_URI);
  await migrateRoles();
  await migrateFeedbackStatuses();
  console.log('MongoDB connected');
}

export default connectDatabase;
