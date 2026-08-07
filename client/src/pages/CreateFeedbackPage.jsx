import { ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createFeedback } from '../services/feedbackService';

function CreateFeedbackPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'Bug', priority: 'Medium' });
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setRequestError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const nextErrors = {};
    if (!title) nextErrors.title = 'Title is required.';
    else if (title.length < 5 || title.length > 100) nextErrors.title = 'Title must be between 5 and 100 characters.';
    if (!description) nextErrors.description = 'Description is required.';
    else if (description.length < 10 || description.length > 1000) nextErrors.description = 'Description must be between 10 and 1000 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      const data = await createFeedback(workspaceId, { ...form, title, description });
      navigate(`/feedback/${data.data.feedback.id}`, { replace: true, state: { successMessage: data.message, workspaceId } });
    } catch (requestError) {
      const backendErrors = requestError.response?.data?.errors;
      if (Array.isArray(backendErrors)) setErrors(backendErrors.reduce((current, error) => ({ ...current, [error.path]: error.msg }), {}));
      else setRequestError(requestError.response?.data?.message || 'Unable to create feedback.');
    } finally { setIsSubmitting(false); }
  }

  return <main className="workspace-page"><section className="form-page-card"><Link className="back-link" to={`/workspaces/${workspaceId}/feedback`}><ArrowLeft size={17} /> Feedback list</Link><div className="page-title"><span className="card-icon"><MessageSquarePlus size={21} /></span><div><p className="eyebrow">Feedback</p><h1>Create Feedback</h1><p>Share an issue, idea, or improvement with the workspace.</p></div></div><form className="workspace-form" onSubmit={handleSubmit} noValidate><label>Title<input name="title" value={form.title} onChange={updateField} className={errors.title ? 'is-invalid' : ''} aria-invalid={Boolean(errors.title)} required maxLength="100" />{errors.title && <span className="field-error">{errors.title}</span>}</label><label>Description<textarea name="description" value={form.description} onChange={updateField} className={errors.description ? 'is-invalid' : ''} aria-invalid={Boolean(errors.description)} required rows="6" maxLength="1000" />{errors.description && <span className="field-error">{errors.description}</span>}</label><div className="form-select-grid"><label>Category<select name="category" value={form.category} onChange={updateField}><option>Bug</option><option>Feature Request</option><option>Improvement</option><option>Other</option></select></label><label>Priority<select name="priority" value={form.priority} onChange={updateField}><option>Low</option><option>Medium</option><option>High</option></select></label></div>{requestError && <p className="form-error" role="alert">{requestError}</p>}<button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting feedback...' : 'Create Feedback'}</button></form></section></main>;
}

export default CreateFeedbackPage;
