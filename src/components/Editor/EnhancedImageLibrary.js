// src/components/Editor/EnhancedImageLibrary.js
import React, { useState, useEffect } from 'react';
import { 
  searchUnsplashImages, 
  getImageCategories, 
  uploadImageFromComputer, 
  getUnsplashApiKey, 
  setUnsplashApiKey,
  getSampleImages
} from '../../services/imageService';

/**
 * Component thư viện hình ảnh nâng cao
 * @param {Object} props - Props component
 * @param {function} props.onSelectImage - Callback khi chọn hình ảnh
 * @param {function} props.onClose - Callback khi đóng thư viện
 */
const EnhancedImageLibrary = ({ onSelectImage, onClose }) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  
  // Lấy categories và API key khi component được tạo
  useEffect(() => {
    const imageCategories = getImageCategories();
    setCategories(imageCategories);
    
    const savedApiKey = getUnsplashApiKey();
    setApiKey(savedApiKey);
    
    // Tải hình ảnh mẫu nếu không có API key
    if (!savedApiKey) {
      const sampleImages = getSampleImages('all', 12);
      setImages(sampleImages);
    } else {
      loadImages();
    }
  }, []);
  
  /**
   * Tải hình ảnh từ API hoặc mẫu
   * @param {boolean} reset - Reset danh sách hình ảnh?
   */
  const loadImages = async (reset = false) => {
    try {
      setIsLoading(true);
      setError('');
      
      const newPage = reset ? 1 : page;
      const query = searchQuery.trim() || 
        (selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.sample : 'presentation');
      
      // Kiểm tra API key
      const currentApiKey = getUnsplashApiKey();
      if (!currentApiKey) {
        // Sử dụng hình ảnh mẫu
        const sampleImages = getSampleImages(selectedCategory, 12);
        setImages(reset ? sampleImages : [...images, ...sampleImages]);
        setHasMore(false);
        return;
      }
      
      // Tìm kiếm hình ảnh từ Unsplash
      const results = await searchUnsplashImages(query, {
        page: newPage,
        perPage: 20,
        orientation: 'landscape'
      });
      
      if (results.length === 0) {
        setHasMore(false);
      } else {
        setPage(newPage + 1);
        setImages(reset ? results : [...images, ...results]);
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setError(error.message || 'Có lỗi khi tải hình ảnh');
      // Sử dụng hình ảnh mẫu khi có lỗi
      const sampleImages = getSampleImages(selectedCategory, 12);
      setImages(reset ? sampleImages : [...images, ...sampleImages]);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Xử lý khi thay đổi danh mục
   * @param {string} categoryId - ID danh mục
   */
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setImages([]);
    setPage(1);
    setHasMore(true);
    
    setTimeout(() => {
      loadImages(true);
    }, 100);
  };
  
  /**
   * Xử lý khi tìm kiếm
   * @param {Object} e - Event
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setImages([]);
    setPage(1);
    setHasMore(true);
    loadImages(true);
  };
  
  /**
   * Xử lý khi lưu API key
   * @param {Object} e - Event
   */
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setUnsplashApiKey(apiKey);
    setShowApiKeyForm(false);
    setImages([]);
    setPage(1);
    loadImages(true);
  };
  
  /**
   * Xử lý khi tải thêm hình ảnh
   */
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadImages();
    }
  };
  
  /**
   * Xử lý khi tải hình ảnh từ máy tính
   */
  const handleUploadImage = () => {
    uploadImageFromComputer(imageData => {
      onSelectImage(imageData);
    });
  };
  
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Thư viện hình ảnh</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Form API key */}
            {showApiKeyForm && (
              <div className="card mb-3">
                <div className="card-body">
                  <form onSubmit={handleSaveApiKey}>
                    <div className="mb-3">
                      <label htmlFor="unsplashApiKey" className="form-label">Unsplash API Key</label>
                      <input
                        type="text"
                        className="form-control"
                        id="unsplashApiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Nhập API key của bạn"
                      />
                      <div className="form-text">
                        Bạn có thể lấy API key miễn phí từ <a href="https://unsplash.com/developers" target="_blank" rel="noreferrer">Unsplash Developers</a>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="btn btn-secondary me-2" onClick={() => setShowApiKeyForm(false)}>Hủy</button>
                      <button type="submit" className="btn btn-primary">Lưu</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Thanh công cụ */}
            <div className="mb-3 d-flex">
              <form className="flex-grow-1 me-2" onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm hình ảnh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
              
              <button 
                className="btn btn-outline-primary me-2" 
                onClick={handleUploadImage}
                title="Tải lên từ máy tính"
              >
                <i className="bi bi-upload"></i>
              </button>
              
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                title="Cài đặt API key"
              >
                <i className="bi bi-gear"></i>
              </button>
            </div>
            
            {/* Thông báo lỗi */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {/* Danh mục */}
            <div className="mb-3">
              <div className="btn-group flex-wrap">
                <button 
                  className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  Tất cả
                </button>
                {categories.map(category => (
                  <button 
                    key={category.id}
                    className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Lưới hình ảnh */}
            <div className="row g-3">
              {images.map(image => (
                <div className="col-md-3" key={image.id}>
                  <div 
                    className="card h-100 shadow-sm image-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectImage(image)}
                  >
                    <img 
                      src={image.thumbnail || image.url} 
                      className="card-img-top" 
                      alt={image.description}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <div className="card-body p-2">
                      <p className="card-text small text-truncate">
                        {image.description}
                      </p>
                      {image.user && !image.isLocal && (
                        <p className="card-text small text-muted">
                          by {image.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading placeholder */}
              {isLoading && Array.from({ length: 4 }).map((_, index) => (
                <div className="col-md-3" key={`loading-${index}`}>
                  <div className="card h-100 shadow-sm">
                    <div className="placeholder-glow" style={{ height: '150px', backgroundColor: '#e9ecef' }} />
                    <div className="card-body p-2">
                      <p className="card-text small text-truncate">
                        <span className="placeholder col-9"></span>
                      </p>
                      <p className="card-text small text-muted">
                        <span className="placeholder col-7"></span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Nút tải thêm */}
            {hasMore && !isLoading && (
              <div className="text-center mt-4">
                <button 
                  className="btn btn-outline-primary" 
                  onClick={handleLoadMore}
                >
                  Tải thêm hình ảnh
                </button>
              </div>
            )}
            
            {/* Thông báo đang tải */}
            {isLoading && (
              <div className="text-center mt-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải hình ảnh...</p>
              </div>
            )}
            
            {/* Thông báo không có kết quả */}
            {!isLoading && images.length === 0 && (
              <div className="alert alert-info text-center" role="alert">
                Không tìm thấy hình ảnh nào. Vui lòng thử từ khóa khác.
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedImageLibrary;