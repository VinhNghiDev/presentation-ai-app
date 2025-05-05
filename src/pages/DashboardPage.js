import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import TemplateSelector from '../components/Templates/TemplateSelector';
import TemplateThumbnail from '../components/Templates/TemplateThumbnail';
import './DashboardPage.css';

const DashboardPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastModified');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Template gợi ý
  const suggestedTemplates = [
    { id: 'business', name: 'Kinh doanh', color: '#0a66c2', tags: ['kinh doanh', 'chuyên nghiệp'] },
    { id: 'creative', name: 'Sáng tạo', color: '#ff7262', tags: ['sáng tạo', 'thiết kế'] },
    { id: 'education', name: 'Giáo dục', color: '#5cb85c', tags: ['giáo dục', 'đào tạo'] }
  ];
  
  useEffect(() => {
    // Tải danh sách bài thuyết trình từ localStorage
    const loadPresentations = () => {
      setLoading(true);
      try {
        const savedPresentations = JSON.parse(localStorage.getItem('presentations') || '[]');
        
        // Thêm các template ví dụ nếu không có
        if (savedPresentations.length === 0) {
          const examplePresentations = [
            {
              id: '1',
              title: 'Kế hoạch kinh doanh 2023',
              lastModified: Date.now() - 86400000 * 2, // 2 ngày trước
              slides: [{ template: 'business' }, {}, {}, {}, {}],
              tags: ['kinh doanh', 'kế hoạch'],
              favorite: true
            },
            {
              id: '2',
              title: 'Báo cáo dự án phần mềm',
              lastModified: Date.now() - 86400000 * 5, // 5 ngày trước
              slides: [{ template: 'tech' }, {}, {}, {}, {}, {}, {}],
              tags: ['công nghệ', 'báo cáo'],
              favorite: false
            },
            {
              id: '3',
              title: 'Giới thiệu sản phẩm mới',
              lastModified: Date.now() - 3600000, // 1 giờ trước
              slides: [{ template: 'marketing' }, {}, {}, {}],
              tags: ['marketing', 'sản phẩm'],
              favorite: true
            },
            {
              id: '4',
              title: 'Đào tạo nhân viên mới',
              lastModified: Date.now() - 86400000 * 10, // 10 ngày trước
              slides: [{ template: 'education' }, {}, {}, {}, {}, {}],
              tags: ['đào tạo', 'nhân sự'],
              favorite: false
            }
          ];
          
          localStorage.setItem('presentations', JSON.stringify(examplePresentations));
          setPresentations(examplePresentations);
        } else {
          setPresentations(savedPresentations);
        }
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
  const handleView = (id, e) => {
    e.stopPropagation();
    navigate(`/editor?id=${id}&view=true`);
  };
  
  // Chức năng toggle yêu thích
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    const updatedPresentations = presentations.map(p => 
      p.id === id ? {...p, favorite: !p.favorite} : p
    );
    
    localStorage.setItem('presentations', JSON.stringify(updatedPresentations));
    setPresentations(updatedPresentations);
  };

  // Lọc và sắp xếp presentations
  const getFilteredPresentations = () => {
    let filtered = [...presentations];
    
    // Lọc theo filter
    if (filter === 'favorites') {
      filtered = filtered.filter(p => p.favorite);
    } else if (filter === 'recent') {
      filtered = filtered.filter(p => p.lastModified > Date.now() - 86400000 * 7); // 7 ngày gần đây
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sắp xếp
    if (sortBy === 'lastModified') {
      filtered.sort((a, b) => b.lastModified - a.lastModified);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'slideCount') {
      filtered.sort((a, b) => (b.slides?.length || 0) - (a.slides?.length || 0));
    }
    
    return filtered;
  };

  // Định dạng thời gian
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // < 1 phút
      return 'Vừa xong';
    } else if (diff < 3600000) { // < 1 giờ
      return `${Math.floor(diff / 60000)} phút trước`;
    } else if (diff < 86400000) { // < 1 ngày
      return `${Math.floor(diff / 3600000)} giờ trước`;
    } else if (diff < 604800000) { // < 1 tuần
      return `${Math.floor(diff / 86400000)} ngày trước`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };
  
  // Lấy màu mặc định cho template
  const getTemplateColor = (template) => {
    const colors = {
      dark: '#212121',
      light: '#f8f9fa',
      business: '#0a66c2',
      creative: '#ff7262',
      tech: '#24292e',
      education: '#5cb85c',
      marketing: '#ff9900'
    };
    
    return colors[template] || '#f8f9fa';
  };

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <h4>Bài thuyết trình</h4>
            <button 
              className="new-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-plus-lg"></i>
              <span>Tạo mới</span>
            </button>
          </div>
          
          <ul className="sidebar-nav">
            <li className={filter === 'all' ? 'active' : ''}>
              <button onClick={() => setFilter('all')}>
                <i className="bi bi-grid"></i>
                <span>Tất cả bài thuyết trình</span>
              </button>
            </li>
            <li className={filter === 'recent' ? 'active' : ''}>
              <button onClick={() => setFilter('recent')}>
                <i className="bi bi-clock"></i>
                <span>Gần đây</span>
              </button>
            </li>
            <li className={filter === 'favorites' ? 'active' : ''}>
              <button onClick={() => setFilter('favorites')}>
                <i className="bi bi-star"></i>
                <span>Yêu thích</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/trash')}>
                <i className="bi bi-trash"></i>
                <span>Thùng rác</span>
              </button>
            </li>
          </ul>
          
          <div className="sidebar-section">
            <h5>Template gợi ý</h5>
            <div className="template-list">
              {suggestedTemplates.map((template, index) => (
                <div 
                  className="template-item" 
                  key={index}
                  onClick={() => {
                    navigate('/editor', { state: { template: template.id } });
                  }}
                >
                  <div className="template-preview">
                    <TemplateThumbnail template={template} size="small" />
                  </div>
                  <span>{template.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="storage-info">
            <div className="storage-text">
              <span>Dung lượng sử dụng</span>
              <span>3.2 GB / 5 GB</span>
            </div>
            <div className="storage-bar">
              <div className="storage-progress" style={{width: '64%'}}></div>
            </div>
            <button className="upgrade-btn">
              <i className="bi bi-arrow-up-circle"></i>
              Nâng cấp
            </button>
          </div>
        </div>
        
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h2>Bài thuyết trình của tôi</h2>
            
            <div className="dashboard-controls">
              <div className="search-box">
                <i className="bi bi-search"></i>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bài thuyết trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="sort-dropdown">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="lastModified">Mới nhất</option>
                  <option value="title">Tên A-Z</option>
                  <option value="slideCount">Số lượng slide</option>
                </select>
              </div>
              
              <button 
                className="view-btn"
                onClick={() => navigate('/settings')}
              >
                <i className="bi bi-gear"></i>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải bài thuyết trình...</p>
            </div>
          ) : (
            <>
              {getFilteredPresentations().length > 0 ? (
                <div className="presentation-grid">
                  {getFilteredPresentations().map((presentation) => (
                    <div 
                      className="presentation-card" 
                      key={presentation.id}
                      onClick={() => handleEdit(presentation.id)}
                    >
                      <div className="presentation-preview" 
                        style={{
                          backgroundColor: getTemplateColor(presentation.slides?.[0]?.template),
                          color: ['dark', 'tech'].includes(presentation.slides?.[0]?.template) ? 'white' : 'black'
                        }}
                      >
                        <h3>{presentation.title}</h3>
                      </div>
                      
                      <div className="presentation-info">
                        <h4 className="presentation-title">{presentation.title}</h4>
                        <div className="presentation-meta">
                          <span className="slide-count">
                            <i className="bi bi-layers"></i>
                            {presentation.slides?.length || 0} slides
                          </span>
                          <span className="time">
                            <i className="bi bi-clock"></i>
                            {formatTime(presentation.lastModified)}
                          </span>
                        </div>
                        <div className="tags">
                          {presentation.tags?.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          className={`favorite-btn ${presentation.favorite ? 'active' : ''}`}
                          onClick={(e) => toggleFavorite(presentation.id, e)}
                          title={presentation.favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                        >
                          <i className={presentation.favorite ? 'bi bi-star-fill' : 'bi bi-star'}></i>
                        </button>
                        <button 
                          className="view-btn"
                          onClick={(e) => handleView(presentation.id, e)}
                          title="Xem bài thuyết trình"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={(e) => handleDelete(presentation.id, e)}
                          title="Xóa bài thuyết trình"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <img src="https://placehold.co/200x200?text=No+Items" alt="Không có bài thuyết trình" />
                  <h3>Không tìm thấy bài thuyết trình</h3>
                  <p>
                    {searchQuery 
                      ? 'Không có kết quả phù hợp với tìm kiếm của bạn.' 
                      : 'Bạn chưa có bài thuyết trình nào trong thư mục này.'}
                  </p>
                  <button 
                    className="create-btn"
                    onClick={handleCreate}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Tạo bài thuyết trình mới
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo bài thuyết trình mới</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <TemplateSelector 
              onSelectTemplate={(template) => {
                // Tạo bài thuyết trình mới với template đã chọn
                console.log('Selected template:', template);
                navigate('/editor', { state: { template: template.id } });
              }}
              onUseAI={(prompt) => {
                // Tạo bài thuyết trình với AI dựa trên prompt
                console.log('AI prompt:', prompt);
                navigate('/editor', { state: { aiPrompt: prompt } });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;