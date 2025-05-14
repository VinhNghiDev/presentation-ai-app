import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import TemplatesPage from './pages/TemplatesPage';
import UserManagementPage from './pages/UserManagementPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CollaborationPage from './pages/CollaborationPage';
import ExportPage from './pages/ExportPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PresentationViewerPage from './pages/PresentationViewerPage';
import SubscriptionPage from './pages/SubscriptionPage';
import HelpSupportPage from './pages/HelpSupportPage';
import CommunityPage from './pages/CommunityPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AITester from './components/AITester';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';
import authService from './services/authService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  // Thiết lập axios interceptors khi ứng dụng khởi động
  useEffect(() => {
    authService.setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/editor" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
          <Route path="/editor/:id" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
          <Route path="/templates" element={<PrivateRoute><TemplatesPage /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><AccountSettingsPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
          <Route path="/ai-tester" element={<PrivateRoute><AITester /></PrivateRoute>} />
          <Route path="/collaboration" element={<PrivateRoute><CollaborationPage /></PrivateRoute>} />
          <Route path="/export" element={<PrivateRoute><ExportPage /></PrivateRoute>} />
          <Route path="/integrations" element={<PrivateRoute><IntegrationsPage /></PrivateRoute>} />
          <Route path="/presentation/:id" element={<PrivateRoute><PresentationViewerPage /></PrivateRoute>} />
          <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;