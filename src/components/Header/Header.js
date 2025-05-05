import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#4F46E5" />
            <path d="M15 17H7V15H15V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="white" />
          </svg>
          <span className="fw-bold">AI Presentation</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          {isLoggedIn && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link px-3" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/templates">
                  Templates
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/discover">
                  Khám phá
                </Link>
              </li>
            </ul>
          )}
          
          <ul className="navbar-nav ms-auto">
            {isLoggedIn ? (
              <>
                <li className="nav-item me-2">
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-3 nav-upgrade-btn">
                    <i className="bi bi-star-fill me-1"></i>
                    Nâng cấp
                  </button>
                </li>
                <li className="nav-item me-2">
                  <Link className="nav-link position-relative" to="/notifications">
                    <i className="bi bi-bell"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      2
                    </span>
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <img 
                      src="https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff" 
                      alt="User" 
                      className="rounded-circle me-1"
                      width="24" 
                      height="24" 
                    />
                    <span className="d-none d-md-inline">Tài khoản</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="navbarDropdown">
                    <div className="dropdown-header d-flex align-items-center">
                      <img 
                        src="https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff" 
                        alt="User" 
                        className="rounded-circle me-2"
                        width="32" 
                        height="32" 
                      />
                      <div>
                        <div className="fw-bold">User</div>
                        <div className="small text-muted">user@example.com</div>
                      </div>
                    </div>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        Hồ sơ
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/settings">
                        <i className="bi bi-gear me-2"></i>
                        Cài đặt
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link className="nav-link" to="/login">Đăng nhập</Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="btn btn-primary rounded-pill px-4" 
                    to="/login"
                  >
                    Bắt đầu miễn phí
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;