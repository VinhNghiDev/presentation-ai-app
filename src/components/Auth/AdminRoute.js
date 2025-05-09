import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const AdminRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Nếu không phải admin, chuyển hướng đến trang chủ
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu là admin, hiển thị nội dung được bảo vệ
  return children;
};

export default AdminRoute; 