// src/components/Editor/EnhancedTemplateSelector.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Nav, Tab, Card, Badge, Form } from 'react-bootstrap';
import { TEMPLATE_CATEGORIES, getAllTemplates } from '../../utils/enhancedTemplates';

/**
 * Enhanced Template Selector Component
 * @param {Object} props
 * @param {Function} props.onSelectTemplate - Callback khi chọn template
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {string} props.currentTemplateId - ID template hiện tại (nếu có)
 */
const EnhancedTemplateSelector = ({ onSelectTemplate, onClose, currentTemplateId }) => {
  // State cho tab đang hoạt động
  const [activeCategory, setActiveCategory] = useState('all');
  
  // State cho template được chọn
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplateId || '');

  // State cho các template có sẵn
  const [templates, setTemplates] = useState([]);
  
  // State cho chế độ xem (grid hoặc list)
  const [viewMode, setViewMode] = useState('grid');
  
  // State cho tìm kiếm template
  const [searchQuery, setSearchQuery] = useState('');

  // State cho xem trước template đầy đủ
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // State cho tùy chỉnh template
  const [customizeMode, setCustomizeMode] = useState(false);
  const [customizedTemplate, setCustomizedTemplate] = useState(null);
  
  // Thêm state cho ngành nghề cụ thể
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  
  // Thêm state cho mục đích sử dụng
  const [selectedPurpose, setSelectedPurpose] = useState('all');

  // Tải danh sách template
  useEffect(() => {
    const allTemplates = getAllTemplates();
    setTemplates(allTemplates);
    
    // Nếu chưa có template được chọn, chọn template đầu tiên
    if (!selectedTemplate && allTemplates.length > 0) {
      setSelectedTemplate(allTemplates[0].id);
    }
  }, []);

  // Lọc template theo nhiều tiêu chí
  const getFilteredTemplates = () => {
    let filtered = templates;
    
    // Lọc theo danh mục
    if (activeCategory !== 'all') {
      filtered = filtered.filter(template => template.category === activeCategory);
    }
    
    // Lọc theo ngành nghề
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(template => template.industry === selectedIndustry);
    }
    
    // Lọc theo mục đích sử dụng
    if (selectedPurpose !== 'all') {
      filtered = filtered.filter(template => template.purpose === selectedPurpose);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Xử lý khi chọn template
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    
    // Lấy template chi tiết để hiển thị trong chế độ xem trước
    const selectedTemplateDetails = templates.find(t => t.id === templateId);
    setPreviewTemplate(null); // Reset preview
    setCustomizedTemplate(null); // Reset customize
    setCustomizeMode(false); // Reset customize mode
  };

  // Xử lý khi xem trước template đầy đủ
  const handlePreviewTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setPreviewTemplate(template);
    }
  };

  // Xử lý khi tùy chỉnh template
  const handleCustomizeTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      setCustomizedTemplate({...template});
      setCustomizeMode(true);
    }
  };

  // Xử lý khi cập nhật template tùy chỉnh
  const handleUpdateCustomizedTemplate = (field, value) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý khi cập nhật màu sắc template
  const handleUpdateCustomizedColors = (colorType, value) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      }
    }));
  };

  // Xử lý khi hoàn thành
  const handleComplete = () => {
    const templateToUse = customizeMode && customizedTemplate 
      ? customizedTemplate 
      : templates.find(t => t.id === selectedTemplate);
      
    if (templateToUse && onSelectTemplate) {
      onSelectTemplate(templateToUse);
    }
  };

  // Danh sách template đã lọc
  const filteredTemplates = getFilteredTemplates();
  
  // Danh sách ngành nghề
  const INDUSTRY_OPTIONS = [
    { id: 'all', name: 'Tất cả ngành' },
    { id: 'business', name: 'Kinh doanh' },
    { id: 'education', name: 'Giáo dục' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'tech', name: 'Công nghệ' },
    { id: 'medical', name: 'Y tế' },
    { id: 'finance', name: 'Tài chính' },
    { id: 'creative', name: 'Sáng tạo' },
    { id: 'scientific', name: 'Khoa học' },
    { id: 'nonprofit', name: 'Phi lợi nhuận' }
  ];
  
  // Danh sách mục đích sử dụng
  const PURPOSE_OPTIONS = [
    { id: 'all', name: 'Tất cả mục đích' },
    { id: 'presentation', name: 'Thuyết trình' },
    { id: 'report', name: 'Báo cáo' },
    { id: 'proposal', name: 'Đề xuất' },
    { id: 'pitch', name: 'Thuyết trình dự án' },
    { id: 'training', name: 'Đào tạo' },
    { id: 'thesis', name: 'Luận văn' },
    { id: 'infographic', name: 'Đồ họa thông tin' },
    { id: 'portfolio', name: 'Portfolio' }
  ];

  // Render xem trước template chi tiết hơn
  const renderTemplatePreview = (template) => {
    return (
      <div className="template-preview-container p-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">{template.name}</h4>
          <div>
            <Badge bg="primary" className="me-2">{template.category}</Badge>
            <Badge bg="secondary" className="me-2">{template.industry}</Badge>
            <Badge bg="info">{template.purpose}</Badge>
          </div>
        </div>
        
        <p className="text-muted mb-4">{template.description}</p>
        
        <div className="d-flex justify-content-center mb-4">
          <div 
            className="template-preview-slide" 
            style={{ 
              width: '520px',
              height: '320px',
              backgroundColor: template.colors.background,
              color: template.colors.text,
              fontFamily: template.fontFamily,
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div 
              style={{ 
                backgroundColor: template.colors.primary,
                color: template.colors.headerText,
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px'
              }}
            >
              <h2 style={{margin: 0}}>Tiêu đề Slide Mẫu</h2>
              <small>Tiêu đề phụ & thông tin bổ sung</small>
            </div>
            
            <div 
              style={{
                display: 'flex',
                gap: '20px'
              }}
            >
              <div style={{flex: '2'}}>
                <ul style={{fontSize: '1.1rem'}}>
                  <li>Nội dung chính của bài thuyết trình</li>
                  <li>Thông tin quan trọng cần trình bày</li>
                  <li>Dữ liệu và phân tích chi tiết</li>
                  <li>Tổng kết và kết luận</li>
                </ul>
              </div>
              
              <div 
                style={{
                  flex: '1',
                  backgroundColor: template.colors.secondary || '#f5f5f5',
                  padding: '15px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '0.8rem', marginBottom: '5px'}}>Vị trí ảnh</div>
                  <div 
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto',
                      border: `2px solid ${template.colors.primary}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="bi bi-image" style={{fontSize: '1.5rem'}}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mb-4">
          {/* Các slide con trong template */}
          {template.slideVariants && template.slideVariants.map((variant, index) => (
            <div className="col-4" key={index}>
              <div 
                className="variant-preview" 
                style={{ 
                  height: '120px',
                  backgroundColor: template.colors.background,
                  color: template.colors.text,
                  fontFamily: template.fontFamily,
                  padding: '10px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontSize: '0.7rem',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    backgroundColor: template.colors.primary,
                    color: template.colors.headerText,
                    padding: '5px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    fontSize: '0.8rem'
                  }}
                >
                  {variant.name}
                </div>
                
                <div style={{fontSize: '0.6rem'}}>
                  {variant.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={() => setPreviewTemplate(null)}>
            Quay lại
          </Button>
          <Button variant="primary" onClick={() => handleCustomizeTemplate()}>
            Tùy chỉnh mẫu này
          </Button>
        </div>
      </div>
    );
  };

  // Render form tùy chỉnh template
  const renderCustomizeForm = () => {
    if (!customizedTemplate) return null;
    
    return (
      <div className="template-customize-container p-3">
        <h4 className="mb-4">Tùy chỉnh mẫu "{customizedTemplate.name}"</h4>
        
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên bộ mẫu</Form.Label>
                <Form.Control 
                  type="text" 
                  value={customizedTemplate.name} 
                  onChange={(e) => handleUpdateCustomizedTemplate('name', e.target.value)}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Font chữ</Form.Label>
                <Form.Select 
                  value={customizedTemplate.fontFamily} 
                  onChange={(e) => handleUpdateCustomizedTemplate('fontFamily', e.target.value)}
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Open Sans, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Courier New, monospace">Courier New</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Màu nền</Form.Label>
                <div className="d-flex">
                  <Form.Control 
                    type="color" 
                    value={customizedTemplate.colors.background}
                    onChange={(e) => handleUpdateCustomizedColors('background', e.target.value)}
                    className="me-2"
                  />
                  <Form.Control 
                    type="text" 
                    value={customizedTemplate.colors.background}
                    onChange={(e) => handleUpdateCustomizedColors('background', e.target.value)}
                  />
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Màu chính</Form.Label>
                <div className="d-flex">
                  <Form.Control 
                    type="color" 
                    value={customizedTemplate.colors.primary}
                    onChange={(e) => handleUpdateCustomizedColors('primary', e.target.value)}
                    className="me-2"
                  />
                  <Form.Control 
                    type="text" 
                    value={customizedTemplate.colors.primary}
                    onChange={(e) => handleUpdateCustomizedColors('primary', e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Màu văn bản</Form.Label>
                <div className="d-flex">
                  <Form.Control 
                    type="color" 
                    value={customizedTemplate.colors.text}
                    onChange={(e) => handleUpdateCustomizedColors('text', e.target.value)}
                    className="me-2"
                  />
                  <Form.Control 
                    type="text" 
                    value={customizedTemplate.colors.text}
                    onChange={(e) => handleUpdateCustomizedColors('text', e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Màu văn bản tiêu đề</Form.Label>
                <div className="d-flex">
                  <Form.Control 
                    type="color" 
                    value={customizedTemplate.colors.headerText}
                    onChange={(e) => handleUpdateCustomizedColors('headerText', e.target.value)}
                    className="me-2"
                  />
                  <Form.Control 
                    type="text" 
                    value={customizedTemplate.colors.headerText}
                    onChange={(e) => handleUpdateCustomizedColors('headerText', e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Màu phụ</Form.Label>
            <div className="d-flex">
              <Form.Control 
                type="color" 
                value={customizedTemplate.colors.secondary || '#f5f5f5'}
                onChange={(e) => handleUpdateCustomizedColors('secondary', e.target.value)}
                className="me-2"
              />
              <Form.Control 
                type="text" 
                value={customizedTemplate.colors.secondary || '#f5f5f5'}
                onChange={(e) => handleUpdateCustomizedColors('secondary', e.target.value)}
              />
            </div>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Xem trước</Form.Label>
            <div 
              className="preview-box p-3 mb-3"
              style={{ 
                backgroundColor: customizedTemplate.colors.background,
                color: customizedTemplate.colors.text,
                fontFamily: customizedTemplate.fontFamily,
                borderRadius: '6px'
              }}
            >
              <div 
                className="p-2 mb-2"
                style={{ 
                  backgroundColor: customizedTemplate.colors.primary,
                  color: customizedTemplate.colors.headerText,
                  borderRadius: '4px'
                }}
              >
                Tiêu đề mẫu
              </div>
              <p className="mb-0">Đây là mẫu văn bản để xem trước bộ màu và font chữ của bạn.</p>
            </div>
          </Form.Group>
          
          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={() => {
              setCustomizeMode(false);
              setCustomizedTemplate(null);
            }}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleComplete}>
              Áp dụng & Hoàn thành
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <Modal show={true} onHide={onClose} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Chọn mẫu thiết kế chuyên nghiệp</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        {previewTemplate ? (
          renderTemplatePreview(previewTemplate)
        ) : customizeMode && customizedTemplate ? (
          renderCustomizeForm()
        ) : (
          <Tab.Container activeKey={activeCategory} onSelect={key => setActiveCategory(key)}>
            <Row className="g-0">
              <Col md={3} className="border-end">
                <div className="p-3">
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm mẫu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Ngành nghề</Form.Label>
                    <Form.Select 
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                    >
                      {INDUSTRY_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Mục đích sử dụng</Form.Label>
                    <Form.Select 
                      value={selectedPurpose}
                      onChange={(e) => setSelectedPurpose(e.target.value)}
                    >
                      {PURPOSE_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label>Danh mục</Form.Label>
                    </div>
                    <div>
                      <Button 
                        variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} 
                        size="sm"
                        className="me-1"
                        onClick={() => setViewMode('grid')}
                      >
                        <i className="bi bi-grid"></i>
                      </Button>
                      <Button 
                        variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <i className="bi bi-list"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                      <Nav.Link eventKey="all">Tất cả mẫu</Nav.Link>
                    </Nav.Item>
                    {TEMPLATE_CATEGORIES.map(category => (
                      <Nav.Item key={category.id}>
                        <Nav.Link eventKey={category.id}>{category.name}</Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </div>
              </Col>
              
              <Col md={9}>
                <div className="p-3">
                  <Tab.Content>
                    <Tab.Pane eventKey={activeCategory} active>
                      {filteredTemplates.length > 0 ? (
                        <Row className="g-3">
                          {filteredTemplates.map(template => (
                            <Col key={template.id} md={viewMode === 'grid' ? 4 : 12}>
                              <Card 
                                className={`template-card h-100 ${selectedTemplate === template.id ? 'border-primary' : ''}`}
                                onClick={() => handleSelectTemplate(template.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Card.Body className="p-2">
                                  {viewMode === 'grid' ? (
                                    // Hiển thị dạng lưới
                                    <>
                                      <div 
                                        className="template-preview mb-2" 
                                        style={{ 
                                          height: '120px',
                                          backgroundColor: template.colors.background,
                                          borderRadius: '4px',
                                          overflow: 'hidden',
                                          position: 'relative'
                                        }}
                                      >
                                        <div
                                          style={{ 
                                            backgroundColor: template.colors.primary,
                                            color: template.colors.headerText,
                                            padding: '8px',
                                            fontFamily: template.fontFamily,
                                            fontSize: '0.8rem'
                                          }}
                                        >
                                          {template.name}
                                        </div>
                                        <div
                                          className="p-2"
                                          style={{ 
                                            color: template.colors.text,
                                            fontFamily: template.fontFamily,
                                            fontSize: '0.7rem'
                                          }}
                                        >
                                          <ul className="ps-3 mb-0">
                                            <li>Nội dung mẫu</li>
                                            <li>Thiết kế chuyên nghiệp</li>
                                          </ul>
                                        </div>
                                        
                                        <div className="position-absolute bottom-0 end-0 p-1">
                                          <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePreviewTemplate(template.id);
                                            }}
                                          >
                                            <i className="bi bi-eye"></i>
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                          <Card.Title className="mb-0 fs-6">{template.name}</Card.Title>
                                        </div>
                                        <Badge bg="secondary">{template.category}</Badge>
                                      </div>
                                    </>
                                  ) : (
                                    // Hiển thị dạng danh sách
                                    <Row>
                                      <Col md={3}>
                                        <div 
                                          className="template-preview h-100" 
                                          style={{ 
                                            backgroundColor: template.colors.background,
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                          }}
                                        >
                                          <div
                                            style={{ 
                                              backgroundColor: template.colors.primary,
                                              color: template.colors.headerText,
                                              padding: '4px 8px',
                                              fontFamily: template.fontFamily,
                                              fontSize: '0.7rem'
                                            }}
                                          >
                                            Header
                                          </div>
                                        </div>
                                      </Col>
                                      <Col md={9}>
                                        <div className="d-flex justify-content-between">
                                          <Card.Title className="mb-1 fs-6">{template.name}</Card.Title>
                                          <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePreviewTemplate(template.id);
                                            }}
                                          >
                                            Xem trước
                                          </Button>
                                        </div>
                                        <p className="mb-1 small text-muted">{template.description}</p>
                                        <div>
                                          <Badge bg="secondary" className="me-1">{template.category}</Badge>
                                          <Badge bg="info" className="me-1">{template.industry}</Badge>
                                          {template.tags.slice(0, 2).map((tag, idx) => (
                                            <Badge bg="light" text="dark" key={idx} className="me-1">{tag}</Badge>
                                          ))}
                                        </div>
                                      </Col>
                                    </Row>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <div className="text-center py-5">
                          <p className="mb-0">Không tìm thấy mẫu phù hợp với tiêu chí của bạn.</p>
                        </div>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </Col>
            </Row>
          </Tab.Container>
        )}
      </Modal.Body>
      
      {!previewTemplate && !customizeMode && (
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              <small className="text-muted">
                {filteredTemplates.length} mẫu phù hợp
              </small>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={onClose} className="me-2">
                Hủy
              </Button>
              <Button 
                variant="primary" 
                onClick={handleComplete}
                disabled={!selectedTemplate}
              >
                Chọn mẫu
              </Button>
            </div>
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default EnhancedTemplateSelector;