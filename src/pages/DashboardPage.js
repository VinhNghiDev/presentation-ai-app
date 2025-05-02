import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const DashboardPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  // Mock data
  const presentations = [
    { id: 1, title: "Marketing Plan 2025", lastModified: "2 giờ trước" },
    { id: 2, title: "Product Launch", lastModified: "1 ngày trước" },
    { id: 3, title: "Team Meeting", lastModified: "3 ngày trước" }
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Bài thuyết trình của tôi</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/editor')}
          >
            Tạo mới
          </button>
        </div>
        
        <div className="row">
          {presentations.map((presentation) => (
            <div className="col-md-4 mb-4" key={presentation.id}>
              <div className="card">
                <div className="card-img-top bg-light" style={{height: "160px"}}>
                  {/* Placeholder for thumbnail */}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{presentation.title}</h5>
                  <p className="card-text text-muted small">
                    <i className="bi bi-clock"></i> {presentation.lastModified}
                  </p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/editor`)}
                  >
                    Chỉnh sửa
                  </button>
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

export default DashboardPage;