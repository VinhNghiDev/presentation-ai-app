import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Header.css';

const Header = ({ onCollaborationClick }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    setShowUserMenu(false);
    navigate(path);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">Presentation AI</Link>
        </div>
        <nav className="nav-menu">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {isAdmin && (
                <Link to="/users" className="nav-link">User Management</Link>
              )}
              {onCollaborationClick && (
                <button 
                  className="nav-link"
                  onClick={onCollaborationClick}
                >
                  <i className="bi bi-people"></i>
                  Collaboration
                </button>
              )}
              <div className="user-menu" ref={userMenuRef}>
                <div 
                  className="user-avatar" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" />
                  ) : (
                    <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={`dropdown-menu ${showUserMenu ? 'show' : ''}`}>
                  <div className="user-info">
                    <span className="user-name">{currentUser.name}</span>
                    <span className="user-email">{currentUser.email}</span>
                  </div>
                  <div className="menu-divider"></div>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleMenuClick('/account')}
                  >
                    <i className="bi bi-person"></i>
                    Account Settings
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleMenuClick('/profile')}
                  >
                    <i className="bi bi-gear"></i>
                    Profile
                  </button>
                  {isAdmin && (
                    <button 
                      className="dropdown-item"
                      onClick={() => handleMenuClick('/users')}
                    >
                      <i className="bi bi-people"></i>
                      User Management
                    </button>
                  )}
                  <div className="menu-divider"></div>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;