import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none">
                <h2 className="mb-1 fw-bold">
                  <span className="text-primary">AI</span> Presentation
                </h2>
              </Link>
              <p className="text-muted">
                {isSignup 
                  ? 'Tạo tài khoản và bắt đầu ngay' 
                  : 'Đăng nhập và tiếp tục dự án của bạn'}
              </p>
            </div>
            
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h4 className="card-title text-center mb-4">
                  {isSignup ? 'Đăng ký' : 'Đăng nhập'}
                </h4>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Email input */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Password input */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {/* Confirm Password (for signup only) */}
                  {isSignup && (
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  
                  {/* Remember me checkbox */}
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  
                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </span>
                    ) : (
                      isSignup ? 'Đăng ký' : 'Đăng nhập'
                    )}
                  </button>
                </form>
                
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    onClick={() => setIsSignup(!isSignup)}
                  >
                    {isSignup
                      ? 'Đã có tài khoản? Đăng nhập'
                      : 'Chưa có tài khoản? Đăng ký ngay'}
                  </button>
                </div>
                
                <hr className="my-4" />
                
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-google me-2"></i> Tiếp tục với Google
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-facebook me-2"></i> Tiếp tục với Facebook
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/" className="text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i> Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;