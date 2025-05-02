import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { exportToPDF, exportToPNG, exportPresentation } from '../utils/exportUtils';

// Mẫu thiết kế mặc định
const templates = [
  {
    id: 'default',
    name: 'Cơ bản',
    background: '#ffffff',
    textColor: '#333333',
    fontFamily: 'Arial, sans-serif',
    headerColor: '#1a73e8'
  },
  {
    id: 'dark',
    name: 'Tối giản',
    background: '#212121',
    textColor: '#ffffff',
    fontFamily: 'Roboto, sans-serif',
    headerColor: '#4285f4'
  },
  {
    id: 'creative',
    name: 'Sáng tạo',
    background: '#f5f5f5',
    textColor: '#333333',
    fontFamily: 'Montserrat, sans-serif',
    headerColor: '#ea4335'
  },
  {
    id: 'business',
    name: 'Doanh nghiệp',
    background: '#ffffff',
    textColor: '#1d1d1d',
    fontFamily: 'Calibri, sans-serif',
    headerColor: '#0f4c81'
  }
];

// Mẫu dữ liệu thư viện hình ảnh
const imageLibrary = [
  { id: 1, url: 'https://placehold.co/400x300?text=Business', category: 'business' },
  { id: 2, url: 'https://placehold.co/400x300?text=Marketing', category: 'business' },
  { id: 3, url: 'https://placehold.co/400x300?text=Technology', category: 'technology' },
  { id: 4, url: 'https://placehold.co/400x300?text=Innovation', category: 'technology' },
  { id: 5, url: 'https://placehold.co/400x300?text=Education', category: 'education' },
  { id: 6, url: 'https://placehold.co/400x300?text=Learning', category: 'education' },
  { id: 7, url: 'https://placehold.co/400x300?text=Nature', category: 'nature' },
  { id: 8, url: 'https://placehold.co/400x300?text=Environment', category: 'nature' }
];

