// src/components/Editor/ImageUploader/EnhancedImageLibrary.js
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Row, Col, Form, InputGroup, Spinner, Card, Nav, Tab } from 'react-bootstrap';
import { searchUnsplashImages, uploadImageFromComputer } from '../../../services/imageService';
import UnsplashCredit from './UnsplashCredit';
import ImageCropper from './ImageCropper';

const IMAGE_CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'business', name: 'Kinh doanh' },
  { id: 'technology', name: 'Công nghệ' },
  { id: 'education', name: 'Giáo dục' },
  { id: 'nature', name: 'Thiên nhiên' },
  { id: 'food', name: 'Thực phẩm' },
  { id: 'health', name: 'Sức khỏe' },
  { id: 'travel', name: 'Du lịch' },
  { id: 'abstract', name: 'Trừu tượng' },
];

// Colors for color filter
const COLORS = [
  { name: 'black_and_white', label: 'Đen & Trắng', color: '#000000' },
  { name: 'black', label: 'Đen', color: '#000000' },
  { name: 'white', label: 'Trắng', color: '#FFFFFF' },
  { name: 'yellow', label: 'Vàng', color: '#FFEB3B' },
  { name: 'orange', label: 'Cam', color: '#FF9800' },
  { name: 'red', label: 'Đỏ', color: '#F44336' },
  { name: 'purple', label: 'Tím', color: '#9C27B0' },
  { name: 'magenta', label: 'Hồng', color: '#E91E63' },
  { name: 'green', label: 'Xanh lá', color: '#4CAF50' },
  { name: 'teal', label: 'Xanh lá đậm', color: '#009688' },
  { name: 'blue', label: 'Xanh dương', color: '#2196F3' },
];

/**
 * EnhancedImageLibrary Component
 * @param {Object} props - Component props
 * @param {Function} props.onSelectImage - Callback khi chọn hình ảnh
 * @param {Function} props.onClose - Callback khi đóng modal
 */
