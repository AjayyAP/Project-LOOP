import { ArrowLeft, FolderPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { createWorkspace } from '../services/workspaceService';

function CreateWorkspacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', description: '' });
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
    const name = form.name.trim();
    const nextErrors = {};
    if (!name) nextErrors.name = 'Workspace name is required.';
    else if (name.length < 3 || name.length > 50) nextErrors.name = 'Workspace name must be between 3 and 50 characters.';
    if (form.description.length > 500) nextErrors.description = 'Description cannot exceed 500 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      const data = await createWorkspace({ name, description: form.description.trim() });
      navigate(`/workspaces/${data.data.workspace.id}`, { replace: true, state: { successMessage: data.message } });
    } catch (requestError) {
      const backendErrors = requestError.response?.data?.errors;
      if (Array.isArray(backendErrors)) setErrors(backendErrors.reduce((current, error) => ({ ...current, [error.path]: error.msg }), {}));
      else setRequestError(requestError.response?.data?.message || 'Unable to create the workspace.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user?.role !== 'Admin') {
    return <main className="workspace-page"><section className="form-page-card"><p className="form-error" role="alert">Permission denied.</p><Link className="back-link" to="/workspaces"><ArrowLeft size={17} /> My Workspaces</Link></section></main>;
  }

  return (
    <main className="workspace-page"><section className="form-page-card">
      <Link className="back-link" to="/workspaces"><ArrowLeft size={17} /> My Workspaces</Link>
      <div className="page-title"><span className="card-icon"><FolderPlus size={21} /></span><div><p className="eyebrow">Workspace setup</p><h1>Create a workspace</h1><p>You'll be added as its Admin automatically.</p></div></div>
      <form className="workspace-form" onSubmit={handleSubmit} noValidate>
        <label>Workspace name<input name="name" value={form.name} onChange={updateField} className={errors.name ? 'is-invalid' : ''} aria-invalid={Boolean(errors.name)} required maxLength="50" />{errors.name && <span className="field-error">{errors.name}</span>}</label>
        <label>Description <span className="optional-label">(optional)</span><textarea name="description" value={form.description} onChange={updateField} className={errors.description ? 'is-invalid' : ''} aria-invalid={Boolean(errors.description)} maxLength="500" rows="4" />{errors.description && <span className="field-error">{errors.description}</span>}</label>
        {requestError && <p className="form-error" role="alert">{requestError}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating workspace...' : 'Create workspace'}</button>
      </form>
    </section></main>
  );
}

export default CreateWorkspacePage;
