import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const HomePage = ({ isLoggedIn, setIsLoggedIn }) => {
  const features = [
    { icon: "✨", title: "AI Thông Minh", description: "Tạo bài thuyết trình tự động với AI" },
    { icon: "📑", title: "Template Đa Dạng", description: "Hàng trăm mẫu chuyên nghiệp sẵn có" },
    { icon: "🔗", title: "Chia Sẻ Dễ Dàng", description: "Xuất file và chia sẻ trực tiếp" },
    { icon: "👥", title: "Làm Việc Nhóm", description: "Cộng tác real-time với đồng nghiệp" }
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <div className="hero-section">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Tạo Bài Thuyết Trình Chuyên Nghiệp</h1>
          <p className="lead">Tiết kiệm thời gian với công cụ tạo slide AI thông minh</p>
          <Link 
            to={isLoggedIn ? "/editor" : "/login"} 
            className="btn btn-primary btn-lg mt-3"
          >
            Tạo Bài Thuyết Trình Ngay
          </Link>
        </div>
      </div>
      
      <div className="container my-5">
        <div className="row">
          {features.map((feature, index) => (
            <div className="col-md-3 mb-4" key={index}>
              <div className="card feature-card">
                <div className="card-body text-center">
                  <div className="display-3 mb-3">{feature.icon}</div>
                  <h5 className="card-title">{feature.title}</h5>
                  <p className="card-text">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default HomePage;