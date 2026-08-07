import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setRequestError('');
  }

  function validateForm() {
    const errors = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (isRegister && !fullName) {
      errors.fullName = 'Full name is required.';
    } else if (isRegister && (fullName.length < 2 || fullName.length > 50)) {
      errors.fullName = 'Full name must be between 2 and 50 characters.';
    }

    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (isRegister && form.password.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateForm();
    setFieldErrors(errors);
    setRequestError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { ...form, fullName: form.fullName.trim(), email: form.email.trim() }
        : { email: form.email.trim(), password: form.password };
      const { data } = await api.post(endpoint, payload);
      setSession(data.data.token, data.data.user);
      navigate(location.state?.from?.pathname || '/dashboard', {
        replace: true,
        state: isRegister ? { successMessage: data.message } : undefined,
      });
    } catch (requestError) {
      const backendErrors = requestError.response?.data?.errors;

      if (Array.isArray(backendErrors)) {
        setFieldErrors(backendErrors.reduce((errors, error) => ({ ...errors, [error.path]: error.msg }), {}));
      } else {
        setRequestError(requestError.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderField(name, label, options = {}) {
    const error = fieldErrors[name];
    const errorId = `${name}-error`;

    return (
      <label>
        {label}
        <input
          className={error ? 'is-invalid' : ''}
          name={name}
          value={form[name]}
          onChange={updateField}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...options}
        />
        {error && <span id={errorId} className="field-error" role="alert">{error}</span>}
      </label>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Project LOOP</p>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p>{isRegister ? 'Start using Project LOOP.' : 'Sign in to continue to Project LOOP.'}</p>
        <form onSubmit={handleSubmit} noValidate>
          {isRegister && renderField('fullName', 'Full name', { autoComplete: 'name', required: true })}
          {renderField('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
          {renderField('password', 'Password', { type: 'password', autoComplete: isRegister ? 'new-password' : 'current-password', required: true, minLength: 8 })}
          {requestError && <p className="form-error" role="alert">{requestError}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isRegister ? 'Creating account...' : 'Signing in...') : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="form-switch">{isRegister ? 'Already have an account?' : 'New to Project LOOP?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
      </section>
    </main>
  );
}

export default AuthPage;
