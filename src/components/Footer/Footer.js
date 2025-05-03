import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light py-4 mt-auto border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5 className="mb-3">
              <span className="text-primary">AI</span> Presentation
            </h5>
            <p className="text-muted mb-2">
              Công cụ tạo bài thuyết trình thông minh với AI giúp bạn tiết kiệm thời gian và công sức.
            </p>
            <p className="text-muted small">
              © {currentYear} AI Presentation. All rights reserved.
            </p>
          </div>
          <div className="col-md-2">
            <h6 className="mb-3">Sản phẩm</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Tính năng
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Bảng giá
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Template
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="mb-3">Hỗ trợ</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Hướng dẫn
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  FAQs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="mb-3">Công ty</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Về chúng tôi
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Blog
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Điều khoản
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;