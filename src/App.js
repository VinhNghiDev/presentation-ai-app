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
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';
import authService from './services/authService';
import './App.css';

function App() {
  // Thiết lập axios interceptors khi ứng dụng khởi động
  useEffect(() => {
    authService.setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          <Route path="/editor" element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          } />
          
          <Route path="/editor/:id" element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          } />
          
          <Route path="/templates" element={
            <PrivateRoute>
              <TemplatesPage />
            </PrivateRoute>
          } />

          <Route path="/users" element={
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          } />

          <Route path="/account" element={
            <PrivateRoute>
              <AccountSettingsPage />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;