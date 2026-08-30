import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LandingPage } from '../pages/LandingPage';
import { Settings } from '../pages/Settings';
import { NotFound } from '../pages/NotFound';
import { ChatPage } from '../pages/ChatPage';
import { ReflectionDashboard } from '../pages/ReflectionDashboard';
import { JournalPage } from '../pages/JournalPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/chat" element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      } />
      <Route path="/reflection" element={
        <ProtectedRoute>
          <ReflectionDashboard />
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <JournalPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

