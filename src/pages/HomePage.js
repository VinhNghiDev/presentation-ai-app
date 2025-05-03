import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const HomePage = ({ isLoggedIn, setIsLoggedIn }) => {
  // Tính năng chính
  const features = [
    { 
      icon: "bi bi-magic", 
      title: "AI Thông Minh", 
      description: "Tạo bài thuyết trình tự động với AI. Tiết kiệm thời gian và công sức."
    },
    { 
      icon: "bi bi-layout-text-window", 
      title: "Template Đa Dạng", 
      description: "Hàng trăm mẫu chuyên nghiệp sẵn có cho các ngành nghề khác nhau."
    },
    { 
      icon: "bi bi-share", 
      title: "Chia Sẻ Dễ Dàng", 
      description: "Xuất file dưới nhiều định dạng và chia sẻ trực tiếp qua link."
    },
    { 
      icon: "bi bi-people", 
      title: "Làm Việc Nhóm", 
      description: "Cộng tác real-time và làm việc cùng đồng nghiệp trên một bài thuyết trình."
    }
  ];

  // Các bước đơn giản để sử dụng
  const steps = [
    {
      number: "01",
      title: "Tạo tài khoản",
      description: "Đăng ký và tạo tài khoản miễn phí trong vài giây."
    },
    {
      number: "02",
      title: "Chọn chủ đề",
      description: "Nhập chủ đề cho bài thuyết trình hoặc chọn template có sẵn."
    },
    {
      number: "03",
      title: "AI tạo nội dung",
      description: "AI sẽ tự động tạo nội dung và bố cục dựa trên chủ đề của bạn."
    },
    {
      number: "04",
      title: "Tùy chỉnh & Chia sẻ",
      description: "Chỉnh sửa theo ý muốn và xuất file hoặc chia sẻ trực tiếp."
    }
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">Tạo Bài Thuyết Trình Chuyên Nghiệp với AI</h1>
              <p className="lead mb-4">
                Tiết kiệm thời gian và công sức với công cụ tạo slide AI thông minh. 
                Tạo bài thuyết trình ấn tượng chỉ trong vài phút.
              </p>
              <div className="d-flex gap-3">
                <Link 
                  to={isLoggedIn ? "/editor" : "/login"} 
                  className="btn btn-primary btn-lg px-4"
                >
                  Bắt đầu ngay
                </Link>
                <a href="#features" className="btn btn-outline-secondary btn-lg px-4">
                  Tìm hiểu thêm
                </a>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <img 
                src="https://placehold.co/600x400?text=AI+Presentation" 
                alt="AI Presentation Demo" 
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container py-5" id="features">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Tính năng nổi bật</h2>
          <p className="lead text-muted">
            Công cụ hỗ trợ tạo bài thuyết trình thông minh với AI
          </p>
        </div>
        
        <div className="row g-4">
          {features.map((feature, index) => (
            <div className="col-md-6 col-lg-3" key={index}>
              <div className="card h-100 border-0 shadow-sm feature-card">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                    <i className={`${feature.icon} fs-4 text-primary`}></i>
                  </div>
                  <h5 className="card-title mb-3">{feature.title}</h5>
                  <p className="card-text text-muted">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Cách thức hoạt động</h2>
            <p className="lead text-muted">
              Chỉ với vài bước đơn giản, bạn đã có ngay bài thuyết trình ấn tượng
            </p>
          </div>
          
          <div className="row">
            {steps.map((step, index) => (
              <div className="col-md-6 col-lg-3 mb-4" key={index}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="display-5 fw-bold text-primary mb-3">{step.number}</div>
                    <h5 className="mb-3">{step.title}</h5>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Call To Action */}
      <div className="bg-primary text-white py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Sẵn sàng tạo bài thuyết trình đầu tiên?</h2>
          <p className="mb-4">
            Hàng nghìn người dùng đã tiết kiệm thời gian với công cụ của chúng tôi. Bạn thì sao?
          </p>
          <Link 
            to={isLoggedIn ? "/editor" : "/login"} 
            className="btn btn-light btn-lg"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default HomePage;