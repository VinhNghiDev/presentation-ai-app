import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle, FaMicrosoft, FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [socialLoading, setSocialLoading] = useState({ google: false, microsoft: false });

  // Lấy đường dẫn muốn chuyển hướng từ state (nếu có)
  const from = location.state?.from?.pathname || '/dashboard';

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hiệu ứng chuyển đổi giữa các benefit
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Xử lý đăng nhập/đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Đăng nhập
        await authService.login(formData.email, formData.password);
      } else {
        // Đăng ký
        await authService.register(formData);
      }

      // Chuyển hướng sau khi đăng nhập/đăng ký thành công
      navigate(from);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập với Google
  const handleGoogleLogin = async () => {
    setError('');
    setSocialLoading({ ...socialLoading, google: true });

    try {
      await authService.loginWithGoogle();
      navigate(from);
    } catch (error) {
      setError(error.message);
    } finally {
      setSocialLoading({ ...socialLoading, google: false });
    }
  };

  // Xử lý đăng nhập với Microsoft
  const handleMicrosoftLogin = async () => {
    setError('');
    setSocialLoading({ ...socialLoading, microsoft: true });

    try {
      await authService.loginWithMicrosoft();
      navigate(from);
    } catch (error) {
      setError(error.message);
    } finally {
      setSocialLoading({ ...socialLoading, microsoft: false });
    }
  };

  // Chuyển đổi giữa đăng nhập và đăng ký
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      ...formData,
      name: ''
    });
  };

  // Các lợi ích của ứng dụng
  const benefits = [
    {
      icon: "icon-bulb",
      title: "Nội dung thông minh",
      description: "AI tự động tạo nội dung chất lượng cao, phù hợp với từng chủ đề"
    },
    {
      icon: "icon-design",
      title: "Thiết kế chuyên nghiệp",
      description: "Hàng trăm mẫu thiết kế đẹp mắt, tùy chỉnh dễ dàng"
    },
    {
      icon: "icon-time",
      title: "Tiết kiệm thời gian",
      description: "Tạo bài thuyết trình hoàn chỉnh chỉ trong vài phút"
    }
  ];

  // Hiển thị form đăng nhập
  const renderLoginForm = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      {!isLogin && (
        <div className="form-group">
          <label htmlFor="name">Họ tên</label>
          <div className="input-with-icon">
            <FaUser />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Họ và tên đầy đủ"
              value={formData.name}
              onChange={handleChange}
              required={!isLogin}
              disabled={loading}
              className="input-animate"
            />
          </div>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-with-icon">
          <FaEnvelope />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="input-animate"
          />
        </div>
      </div>
      
      <div className="form-group">
        <div className="password-label">
          <label htmlFor="password">Mật khẩu</label>
          {isLogin && (
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          )}
        </div>
        <div className="input-with-icon">
          <FaLock />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder={isLogin ? "Nhập mật khẩu" : "Tạo mật khẩu"}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="input-animate"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
      
      {isLogin && (
        <div className="form-check">
          <input
            type="checkbox" 
            className="form-check-input" 
            id="rememberMe" 
          />
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
            <span>{isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}</span>
          </>
        ) : (
          <>
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            <FaChevronRight className="btn-icon" />
          </>
        )}
      </button>
    </form>
  );

  // Hiển thị phần giới thiệu
  const renderIntro = () => (
    <div className="login-left-content">
      <h1 className="welcome-title">Presentation AI</h1>
      <p className="welcome-description">
        Nền tảng tạo bài thuyết trình thông minh với sự hỗ trợ của trí tuệ nhân tạo
      </p>
      
      <div className="benefit-list">
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className={`benefit-item ${activeIndex === index ? 'benefit-active' : ''}`}
          >
            <div className="benefit-icon">
              <i className={benefit.icon}></i>
            </div>
            <div className="benefit-text">
              <h4>{benefit.title}</h4>
              <p>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="benefit-dots">
        {benefits.map((_, index) => (
          <button
            key={index}
            className={`dot ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );

  // Render các nút đăng nhập xã hội
  const renderSocialButtons = () => (
    <div className="social-auth">
      <button 
        type="button"
        className="social-auth-btn google-btn"
        onClick={handleGoogleLogin}
        disabled={socialLoading.google || socialLoading.microsoft || loading}
      >
        {socialLoading.google ? (
          <>
            <span className="spinner-small"></span>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <FaGoogle /> Tiếp tục với Google
          </>
        )}
      </button>
      <button 
        type="button"
        className="social-auth-btn microsoft-btn"
        onClick={handleMicrosoftLogin}
        disabled={socialLoading.microsoft || socialLoading.google || loading}
      >
        {socialLoading.microsoft ? (
          <>
            <span className="spinner-small"></span>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <FaMicrosoft /> Tiếp tục với Microsoft
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Sắp xếp trật tự hiển thị tùy theo kích thước màn hình */}
          {windowWidth <= 767 ? (
            <>
              <div className="login-right">
                <div className="login-right-content">
                  <div className="brand-logo">
                    <Link to="/" className="logo-link">
                      <img src="/logo192.png" alt="Logo" className="logo-image" />
                      <span>Presentation AI</span>
                    </Link>
                  </div>
                  
                  <h2 className="auth-title">{isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h2>
                  
                  {renderSocialButtons()}
                  
                  <div className="separator">
                    <span>hoặc {isLogin ? 'đăng nhập' : 'đăng ký'} với email</span>
                  </div>
                  
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                  
                  {renderLoginForm()}
                  
                  <div className="auth-switch">
                    <p>
                      {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                      <button 
                        type="button" 
                        className="switch-btn" 
                        onClick={toggleForm}
                        disabled={loading || socialLoading.google || socialLoading.microsoft}
                      >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                      </button>
                    </p>
                  </div>
                  
                  <div className="back-home">
                    <Link to="/" className="back-link">
                      <FaArrowLeft /> Quay về trang chủ
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="login-left">
                {renderIntro()}
              </div>
            </>
          ) : (
            <>
              <div className="login-left">
                {renderIntro()}
              </div>
              
              <div className="login-right">
                <div className="login-right-content">
                  <div className="brand-logo">
                    <Link to="/" className="logo-link">
                      <img src="/logo192.png" alt="Logo" className="logo-image" />
                      <span>Presentation AI</span>
                    </Link>
                  </div>
                  
                  <h2 className="auth-title">{isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h2>
                  
                  {renderSocialButtons()}
                  
                  <div className="separator">
                    <span>hoặc {isLogin ? 'đăng nhập' : 'đăng ký'} với email</span>
                  </div>
                  
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                  
                  {renderLoginForm()}
                  
                  <div className="auth-switch">
                    <p>
                      {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                      <button 
                        type="button" 
                        className="switch-btn" 
                        onClick={toggleForm}
                        disabled={loading || socialLoading.google || socialLoading.microsoft}
                      >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                      </button>
                    </p>
                  </div>
                  
                  <div className="back-home">
                    <Link to="/" className="back-link">
                      <FaArrowLeft /> Quay về trang chủ
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;