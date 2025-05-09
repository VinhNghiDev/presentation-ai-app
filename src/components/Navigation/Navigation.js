import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">Presentation AI</Link>
      </div>

      <div className="nav-links">
        {currentUser ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/templates">Templates</Link>
            {authService.isAdmin() && (
              <Link to="/users">Quản lý người dùng</Link>
            )}
            <div className="user-menu">
              <span className="user-name">{currentUser.name}</span>
              <button onClick={handleLogout} className="logout-button">
                Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 