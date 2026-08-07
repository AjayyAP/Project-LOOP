import { ArrowLeft, Bot, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { askWorkspaceQuestion } from '../services/workspaceAssistantService';

const suggestedQuestions = [
  'What are the biggest customer complaints?',
  'Which feature has the most issues?',
  'What themes appear most often?',
  'Summarize customer feedback.',
  'Which problems should we fix first?',
];

function AskLoopPage() {
  const { workspaceId } = useParams();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  async function askQuestion(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setError('Enter a question with at least 3 characters.');
      return;
    }

    setIsAsking(true);
    setError('');
    try {
      const result = await askWorkspaceQuestion(workspaceId, trimmedQuestion);
      setHistory((current) => [...current, { question: trimmedQuestion, ...result }]);
      setQuestion('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to get an answer from Ask LOOP.');
    } finally {
      setIsAsking(false);
    }
  }

  return <main className="workspace-page"><section className="workspace-container ask-loop-page"><Link className="back-link" to={`/workspaces/${workspaceId}`}><ArrowLeft size={17} /> Workspace details</Link><header className="page-header"><div><p className="eyebrow">AI Workspace Assistant</p><h1>Ask LOOP</h1><p>Ask questions about the feedback in this workspace.</p></div><Bot size={30} className="insights-header-icon" /></header><section className="ask-card"><div className="ask-intro"><Sparkles size={20} /><p>Answers are based only on the feedback currently stored in this workspace.</p></div><form onSubmit={askQuestion} className="ask-form"><label>Your question<textarea value={question} onChange={(event) => { setQuestion(event.target.value); setError(''); }} placeholder="Ask about your workspace feedback..." rows="4" maxLength="1000" disabled={isAsking} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={isAsking}>{isAsking ? 'Thinking...' : <><Send size={17} /> Ask LOOP</>}</button></form><div className="suggestion-list"><strong>Suggested questions</strong><div>{suggestedQuestions.map((item) => <button key={item} type="button" onClick={() => setQuestion(item)} disabled={isAsking}>{item}</button>)}</div></div></section>{history.length === 0 ? <section className="empty-state ask-empty"><Bot size={36} /><h2>Ask your first question</h2><p>Use a suggested question or enter your own to explore workspace feedback.</p></section> : <section className="answer-history">{history.map((item, index) => <article className="answer-card" key={`${item.question}-${index}`}><div><strong>You asked</strong><p>{item.question}</p></div><div><strong>Ask LOOP</strong><p>{item.answer}</p>{item.sources.length > 0 && <div className="answer-sources"><strong>Sources</strong><ul>{item.sources.map((source) => <li key={source.id}><Link to={`/feedback/${source.id}`} state={{ workspaceId }}>{source.title}</Link></li>)}</ul></div>}</div></article>)}</section>}</section></main>;
}

export default AskLoopPage;
