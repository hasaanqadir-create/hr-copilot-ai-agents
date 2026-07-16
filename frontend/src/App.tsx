import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { JobsPage } from './pages/JobsPage';
import { InterviewGeneratorPage } from './pages/features/InterviewGeneratorPage';
import { EmailTemplatesPage } from './pages/features/EmailTemplatesPage';
import { OfferLetterPage } from './pages/features/OfferLetterPage';
import { AtsImprovementPage } from './pages/features/AtsImprovementPage';
import { JobAnalyticsPage } from './pages/features/JobAnalyticsPage';
import { ActivityPage } from './pages/features/ActivityPage';
import { SettingsPage } from './pages/features/SettingsPage';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'rgba(15,15,26,0.95)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', fontSize: '13px' },
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard"           element={<DashboardPage />} />
          <Route path="/candidates"          element={<CandidatesPage />} />
          <Route path="/jobs"                element={<JobsPage />} />
          <Route path="/interview-generator" element={<InterviewGeneratorPage />} />
          <Route path="/email-templates"     element={<EmailTemplatesPage />} />
          <Route path="/offer-letter"        element={<OfferLetterPage />} />
          <Route path="/ats-improvement"     element={<AtsImprovementPage />} />
          <Route path="/job-analytics"       element={<JobAnalyticsPage />} />
          <Route path="/activity"            element={<ActivityPage />} />
          <Route path="/settings"            element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
