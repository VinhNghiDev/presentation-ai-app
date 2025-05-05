import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row footer-main">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#4F46E5" />
                <path d="M15 17H7V15H15V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="white" />
              </svg>
              <h5 className="m-0 fw-bold">AI Presentation</h5>
            </div>
            <p className="text-muted mb-3">
              Tạo bài thuyết trình chuyên nghiệp nhanh chóng với công nghệ AI. Dễ dàng tạo, chỉnh sửa và chia sẻ nội dung một cách đơn giản.
            </p>
            <div className="social-links mb-3">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="col-6 col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h6 className="footer-heading">Sản phẩm</h6>
            <ul className="footer-links">
              <li>
                <Link to="/features">Tính năng</Link>
              </li>
              <li>
                <Link to="/templates">Template</Link>
              </li>
              <li>
                <Link to="/pricing">Bảng giá</Link>
              </li>
              <li>
                <Link to="/updates">Cập nhật</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-6 col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h6 className="footer-heading">Hỗ trợ</h6>
            <ul className="footer-links">
              <li>
                <Link to="/help">Trung tâm trợ giúp</Link>
              </li>
              <li>
                <Link to="/tutorials">Hướng dẫn</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
              <li>
                <Link to="/community">Cộng đồng</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-6 col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h6 className="footer-heading">Công ty</h6>
            <ul className="footer-links">
              <li>
                <Link to="/about">Về chúng tôi</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/careers">Tuyển dụng</Link>
              </li>
              <li>
                <Link to="/press">Báo chí</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-6 col-md-4 col-lg-2 mb-4 mb-lg-0">
            <h6 className="footer-heading">Pháp lý</h6>
            <ul className="footer-links">
              <li>
                <Link to="/terms">Điều khoản</Link>
              </li>
              <li>
                <Link to="/privacy">Quyền riêng tư</Link>
              </li>
              <li>
                <Link to="/cookies">Cookies</Link>
              </li>
              <li>
                <Link to="/licenses">Giấy phép</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-2 mb-md-0">© {currentYear} AI Presentation. Đã đăng ký bản quyền.</p>
            <div className="d-flex align-items-center">
              <div className="dropdown language-selector">
                <button className="btn dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-globe2 me-1"></i> Tiếng Việt
                </button>
                <ul className="dropdown-menu" aria-labelledby="languageDropdown">
                  <li><button className="dropdown-item">English</button></li>
                  <li><button className="dropdown-item active">Tiếng Việt</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;