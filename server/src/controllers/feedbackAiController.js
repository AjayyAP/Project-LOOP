import Feedback from '../models/Feedback.js';
import { classifyFeedback } from '../services/geminiService.js';

export async function reclassifyFeedback(request, response, next) {
  try {
    const existingThemes = await Feedback.distinct('theme', {
      workspace: request.feedback.workspace,
      theme: { $type: 'string', $ne: '' },
    });
    const aiAnalysis = await classifyFeedback({
      title: request.feedback.title,
      description: request.feedback.description,
      existingThemes,
    });

    if (!aiAnalysis.sentiment || !Number.isFinite(aiAnalysis.sentimentScore) || !aiAnalysis.theme || !aiAnalysis.featureArea || !aiAnalysis.aiSummary) {
      return response.status(503).json({
        success: false,
        message: 'AI re-classification is temporarily unavailable.',
      });
    }

    await Feedback.updateOne(
      { _id: request.feedback._id },
      { $set: aiAnalysis },
      { timestamps: false },
    );

    return response.status(200).json({
      success: true,
      message: 'AI analysis updated successfully.',
      data: { aiAnalysis },
    });
  } catch (error) {
    return next(error);
  }
}
