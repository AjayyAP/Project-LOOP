import ChannelImport from '../models/ChannelImport.js';
import Feedback from '../models/Feedback.js';
import { classifyFeedback } from '../services/geminiService.js';
import { getSampleChannelFeedback } from '../utils/sampleChannelFeedback.js';

async function classifyAll(items, existingThemes) {
  const classified = [];
  const workerCount = 3;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const item = items[nextIndex++];
      const aiAnalysis = await classifyFeedback({ ...item, existingThemes });
      classified.push({ ...item, ...aiAnalysis });
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  return classified;
}

export async function importSampleChannel(request, response, next) {
  let importRecord;
  try {
    const { channel } = request.body;
    const samples = getSampleChannelFeedback(channel);
    importRecord = await ChannelImport.create({ workspace: request.feedbackWorkspace._id, channel, importedBy: request.user._id, importedCount: samples.length });
    const existingThemes = await Feedback.distinct('theme', {
      workspace: request.feedbackWorkspace._id,
      theme: { $type: 'string', $ne: '' },
    });
    const items = await classifyAll(samples, existingThemes);
    const now = Date.now();
    const feedback = items.map((item, index) => ({
      ...item,
      workspace: request.feedbackWorkspace._id,
      createdBy: request.user._id,
      channel,
      createdAt: new Date(now - index * 6 * 60 * 60 * 1000),
      updatedAt: new Date(now - index * 6 * 60 * 60 * 1000),
    }));
    await Feedback.insertMany(feedback);

    return response.status(201).json({ success: true, message: `Imported ${feedback.length} sample ${channel} feedback items successfully.`, data: { imported: feedback.length, channel } });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ success: false, message: `Sample ${request.body.channel} feedback has already been imported for this workspace.` });
    }
    if (importRecord) await ChannelImport.deleteOne({ _id: importRecord._id });
    return next(error);
  }
}
