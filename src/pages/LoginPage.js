import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Giả lập quá trình xác thực
    setTimeout(() => {
      // Trong môi trường thực tế, đây sẽ là API call
      if (isSignup) {
        // Xử lý đăng ký
        console.log('Đăng ký với:', email, password);
        localStorage.setItem('user_email', email);
        setIsLoggedIn(true);
        navigate('/dashboard');
      } else {
        // Xử lý đăng nhập
        console.log('Đăng nhập với:', email, password);
        // Giả lập kiểm tra đăng nhập (trong dự án thật sẽ kiểm tra từ API)
        if (email.includes('@') && password.length >= 6) {
          localStorage.setItem('user_email', email);
          setIsLoggedIn(true);
          navigate('/dashboard');
        } else {
          setError('Email hoặc mật khẩu không đúng');
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-left">
            <div className="login-left-content">
              <h2 className="welcome-title">Chào mừng đến với <span className="text-gradient">AI Presentation</span></h2>
              <p className="welcome-description">
                Trải nghiệm công cụ tạo bài thuyết trình thông minh nhất, được hỗ trợ bởi trí tuệ nhân tạo tiên tiến.
              </p>
              <div className="benefit-list">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>
                  <div className="benefit-text">
                    <h4>Tiết kiệm thời gian</h4>
                    <p>Tạo bài thuyết trình chỉ trong vài phút thay vì vài giờ</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="bi bi-palette-fill"></i>
                  </div>
                  <div className="benefit-text">
                    <h4>Thiết kế chuyên nghiệp</h4>
                    <p>Hàng trăm mẫu đẹp mắt, được thiết kế bởi chuyên gia</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div className="benefit-text">
                    <h4>Cộng tác thời gian thực</h4>
                    <p>Làm việc cùng nhóm của bạn một cách liền mạch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-right-content">
              <div className="brand-logo">
                <Link to="/" className="logo-link">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#4F46E5" />
                    <path d="M15 17H7V15H15V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="white" />
                  </svg>
                  <span>AI Presentation</span>
                </Link>
              </div>
              
              <h3 className="auth-title">
                {isSignup ? 'Tạo tài khoản mới' : 'Đăng nhập vào tài khoản'}
              </h3>
              
              <div className="social-auth">
                <button className="social-auth-btn google">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                  <span>Tiếp tục với Google</span>
                </button>
                <button className="social-auth-btn facebook">
                  <i className="bi bi-facebook"></i>
                  <span>Tiếp tục với Facebook</span>
                </button>
              </div>
              
              <div className="separator">
                <span>hoặc</span>
              </div>
              
              {error && (
                <div className="error-message">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="password-label">
                    <label htmlFor="password">Mật khẩu</label>
                    {!isSignup && (
                      <Link to="/forgot-password" className="forgot-password">
                        Quên mật khẩu?
                      </Link>
                    )}
                  </div>
                  <div className="input-with-icon">
                    <i className="bi bi-lock"></i>
                    <input
                      type="password"
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                {isSignup && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <div className="input-with-icon">
                      <i className="bi bi-lock"></i>
                      <input
                        type="password"
                        id="confirmPassword"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}
                
                {!isSignup && (
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    isSignup ? 'Đăng ký' : 'Đăng nhập'
                  )}
                </button>
              </form>
              
              <div className="auth-switch">
                <p>
                  {isSignup
                    ? 'Đã có tài khoản? '
                    : 'Chưa có tài khoản? '}
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => setIsSignup(!isSignup)}
                  >
                    {isSignup ? 'Đăng nhập' : 'Đăng ký ngay'}
                  </button>
                </p>
              </div>
              
              <div className="back-home">
                <Link to="/" className="back-link">
                  <i className="bi bi-arrow-left"></i>
                  <span>Quay lại trang chủ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;