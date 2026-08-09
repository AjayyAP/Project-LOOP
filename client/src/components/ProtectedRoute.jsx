import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AppHeader from './AppHeader';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <main className="auth-page"><p>Checking your session…</p></main>;
  }

  return isAuthenticated ? <><AppHeader /><Outlet /></> : <Navigate to="/login" replace state={{ from: location }} />;
}

export default ProtectedRoute;
