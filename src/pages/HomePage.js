import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './HomePage.css';

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

  // Giả lập các testimonials
  const testimonials = [
    {
      quote: "Công cụ này đã tiết kiệm cho tôi hàng giờ làm việc. Giờ đây, việc tạo bài thuyết trình chỉ còn là chuyện nhỏ!",
      author: "Nguyễn Văn A",
      role: "Marketing Manager",
      avatar: "https://i.pravatar.cc/100?img=1"
    },
    {
      quote: "Template đa dạng và đẹp mắt. Tôi đã sử dụng AI Presentation cho tất cả các buổi thuyết trình của mình.",
      author: "Trần Thị B",
      role: "Giáo viên",
      avatar: "https://i.pravatar.cc/100?img=5"
    },
    {
      quote: "Tính năng cộng tác nhóm giúp team của tôi làm việc hiệu quả hơn rất nhiều. Tuyệt vời!",
      author: "Lê Văn C",
      role: "Team Lead",
      avatar: "https://i.pravatar.cc/100?img=8"
    }
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <span className="badge rounded-pill">Mới ra mắt <span className="ms-1">✨</span></span>
              <h1 className="hero-title">Tạo bài thuyết trình đẹp mắt với <span className="text-gradient">AI</span></h1>
              <p className="hero-subtitle">
                Công cụ thông minh giúp bạn thiết kế bài thuyết trình chuyên nghiệp chỉ trong vài phút. 
                Được hỗ trợ bởi AI tiên tiến.
              </p>
              <div className="hero-buttons">
                <Link 
                  to={isLoggedIn ? "/editor" : "/login"} 
                  className="btn btn-primary btn-lg rounded-pill"
                >
                  Bắt đầu miễn phí
                </Link>
                <a href="#features" className="btn btn-link btn-lg text-decoration-none ms-2">
                  Xem tính năng <i className="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              
              <div className="hero-stats">
                <div className="hero-stat-item">
                  <div className="hero-stat-number">10M+</div>
                  <div className="hero-stat-label">Người dùng</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-number">500K+</div>
                  <div className="hero-stat-label">Bài thuyết trình</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-number">98%</div>
                  <div className="hero-stat-label">Hài lòng</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image-container">
                <img 
                  src="https://placehold.co/600x400?text=AI+Presentation" 
                  alt="AI Presentation Demo" 
                  className="hero-image"
                />
                <div className="hero-blob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Brands Section */}
      <div className="brands-section">
        <div className="container text-center">
          <p className="text-muted mb-4">Được tin dùng bởi hàng nghìn doanh nghiệp hàng đầu</p>
          <div className="brands-grid">
            <div className="brand-item">
              <img src="https://placehold.co/120x40?text=BRAND" alt="Brand 1" />
            </div>
            <div className="brand-item">
              <img src="https://placehold.co/120x40?text=BRAND" alt="Brand 2" />
            </div>
            <div className="brand-item">
              <img src="https://placehold.co/120x40?text=BRAND" alt="Brand 3" />
            </div>
            <div className="brand-item">
              <img src="https://placehold.co/120x40?text=BRAND" alt="Brand 4" />
            </div>
            <div className="brand-item">
              <img src="https://placehold.co/120x40?text=BRAND" alt="Brand 5" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="features-section" id="features">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill mb-2">Tính năng <span className="ms-1">🚀</span></span>
            <h2 className="section-title">Mọi thứ bạn cần cho bài thuyết trình hoàn hảo</h2>
            <p className="section-subtitle">
              Công cụ thông minh với đầy đủ tính năng giúp bạn tạo bài thuyết trình chuyên nghiệp
            </p>
          </div>
          
          <div className="row">
            {features.map((feature, index) => (
              <div className="col-md-6 col-lg-3 mb-4" key={index}>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Demo Section */}
      <div className="demo-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4 mb-lg-0">
              <span className="badge rounded-pill mb-2">Dễ dàng sử dụng <span className="ms-1">💡</span></span>
              <h2 className="section-title">Giao diện trực quan, dễ sử dụng</h2>
              <p className="section-subtitle mb-4">
                Không cần kiến thức thiết kế. Giao diện kéo thả đơn giản giúp bạn tạo slide chuyên nghiệp trong tích tắc.
              </p>
              
              <ul className="feature-list">
                <li className="feature-list-item">
                  <i className="bi bi-check-circle-fill text-primary me-2"></i>
                  Giao diện kéo thả trực quan
                </li>
                <li className="feature-list-item">
                  <i className="bi bi-check-circle-fill text-primary me-2"></i>
                  Tích hợp AI giúp tạo nội dung tự động
                </li>
                <li className="feature-list-item">
                  <i className="bi bi-check-circle-fill text-primary me-2"></i>
                  Thư viện template đa dạng, phong phú
                </li>
                <li className="feature-list-item">
                  <i className="bi bi-check-circle-fill text-primary me-2"></i>
                  Xuất file với nhiều định dạng khác nhau
                </li>
              </ul>
              
              <Link to={isLoggedIn ? "/editor" : "/login"} className="btn btn-primary rounded-pill mt-3">
                Trải nghiệm ngay
              </Link>
            </div>
            <div className="col-lg-7">
              <div className="demo-image-container">
                <img 
                  src="https://placehold.co/800x500?text=Interface+Demo" 
                  alt="Interface Demo" 
                  className="demo-image img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="how-it-works-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill mb-2">Quy trình <span className="ms-1">⚡</span></span>
            <h2 className="section-title">Sử dụng trong 4 bước đơn giản</h2>
            <p className="section-subtitle">
              Từ ý tưởng đến bài thuyết trình hoàn chỉnh chưa bao giờ dễ dàng đến thế
            </p>
          </div>
          
          <div className="steps-timeline">
            {steps.map((step, index) => (
              <div className="step-item" key={index}>
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill mb-2">Khách hàng nói gì <span className="ms-1">❤️</span></span>
            <h2 className="section-title">Những đánh giá từ người dùng</h2>
            <p className="section-subtitle">
              Hãy nghe những chia sẻ từ cộng đồng người dùng của chúng tôi
            </p>
          </div>
          
          <div className="row">
            {testimonials.map((testimonial, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="testimonial-card">
                  <div className="testimonial-quote">
                    <i className="bi bi-quote"></i>
                    <p>{testimonial.quote}</p>
                  </div>
                  <div className="testimonial-author">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author} 
                      className="testimonial-avatar"
                    />
                    <div>
                      <div className="testimonial-name">{testimonial.author}</div>
                      <div className="testimonial-role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Call To Action */}
      <div className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Sẵn sàng tạo bài thuyết trình đầu tiên?</h2>
          <p className="cta-subtitle">
            Bắt đầu ngay hôm nay với tài khoản miễn phí và khám phá sức mạnh của AI trong việc tạo bài thuyết trình
          </p>
          <Link 
            to={isLoggedIn ? "/editor" : "/login"} 
            className="btn btn-primary btn-lg rounded-pill"
          >
            Bắt đầu miễn phí
          </Link>
          <p className="cta-note">Không cần thẻ tín dụng. Đăng ký trong 2 phút.</p>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default HomePage;