const EnhancedImageLibrary = ({ onSelectImage, onClose }) => {
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('search');
  
  // State cho tìm kiếm Unsplash
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [orientation, setOrientation] = useState('landscape');
  const [color, setColor] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // State cho upload hình ảnh
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // State cho my images
  const [myImages, setMyImages] = useState([]);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState(null);

  // Load các hình ảnh đã lưu khi mở modal
  useEffect(() => {
    loadMyImages();
    
    // Load hình ảnh mẫu khi tab là search
    if (activeTab === 'search') {
      handleSearch();
    }
  }, [activeTab]);

  // Hàm tải các hình ảnh đã lưu từ localStorage
  const loadMyImages = () => {
    try {
      const savedImages = JSON.parse(localStorage.getItem('my_images') || '[]');
      setMyImages(savedImages);
    } catch (error) {
      console.error('Error loading saved images:', error);
      setMyImages([]);
    }
  };

  // Hàm xử lý tìm kiếm hình ảnh
  const handleSearch = async (resetPage = true) => {
    try {
      setLoading(true);
      const newPage = resetPage ? 1 : page;
      
      // Tạo query từ searchQuery hoặc category
      let query = searchQuery.trim();
      if (!query && category !== 'all') {
        query = IMAGE_CATEGORIES.find(c => c.id === category)?.name || '';
      }
      
      // Nếu không có query, mặc định tìm hình business
      if (!query) {
        query = 'presentation background';
      }
      
      // Gọi API tìm kiếm
      const result = await searchUnsplashImages(query, {
        page: newPage,
        perPage: 20,
        orientation,
        color
      });
      
      // Cập nhật state
      if (resetPage) {
        setImages(result);
      } else {
        setImages([...images, ...result]);
      }
      
      setPage(newPage + 1);
      setHasMore(result.length === 20);
    } catch (error) {
      console.error('Error searching images:', error);
      // Trong trường hợp lỗi, hiển thị hình ảnh mẫu
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi tải thêm hình ảnh
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      handleSearch(false);
    }
  };

  // Xử lý khi upload hình ảnh
  const handleUploadImage = useCallback(async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadLoading(true);
      
      try {
        const file = files[0];
        
        // Tạo URL tạm thời cho file
        const reader = new FileReader();
        reader.onload = () => {
          const imageData = {
            id: `upload-${Date.now()}`,
            src: reader.result,
            file
          };
          
          setUploadedImage(imageData);
          setShowCropper(true);
          setUploadLoading(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadLoading(false);
      }
    }
  }, []);

  // Xử lý khi hoàn thành crop
  const handleCropComplete = (croppedImage) => {
    // Thêm vào danh sách hình ảnh của tôi
    const newImage = {
      id: `my-image-${Date.now()}`,
      url: croppedImage,
      description: 'Uploaded image',
      width: 800,
      height: 600,
      isLocal: true,
      createdAt: Date.now()
    };
    
    // Cập nhật localStorage
    const updatedImages = [...myImages, newImage];
    localStorage.setItem('my_images', JSON.stringify(updatedImages));
    
    // Cập nhật state
    setMyImages(updatedImages);
    setShowCropper(false);
    setUploadedImage(null);
    
    // Chuyển sang tab My Images
    setActiveTab('my-images');
  };

  // Xử lý khi xóa hình ảnh
  const handleDeleteImage = (imageId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này?')) {
      const updatedImages = myImages.filter(img => img.id !== imageId);
      localStorage.setItem('my_images', JSON.stringify(updatedImages));
      setMyImages(updatedImages);
    }
  };

  // Xử lý khi chọn hình ảnh
  const handleSelectImage = (image) => {
    if (onSelectImage) {
      onSelectImage(image);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="xl"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Thư viện hình ảnh</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="search">Tìm kiếm hình ảnh</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="upload">Tải lên</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="my-images">Hình ảnh của tôi</Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Tab.Content>
            {/* Tab tìm kiếm */}
            <Tab.Pane eventKey="search">
              <div className="mb-3">
                <Form onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}>
                  <Row className="align-items-end">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>Tìm kiếm hình ảnh</Form.Label>
                        <InputGroup>
                          <Form.Control 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nhập từ khóa tìm kiếm..."
                          />
                          <Button variant="primary" type="submit">
                            <i className="bi bi-search"></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Danh mục</Form.Label>
                        <Form.Select 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          {IMAGE_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Hướng</Form.Label>
                        <Form.Select 
                          value={orientation} 
                          onChange={(e) => setOrientation(e.target.value)}
                        >
                          <option value="landscape">Ngang</option>
                          <option value="portrait">Dọc</option>
                          <option value="squarish">Vuông</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Màu sắc</Form.Label>
                        <Form.Select 
                          value={color} 
                          onChange={(e) => setColor(e.target.value)}
                        >
                          <option value="">Tất cả màu</option>
                          {COLORS.map(colorOption => (
                            <option key={colorOption.name} value={colorOption.name}>
                              {colorOption.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </div>
              
              {loading && images.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Đang tải...</span>
                  </Spinner>
                  <p className="mt-3">Đang tìm kiếm hình ảnh...</p>
                </div>
              ) : (
                <>
                  {images.length === 0 ? (
                    <div className="text-center py-5">
                      <p>Không tìm thấy hình ảnh phù hợp.</p>
                    </div>
                  ) : (
                    <>
                      <Row xs={1} md={2} lg={4} className="g-3">
                        {images.map(image => (
                          <Col key={image.id}>
                            <Card className="h-100">
                              <div 
                                className="image-container"
                                style={{ 
                                  height: '200px', 
                                  overflow: 'hidden',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleSelectImage(image)}
                              >
                                <Card.Img 
                                  variant="top" 
                                  src={image.thumbnail || image.url} 
                                  alt={image.description}
                                  style={{ 
                                    objectFit: 'cover',
                                    height: '100%',
                                    width: '100%'
                                  }}
                                />
                              </div>
                              <Card.Body className="p-2">
                                <Card.Text className="small text-truncate">
                                  {image.description}
                                </Card.Text>
                                {image.user && (
                                  <UnsplashCredit user={image.user} />
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                      
                      {hasMore && (
                        <div className="text-center mt-4">
                          <Button 
                            variant="outline-primary" 
                            onClick={handleLoadMore}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Đang tải...
                              </>
                            ) : (
                              'Tải thêm hình ảnh'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Tab.Pane>
            
            {/* Tab tải lên */}
            <Tab.Pane eventKey="upload">
              <div className="text-center py-5">
                {uploadLoading ? (
                  <>
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Đang tải lên...</span>
                    </Spinner>
                    <p className="mt-3">Đang xử lý hình ảnh...</p>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <i className="bi bi-cloud-upload display-1 text-primary"></i>
                      <h4 className="mt-3">Tải lên hình ảnh của bạn</h4>
                      <p className="text-muted">
                        Hỗ trợ định dạng JPG, PNG và GIF. Kích thước tối đa 5MB.
                      </p>
                    </div>
                    
                    <div>
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="d-none"
                        onChange={handleUploadImage}
                      />
                      <label htmlFor="image-upload" className="btn btn-primary btn-lg">
                        <i className="bi bi-upload me-2"></i>
                        Chọn hình ảnh
                      </label>
                    </div>
                  </>
                )}
              </div>
              
              {/* Trình chỉnh sửa hình ảnh */}
              {showCropper && uploadedImage && (
                <ImageCropper
                  image={uploadedImage.src}
                  onComplete={handleCropComplete}
                  onCancel={() => {
                    setShowCropper(false);
                    setUploadedImage(null);
                  }}
                />
              )}
            </Tab.Pane>
            
            {/* Tab hình ảnh của tôi */}
            <Tab.Pane eventKey="my-images">
              {myImages.length === 0 ? (
                <div className="text-center py-5">
                  <p>Bạn chưa có hình ảnh nào.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setActiveTab('upload')}
                  >
                    <i className="bi bi-upload me-2"></i>
                    Tải lên hình ảnh đầu tiên
                  </Button>
                </div>
              ) : (
                <>
                  <Row xs={1} md={2} lg={4} className="g-3">
                    {myImages.map(image => (
                      <Col key={image.id}>
                        <Card className="h-100">
                          <div 
                            className="image-container position-relative"
                            style={{ 
                              height: '200px', 
                              overflow: 'hidden',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSelectImage(image)}
                          >
                            <Card.Img 
                              variant="top" 
                              src={image.url} 
                              alt={image.description}
                              style={{ 
                                objectFit: 'cover',
                                height: '100%',
                                width: '100%'
                              }}
                            />
                            
                            {/* Overlay với các nút actions */}
                            <div className="position-absolute top-0 end-0 p-2">
                              <Button
                                variant="danger"
                                size="sm"
                                className="rounded-circle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(image.id);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </div>
                          <Card.Body className="p-2">
                            <Card.Text className="small">
                              {new Date(image.createdAt).toLocaleString()}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EnhancedImageLibrary;