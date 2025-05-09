import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * Component bảo vệ route, chỉ cho phép người dùng đã đăng nhập truy cập
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  
  // Kiểm tra người dùng đã đăng nhập hay chưa
  if (!authService.isAuthenticated()) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    // và lưu lại đường dẫn hiện tại để sau khi đăng nhập có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Nếu đã đăng nhập, hiển thị nội dung bên trong route
  return children;
};

export default PrivateRoute; 