const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const presentationId = queryParams.get('id');

  // States
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [presentationTitle, setPresentationTitle] = useState('Bài thuyết trình mới');
  const [currentTemplate, setCurrentTemplate] = useState(templates[0]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCategory, setImageCategory] = useState('all');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Khởi tạo bài thuyết trình
    if (presentationId) {
      // Tải bài thuyết trình từ localStorage nếu có id
      const savedPresentations = JSON.parse(localStorage.getItem('presentations') || '[]');
      const savedPresentation = savedPresentations.find(p => p.id.toString() === presentationId);
      
      if (savedPresentation) {
        setSlides(savedPresentation.slides || []);
        setPresentationTitle(savedPresentation.title);
        // Đặt template từ slide đầu tiên nếu có
        if (savedPresentation.slides && savedPresentation.slides.length > 0 && savedPresentation.slides[0].template) {
          const templateId = savedPresentation.slides[0].template;
          const template = templates.find(t => t.id === templateId) || templates[0];
          setCurrentTemplate(template);
        }
      } else {
        initNewPresentation();
      }
    } else {
      initNewPresentation();
    }
  }, [presentationId]);

  const initNewPresentation = () => {
    setSlides([{
      id: Date.now(),
      title: 'Slide 1',
      content: '',
      template: templates[0].id,
      elements: []
    }]);
    setPresentationTitle('Bài thuyết trình mới');
    setCurrentTemplate(templates[0]);
    setCurrentSlideIndex(0);
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      content: '',
      template: currentTemplate.id,
      elements: []
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = (index) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlideIndex >= newSlides.length) {
        setCurrentSlideIndex(newSlides.length - 1);
      }
    }
  };

  const updateCurrentSlide = (field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      [field]: value
    };
    setSlides(updatedSlides);
  };

  const generateAIContent = () => {
    if (!aiTopic.trim()) return;
    
    setIsGenerating(true);
    
    // Giả lập delay để tạo hiệu ứng đang xử lý
    setTimeout(() => {
      // Giả lập tạo nội dung AI
      const aiGeneratedSlides = [
        { 
          id: Date.now(), 
          title: aiTopic, 
          content: `Giới thiệu về ${aiTopic}`,
          template: currentTemplate.id,
          elements: []
        },
        { 
          id: Date.now() + 1, 
          title: 'Nội dung chính', 
          content: `Các điểm chính về ${aiTopic}:\n- ${aiTopic} là một lĩnh vực đang phát triển nhanh chóng\n- Có nhiều cơ hội và thách thức trong lĩnh vực này\n- Cần có chiến lược rõ ràng để thành công`,
          template: currentTemplate.id,
          elements: []
        },
        { 
          id: Date.now() + 2, 
          title: 'Kết luận', 
          content: `Tóm tắt và kết luận về ${aiTopic}:\n- Tầm quan trọng ngày càng tăng\n- Cần đầu tư nguồn lực phù hợp\n- Triển vọng tương lai sáng`,
          template: currentTemplate.id,
          elements: []
        }
      ];
      
      setSlides(aiGeneratedSlides);
      setCurrentSlideIndex(0);
      setPresentationTitle(aiTopic);
      setAiDialogOpen(false);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSelectTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId) || templates[0];
    setCurrentTemplate(template);
    
    // Áp dụng template cho slide hiện tại
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      template: template.id
    };
    setSlides(updatedSlides);
    
    setShowTemplateSelector(false);
  };

  const getCurrentTemplate = () => {
    if (!slides[currentSlideIndex]) return templates[0];
    const templateId = slides[currentSlideIndex].template;
    return templates.find(t => t.id === templateId) || templates[0];
  };

  const handleSave = () => {
    const presentation = {
      id: presentationId || Date.now(),
      title: presentationTitle,
      slides: slides,
      lastModified: Date.now()
    };
    
    // Lưu vào localStorage
    const savedPresentations = JSON.parse(localStorage.getItem('presentations') || '[]');
    const existingIndex = savedPresentations.findIndex(p => p.id?.toString() === presentation.id?.toString());
    
    if (existingIndex >= 0) {
      savedPresentations[existingIndex] = presentation;
    } else {
      savedPresentations.push(presentation);
    }
    
    localStorage.setItem('presentations', JSON.stringify(savedPresentations));
    
    if (!presentationId) {
      // Nếu là bài thuyết trình mới, chuyển hướng đến URL với ID mới
      navigate(`/editor?id=${presentation.id}`, { replace: true });
    }
    
    // Hiển thị thông báo đã lưu
    setSaveStatus('Đã lưu');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleExport = (format) => {
    exportPresentation(slides, templates, presentationTitle, format);
    setShowExportOptions(false);
  };

  const handleAddImage = (image) => {
    if (!slides[currentSlideIndex]) return;
    
    // Thêm hình ảnh vào nội dung của slide
    const updatedContent = `${slides[currentSlideIndex].content}\n\n[Hình ảnh: ${image.url}]`;
    
    // Cập nhật slide với hình ảnh mới
    updateCurrentSlide('content', updatedContent);
    
    // Thêm vào danh sách elements (nếu muốn quản lý riêng)
    const element = {
      id: `img-${Date.now()}`,
      type: 'image',
      url: image.url,
      position: { x: 100, y: 200 },
      size: { width: 300, height: 200 }
    };
    
    const updatedElements = [...(slides[currentSlideIndex].elements || []), element];
    updateCurrentSlide('elements', updatedElements);
    
    setShowImageLibrary(false);
  };

  // Lọc hình ảnh theo danh mục
  const filteredImages = imageCategory === 'all' 
    ? imageLibrary 
    : imageLibrary.filter(img => img.category === imageCategory);

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <nav className="navbar navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <Link to="/dashboard" className="btn btn-outline-secondary me-3">
              &larr;
            </Link>
            <input
              type="text"
              className="form-control"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              style={{ width: '300px' }}
            />
          </div>
          <div className="d-flex align-items-center">
            {saveStatus && (
              <span className="text-success me-3">{saveStatus}</span>
            )}
            <button
              className="btn btn-primary me-2"
              onClick={() => setAiDialogOpen(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span>Đang tạo...</span>
              ) : (
                <span>Tạo với AI</span>
              )}
            </button>
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={handleSave}
            >
              Lưu
            </button>
            <div className="dropdown d-inline-block">
              <button 
                className="btn btn-success" 
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                Xuất
              </button>
              {showExportOptions && (
                <div className="dropdown-menu dropdown-menu-end show">
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('pdf')}
                  >
                    Xuất PDF
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('png')}
                  >
                    Xuất PNG
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Editor Area */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Slide List */}
        <div className="bg-light p-3" style={{ width: "250px", overflowY: "auto" }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              id={`slide-preview-${slide.id}`}
              className={`p-3 mb-2 rounded shadow-sm ${currentSlideIndex === index ? 'border border-primary' : ''}`}
              style={{ 
                cursor: 'pointer',
                backgroundColor: (templates.find(t => t.id === slide.template) || templates[0]).background,
                color: (templates.find(t => t.id === slide.template) || templates[0]).textColor
              }}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-truncate">{slide.title}</span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(index);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <button
            className="btn btn-outline-primary w-100 mt-2"
            onClick={addSlide}
          >
            + Thêm Slide
          </button>
        </div>

        {/* Editor */}
        <div className="flex-grow-1 p-4 overflow-auto">
          {slides[currentSlideIndex] && (
            <div className="card h-100">
              <div 
                className="card-body"
                style={{ 
                  backgroundColor: getCurrentTemplate().background,
                  color: getCurrentTemplate().textColor,
                  fontFamily: getCurrentTemplate().fontFamily
                }}
              >
                <input
                  type="text"
                  className="form-control form-control-lg mb-3"
                  placeholder="Tiêu đề slide"
                  value={slides[currentSlideIndex].title || ''}
                  onChange={(e) => updateCurrentSlide('title', e.target.value)}
                  style={{ 
                    backgroundColor: getCurrentTemplate().headerColor,
                    color: '#fff',
                    fontFamily: getCurrentTemplate().fontFamily
                  }}
                />
                <textarea
                  className="form-control"
                  rows="15"
                  placeholder="Nội dung slide"
                  value={slides[currentSlideIndex].content || ''}
                  onChange={(e) => updateCurrentSlide('content', e.target.value)}
                  style={{ 
                    backgroundColor: getCurrentTemplate().background,
                    color: getCurrentTemplate().textColor,
                    fontFamily: getCurrentTemplate().fontFamily
                  }}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Tools Panel */}
        <div className="bg-light p-3" style={{ width: "250px", overflowY: "auto" }}>
          <h6 className="mb-3">Công cụ</h6>
          <button 
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={() => {
              // Thêm văn bản mẫu vào slide hiện tại
              if (slides[currentSlideIndex]) {
                const currentContent = slides[currentSlideIndex].content || '';
                updateCurrentSlide('content', currentContent + '\n\nVăn bản mẫu mới');
              }
            }}
          >
            Văn bản
          </button>
          <button 
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={() => setShowImageLibrary(true)}
          >
            Hình ảnh
          </button>
          <button 
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={() => {
              // Thêm mô tả biểu đồ vào slide hiện tại
              if (slides[currentSlideIndex]) {
                const currentContent = slides[currentSlideIndex].content || '';
                updateCurrentSlide('content', currentContent + '\n\n[Biểu đồ: Biểu đồ cột dữ liệu]');
              }
            }}
          >
            Biểu đồ
          </button>
          
          <div className="mt-4 mb-4">
            <h6 className="mb-2">Template</h6>
            <select
              className="form-select"
              value={slides[currentSlideIndex]?.template || templates[0].id}
              onChange={(e) => handleSelectTemplate(e.target.value)}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          
          <hr />
          
          <h6 className="mb-3">Gợi ý AI</h6>
          <button 
            className="btn btn-primary w-100 mb-2"
            onClick={() => setAiDialogOpen(true)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span>Đang tạo...</span>
            ) : (
              <span>Tạo nội dung</span>
            )}
          </button>
          <button 
            className="btn btn-outline-primary w-100 mb-2"
            onClick={() => {
              // Giả lập cải thiện nội dung slide hiện tại
              if (slides[currentSlideIndex]) {
                const currentContent = slides[currentSlideIndex].content || '';
                const improvedContent = currentContent + 
                  '\n\n[Nội dung được cải thiện bởi AI: Thêm ví dụ cụ thể, bổ sung dữ liệu thống kê, và cấu trúc rõ ràng hơn]';
                updateCurrentSlide('content', improvedContent);
              }
            }}
          >
            Cải thiện slide
          </button>
        </div>
      </div>

      {/* AI Dialog */}
      {aiDialogOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo bài thuyết trình với AI</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAiDialogOpen(false)}
                >
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="aiTopic" className="form-label">Chủ đề bài thuyết trình</label>
                  <input
                    type="text"
                    className="form-control"
                    id="aiTopic"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Ví dụ: Chiến lược marketing 2025"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="aiTemplate" className="form-label">Template</label>
                  <select
                    className="form-select"
                    id="aiTemplate"
                    onChange={(e) => {
                      const selectedTemplate = templates.find(t => t.id === e.target.value);
                      if (selectedTemplate) setCurrentTemplate(selectedTemplate);
                    }}
                    value={currentTemplate.id}
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAiDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={generateAIContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span>Đang tạo...</span>
                  ) : (
                    <span>Tạo</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Library Dialog */}
      {showImageLibrary && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thư viện hình ảnh</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImageLibrary(false)}
                >
                </button>
              </div>
              <div className="modal-body">
                {/* Bộ lọc danh mục */}
                <div className="mb-3">
                  <div className="btn-group w-100">
                    <button 
                      className={`btn ${imageCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setImageCategory('all')}
                    >
                      Tất cả
                    </button>
                    <button 
                      className={`btn ${imageCategory === 'business' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setImageCategory('business')}
                    >
                      Kinh doanh
                    </button>
                    <button 
                      className={`btn ${imageCategory === 'technology' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setImageCategory('technology')}
                    >
                      Công nghệ
                    </button>
                    <button 
                      className={`btn ${imageCategory === 'education' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setImageCategory('education')}
                    >
                      Giáo dục
                    </button>
                  </div>
                </div>
                
                {/* Hiển thị hình ảnh */}
                <div className="row">
                  {filteredImages.map(image => (
                    <div className="col-md-4 mb-3" key={image.id}>
                      <div 
                        className="border rounded p-2 text-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleAddImage(image)}
                      >
                        <img 
                          src={image.url} 
                          alt={`Hình ${image.id}`}
                          className="img-fluid"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowImageLibrary(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;