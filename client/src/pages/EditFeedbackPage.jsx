import { ArrowLeft, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchFeedback, updateFeedback } from '../services/feedbackService';

function EditFeedbackPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedback(id).then((feedback) => setForm(feedback)).catch((error) => setRequestError(error.response?.data?.message || 'Unable to load feedback.'));
  }, [id]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const nextErrors = {};
    if (!title || title.length < 5 || title.length > 100) nextErrors.title = 'Title must be between 5 and 100 characters.';
    if (!description || description.length < 10 || description.length > 1000) nextErrors.description = 'Description must be between 10 and 1000 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSubmitting(true);
    try {
      const data = await updateFeedback(id, { title, description, category: form.category, priority: form.priority });
      navigate(`/feedback/${id}`, { replace: true, state: { successMessage: data.message, workspaceId: location.state?.workspaceId || form.workspace?.id || form.workspace } });
    } catch (error) {
      setRequestError(error.response?.data?.message || 'Unable to update feedback.');
    } finally { setIsSubmitting(false); }
  }

  if (!form) return <main className="workspace-page"><p className="page-status">Loading feedback...</p>{requestError && <p className="form-error">{requestError}</p>}</main>;
  const workspaceId = location.state?.workspaceId || form.workspace?.id || form.workspace;
  return <main className="workspace-page"><section className="form-page-card"><Link className="back-link" to={`/feedback/${id}`}><ArrowLeft size={17} /> Feedback details</Link><div className="page-title"><span className="card-icon"><Pencil size={21} /></span><div><p className="eyebrow">Feedback</p><h1>Edit Feedback</h1><p>Update the feedback details for this workspace.</p></div></div><form className="workspace-form" onSubmit={handleSubmit} noValidate><label>Title<input name="title" value={form.title} onChange={updateField} className={errors.title ? 'is-invalid' : ''} required maxLength="100" />{errors.title && <span className="field-error">{errors.title}</span>}</label><label>Description<textarea name="description" value={form.description} onChange={updateField} className={errors.description ? 'is-invalid' : ''} required rows="6" maxLength="1000" />{errors.description && <span className="field-error">{errors.description}</span>}</label><div className="form-select-grid"><label>Category<select name="category" value={form.category} onChange={updateField}><option>Bug</option><option>Feature Request</option><option>Improvement</option><option>Other</option></select></label><label>Priority<select name="priority" value={form.priority} onChange={updateField}><option>Low</option><option>Medium</option><option>High</option></select></label></div>{requestError && <p className="form-error">{requestError}</p>}<button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving changes...' : 'Save changes'}</button></form></section></main>;
}

export default EditFeedbackPage;
