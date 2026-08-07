import Feedback from '../models/Feedback.js';
import { answerWorkspaceQuestion } from '../services/workspaceAssistantService.js';

export async function askWorkspace(request, response, next) {
  try {
    const feedback = await Feedback.find(
      { workspace: request.assistantWorkspace._id, $text: { $search: request.body.question } },
      { score: { $meta: 'textScore' } },
    )
      .select('title description sentiment theme featureArea status priority aiSummary')
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .lean();

    if (!feedback.length) {
      return response.status(200).json({
        success: true,
        data: { answer: "I couldn't find enough information in this workspace's feedback.", sources: [] },
      });
    }

    const answer = await answerWorkspaceQuestion({ question: request.body.question, feedback });

    return response.status(200).json({
      success: true,
      data: {
        answer,
        sources: feedback.map((item) => ({ id: item._id, title: item.title })),
      },
    });
  } catch (error) {
    return next(error);
  }
}
