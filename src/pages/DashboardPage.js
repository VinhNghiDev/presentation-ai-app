import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const DashboardPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Tải danh sách bài thuyết trình từ localStorage
    const loadPresentations = () => {
      setLoading(true);
      try {
        const savedPresentations = JSON.parse(localStorage.getItem('presentations') || '[]');
        // Sắp xếp theo thời gian chỉnh sửa gần nhất
        savedPresentations.sort((a, b) => b.lastModified - a.lastModified);
        setPresentations(savedPresentations);
      } catch (error) {
        console.error('Error loading presentations:', error);
        setPresentations([]);
      } finally {
        setLoading(false);
      }
    };

    loadPresentations();
  }, []);
  
  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài thuyết trình này?')) {
      // Xóa bài thuyết trình từ localStorage
      const savedPresentations = JSON.parse(localStorage.getItem('presentations') || '[]');
      const filteredPresentations = savedPresentations.filter(p => p.id !== id);
      localStorage.setItem('presentations', JSON.stringify(filteredPresentations));
      
      // Cập nhật state
      setPresentations(filteredPresentations);
    }
  };
  
  const handleEdit = (id) => {
    navigate(`/editor?id=${id}`);
  };
  
  const handleCreate = () => {
    navigate('/editor');
  };

  // Chức năng xem bài thuyết trình
  const handleView = (id) => {
    // Giả lập chức năng xem, thực tế có thể đi đến route riêng
    navigate(`/editor?id=${id}&view=true`);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Bài thuyết trình của tôi</h2>
          <button 
            className="btn btn-primary" 
            onClick={handleCreate}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Tạo mới
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải bài thuyết trình...</p>
          </div>
        ) : (
          <div className="row">
            {presentations.length > 0 ? (
              presentations.map((presentation) => (
                <div className="col-md-4 mb-4" key={presentation.id}>
                  <div className="card h-100 shadow-sm">
                    <div 
                      className="card-img-top bg-light d-flex align-items-center justify-content-center"
                      style={{
                        height: "160px", 
                        cursor: 'pointer',
                        backgroundColor: presentation.slides?.[0]?.template === 'dark' ? '#212121' : '#f8f9fa',
                        color: presentation.slides?.[0]?.template === 'dark' ? '#ffffff' : '#333333'
                      }}
                      onClick={() => handleEdit(presentation.id)}
                    >
                      <h5 className="m-0 p-4 text-center">{presentation.title}</h5>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{presentation.title}</h5>
                      <p className="card-text text-muted small">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(presentation.lastModified).toLocaleString()}
                      </p>
                      <p className="card-text small">
                        <span className="badge bg-secondary me-2">{presentation.slides?.length || 0} slides</span>
                      </p>
                    </div>
                    <div className="card-footer bg-white border-0">
                      <div className="d-flex">
                        <button 
                          className="btn btn-sm btn-outline-primary me-2 flex-grow-1"
                          onClick={() => handleEdit(presentation.id)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Chỉnh sửa
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleView(presentation.id)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Xem
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleDelete(presentation.id, e)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-info text-center py-5">
                  <i className="bi bi-journal-text display-4 mb-3"></i>
                  <p className="mb-3">Bạn chưa có bài thuyết trình nào.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleCreate}
                  >
                    Tạo bài thuyết trình đầu tiên
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default DashboardPage;