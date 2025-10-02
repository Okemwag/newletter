import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout/DashboardLayout';
import { LandingPage } from './components/LandingPage/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ContentPage } from './pages/dashboard/ContentPage';
import { SubscribersPage } from './pages/dashboard/SubscribersPage';
import { FeedPage } from './pages/dashboard/FeedPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { UserRole } from './types/auth.types';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected dashboard routes - all authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected routes - creators only */}
          <Route
            path="/dashboard/content"
            element={
              <ProtectedRoute allowedRoles={[UserRole.CREATOR]}>
                <DashboardLayout>
                  <ContentPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/subscribers"
            element={
              <ProtectedRoute allowedRoles={[UserRole.CREATOR]}>
                <DashboardLayout>
                  <SubscribersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected routes - subscribers only */}
          <Route
            path="/dashboard/feed"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUBSCRIBER]}>
                <DashboardLayout>
                  <FeedPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUBSCRIBER]}>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected routes - all authenticated users */}
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}