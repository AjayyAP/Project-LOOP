import mongoose from 'mongoose';

const channelImportSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    channel: { type: String, required: true, enum: ['Email', 'Website', 'Play Store', 'App Store', 'Slack', 'Twitter/X'] },
    importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    importedCount: { type: Number, required: true },
  },
  { timestamps: true },
);

channelImportSchema.index({ workspace: 1, channel: 1 }, { unique: true });

export default mongoose.model('ChannelImport', channelImportSchema);
