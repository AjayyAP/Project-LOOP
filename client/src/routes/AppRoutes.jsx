import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuth from '../hooks/useAuth';
import AuthPage from '../pages/AuthPage';
import AiInsightsPage from '../pages/AiInsightsPage';
import AskLoopPage from '../pages/AskLoopPage';
import VocReportPage from '../pages/VocReportPage';
import VocReportHistoryPage from '../pages/VocReportHistoryPage';
import DashboardPage from '../pages/DashboardPage';
import EditFeedbackPage from '../pages/EditFeedbackPage';
import CreateFeedbackPage from '../pages/CreateFeedbackPage';
import CreateWorkspacePage from '../pages/CreateWorkspacePage';
import HomePage from '../pages/HomePage';
import ImportFeedbackPage from '../pages/ImportFeedbackPage';
import FeedbackDetailsPage from '../pages/FeedbackDetailsPage';
import FeedbackListPage from '../pages/FeedbackListPage';
import WorkspaceDetailsPage from '../pages/WorkspaceDetailsPage';
import WorkspaceDashboardPage from '../pages/WorkspaceDashboardPage';
import WorkspaceListPage from '../pages/WorkspaceListPage';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/workspaces" element={<WorkspaceListPage />} />
        <Route path="/workspaces/new" element={<CreateWorkspacePage />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetailsPage />} />
        <Route path="/workspaces/:workspaceId/dashboard" element={<WorkspaceDashboardPage />} />
        <Route path="/workspaces/:workspaceId/ai-insights" element={<AiInsightsPage />} />
        <Route path="/workspaces/:workspaceId/ask-loop" element={<AskLoopPage />} />
        <Route path="/workspaces/:workspaceId/voc-report" element={<VocReportPage />} />
        <Route path="/workspaces/:workspaceId/voc-report/history" element={<VocReportHistoryPage />} />
        <Route path="/workspaces/:workspaceId/feedback" element={<FeedbackListPage />} />
        <Route path="/workspaces/:workspaceId/feedback/new" element={<CreateFeedbackPage />} />
        <Route path="/workspaces/:workspaceId/feedback/import" element={<ImportFeedbackPage />} />
        <Route path="/feedback/:id" element={<FeedbackDetailsPage />} />
        <Route path="/feedback/:id/edit" element={<EditFeedbackPage />} />
      </Route>
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default AppRoutes;
