const sentiments = new Set(['Positive', 'Neutral', 'Negative']);
const featureAreas = new Set(['Login', 'Dashboard', 'Feedback', 'Workspace', 'Search', 'CSV Import', 'Analytics', 'Other']);
const emptyAnalysis = { sentiment: null, sentimentScore: null, theme: null, featureArea: null, aiSummary: null };
const geminiModel = 'gemini-3.6-flash';

function validateAnalysis(analysis) {
  if (!analysis || !sentiments.has(analysis.sentiment) || !featureAreas.has(analysis.featureArea)) {
    throw new Error('Gemini returned an invalid analysis response.');
  }

  const theme = String(analysis.theme || '').trim();
  const aiSummary = String(analysis.aiSummary || '').trim();
  const sentimentScore = analysis.sentimentScore;
  if (!Number.isFinite(sentimentScore) || sentimentScore < -1 || sentimentScore > 1 || !theme || theme.length > 80 || !aiSummary || aiSummary.length > 1000) {
    throw new Error('Gemini returned incomplete analysis fields.');
  }

  return { sentiment: analysis.sentiment, sentimentScore, theme, featureArea: analysis.featureArea, aiSummary };
}

export async function classifyFeedback({ title, description, existingThemes = [] }) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const reusableThemes = [...new Set(existingThemes.map((theme) => String(theme).trim()).filter(Boolean))].slice(0, 50);
    const themeGuidance = reusableThemes.length
      ? `Reuse an existing theme whenever appropriate. Only create a new theme if none accurately matches. Existing workspace themes: ${reusableThemes.join(', ')}.`
      : 'Reuse an existing theme whenever appropriate. Only create a new theme if none accurately matches.';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Classify this Project LOOP feedback. Return concise, useful analysis only. Include sentimentScore as a number from -1.0 (very negative) through 0.0 (neutral) to 1.0 (very positive). ${themeGuidance}\n\nTitle: ${title}\nDescription: ${description}`,
          }],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              sentiment: { type: 'STRING', enum: ['Positive', 'Neutral', 'Negative'] },
              sentimentScore: { type: 'NUMBER', description: 'A numeric sentiment score from -1.0 (very negative) to 1.0 (very positive).' },
              theme: { type: 'STRING', description: 'A short product theme such as Authentication, UI, Performance, Payment, Dashboard, or Notifications.' },
              featureArea: { type: 'STRING', enum: ['Login', 'Dashboard', 'Feedback', 'Workspace', 'Search', 'CSV Import', 'Analytics', 'Other'] },
              aiSummary: { type: 'STRING', description: 'A concise two or three sentence summary of the feedback.' },
            },
            required: ['sentiment', 'sentimentScore', 'theme', 'featureArea', 'aiSummary'],
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}.`);
    }

    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
    return validateAnalysis(JSON.parse(text));
  } catch (error) {
    console.error('Gemini feedback classification failed:', error.message);
    return emptyAnalysis;
  }
}
