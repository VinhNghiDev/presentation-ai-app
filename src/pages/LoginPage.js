import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  // Lấy đường dẫn muốn chuyển hướng từ state (nếu có)
  const from = location.state?.from?.pathname || '/dashboard';

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
        const response = await authService.login(formData.email, formData.password);
      } else {
        // Đăng ký
        const response = await authService.register(formData);
      }

      // Chuyển hướng sau khi đăng nhập/đăng ký thành công
      navigate(from);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi giữa đăng nhập và đăng ký
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-info">
            <h1>Presentation AI</h1>
            <p>Tạo bài thuyết trình chuyên nghiệp chỉ trong vài phút với sự hỗ trợ của AI</p>
            <div className="login-features">
              <div className="feature-item">
                <i className="feature-icon brain-icon"></i>
                <div>
                  <h3>Nội dung thông minh</h3>
                  <p>AI tự động tạo nội dung chất lượng cao, phù hợp với chủ đề</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="feature-icon design-icon"></i>
                <div>
                  <h3>Thiết kế chuyên nghiệp</h3>
                  <p>Nhiều mẫu thiết kế đẹp mắt, phù hợp với nhiều lĩnh vực</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="feature-icon time-icon"></i>
                <div>
                  <h3>Tiết kiệm thời gian</h3>
                  <p>Tạo bài thuyết trình hoàn chỉnh chỉ trong vài phút</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Họ tên</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>
            
            <div className="toggle-form">
              {isLogin ? (
                <p>Chưa có tài khoản? <button onClick={toggleForm}>Đăng ký</button></p>
              ) : (
                <p>Đã có tài khoản? <button onClick={toggleForm}>Đăng nhập</button></p>
              )}
            </div>
            
            <div className="back-to-home">
              <Link to="/">← Quay lại trang chủ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;