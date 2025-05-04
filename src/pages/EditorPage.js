import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { exportToPDF, exportToPNG, exportPresentation } from '../utils/exportUtils';
import AIPresentation from '../components/AIPresentation/AIPresentation';
import { enhanceSlideContent } from '../services/openaiService';
import CollaborationPanel from '../components/Collaboration/CollaborationPanel';
import IntegrationPanel from '../components/Integration/IntegrationPanel';
import SharingPanel from '../components/Sharing/SharingPanel';

// Mẫu thiết kế mặc định
const templates = [
  {
    id: 'default',
    name: 'Cơ bản',
    background: '#ffffff',
    textColor: '#333333',
    fontFamily: 'Arial, sans-serif',
    headerColor: '#1a73e8',
    accentColor: '#e8f0fe',
    secondary: '#f8f9fa',
    thumbnail: 'https://placehold.co/200x120/1a73e8/ffffff?text=Cơ+bản'
  },
  {
    id: 'dark',
    name: 'Tối giản',
    background: '#212121',
    textColor: '#ffffff',
    fontFamily: 'Roboto, sans-serif',
    headerColor: '#4285f4',
    accentColor: '#303134',
    secondary: '#424242',
    thumbnail: 'https://placehold.co/200x120/212121/ffffff?text=Tối+giản'
  },
  {
    id: 'creative',
    name: 'Sáng tạo',
    background: '#f5f5f5',
    textColor: '#333333',
    fontFamily: 'Montserrat, sans-serif',
    headerColor: '#ea4335',
    accentColor: '#fce8e6',
    secondary: '#fafafa',
    thumbnail: 'https://placehold.co/200x120/ea4335/ffffff?text=Sáng+tạo'
  },
  {
    id: 'business',
    name: 'Doanh nghiệp',
    background: '#ffffff',
    textColor: '#1d1d1d',
    fontFamily: 'Calibri, sans-serif',
    headerColor: '#0f4c81',
    accentColor: '#e6f3ff',
    secondary: '#f8f9fa',
    thumbnail: 'https://placehold.co/200x120/0f4c81/ffffff?text=Doanh+nghiệp'
  },
  {
    id: 'nature',
    name: 'Thiên nhiên',
    background: '#f9fff5',
    textColor: '#2e5b1e',
    fontFamily: 'Georgia, serif',
    headerColor: '#54a32a',
    accentColor: '#e9f4e5',
    secondary: '#f0f7ed',
    thumbnail: 'https://placehold.co/200x120/54a32a/ffffff?text=Thiên+nhiên'
  },
  {
    id: 'tech',
    name: 'Công nghệ',
    background: '#0a192f',
    textColor: '#e6f1ff',
    fontFamily: 'Consolas, monospace',
    headerColor: '#64ffda',
    accentColor: '#172a45',
    secondary: '#112240',
    thumbnail: 'https://placehold.co/200x120/0a192f/64ffda?text=Công+nghệ'
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

// Thêm các kiểu biểu đồ
const chartTypes = [
  { id: 'bar', name: 'Biểu đồ cột', icon: 'bi-bar-chart-fill' },
  { id: 'line', name: 'Biểu đồ đường', icon: 'bi-graph-up' },
  { id: 'pie', name: 'Biểu đồ tròn', icon: 'bi-pie-chart-fill' }
];

const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const presentationId = queryParams.get('id');
  const slidePreviewRefs = useRef({});

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
  const [previewMode, setPreviewMode] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [chartData, setChartData] = useState({
    type: 'bar',
    title: 'Biểu đồ mẫu',
    labels: 'Mục 1, Mục 2, Mục 3, Mục 4',
    values: '10, 20, 30, 15'
  });
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [resizingElement, setResizingElement] = useState(null);
  const [resizeStartData, setResizeStartData] = useState(null);
  const [editingChartId, setEditingChartId] = useState(null);
  const [editingChartData, setEditingChartData] = useState(null);
  const [zIndexCounter, setZIndexCounter] = useState(1);
  const [showAIEnhanceDialog, setShowAIEnhanceDialog] = useState(false);
  const [enhancementType, setEnhancementType] = useState('content');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceApiKey, setEnhanceApiKey] = useState('');
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showIntegrationPanel, setShowIntegrationPanel] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [hasNewComments, setHasNewComments] = useState(false);
  const [showSharingPanel, setShowSharingPanel] = useState(false);

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

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setEnhanceApiKey(savedApiKey);
    }
  }, []);

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

  const handleAIGenerate = (aiData) => {
    if (!aiData || !aiData.slides || aiData.slides.length === 0) {
      return;
    }
    
    // Cập nhật tiêu đề bài thuyết trình
    setPresentationTitle(aiData.title || 'Bài thuyết trình mới');
    
    // Cài đặt các slide mới
    setSlides(aiData.slides);
    setCurrentSlideIndex(0);
    
    // Đóng dialog AI
    setAiDialogOpen(false);
    
    // Hiển thị thông báo thành công
    setSaveStatus('Bài thuyết trình đã được tạo thành công');
    setTimeout(() => setSaveStatus(''), 2000);
  };
  
  const handleEnhanceContent = async () => {
    if (!enhanceApiKey || !enhanceApiKey.startsWith('sk-')) {
      alert('Vui lòng nhập OpenAI API Key hợp lệ (bắt đầu bằng sk-)');
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      // Lưu API key vào localStorage
      localStorage.setItem('openai_api_key', enhanceApiKey);
      
      if (enhancementType === 'content') {
        // Nâng cao nội dung slide hiện tại
        const currentSlide = slides[currentSlideIndex];
        if (currentSlide) {
          setSaveStatus('Đang cải thiện nội dung slide...');
          const enhancedContent = await enhanceSlideContent(currentSlide.content, enhanceApiKey);
          
          const updatedSlides = [...slides];
          updatedSlides[currentSlideIndex] = {
            ...currentSlide,
            content: enhancedContent
          };
          
          setSlides(updatedSlides);
          setSaveStatus('Nội dung đã được cải thiện thành công');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      } else if (enhancementType === 'all') {
        // Nâng cao nội dung tất cả slide
        const updatedSlides = [...slides];
        
        for (let i = 0; i < updatedSlides.length; i++) {
          const slide = updatedSlides[i];
          // Bỏ qua slide không có nội dung
          if (!slide.content || slide.content.trim() === '') {
            continue;
          }
          
          setSaveStatus(`Đang cải thiện slide ${i+1}/${updatedSlides.length}...`);
          updatedSlides[i] = {
            ...slide,
            content: await enhanceSlideContent(slide.content, enhanceApiKey)
          };
        }
        
        setSlides(updatedSlides);
        setSaveStatus('Tất cả slide đã được cải thiện thành công');
        setTimeout(() => setSaveStatus(''), 2000);
      }
      
      // Đóng dialog
      setShowAIEnhanceDialog(false);
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert('Có lỗi xảy ra khi cải thiện nội dung: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setIsEnhancing(false);
    }
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
    prepareAndExport(format);
    setShowExportOptions(false);
  };

  const handleAddImage = (image) => {
    if (!slides[currentSlideIndex]) return;
    
    // Thêm hình ảnh vào danh sách elements
    const element = {
      id: `img-${Date.now()}`,
      type: 'image',
      url: image.url,
      position: { x: 50, y: 100 },
      size: { width: 300, height: 200 },
      isDragging: false
    };
    
    const updatedElements = [...(slides[currentSlideIndex].elements || []), element];
    updateCurrentSlide('elements', updatedElements);
    
    setShowImageLibrary(false);
  };

  const selectElement = (elementId) => {
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    } else {
      setSelectedElementId(elementId);
      
      // Bring the selected element to the front by increasing its z-index
      const updatedSlides = [...slides];
      const currentSlide = updatedSlides[currentSlideIndex];
      const elements = currentSlide.elements || [];
      
      const elementIndex = elements.findIndex(el => el.id === elementId);
      if (elementIndex !== -1) {
        // Increase the global z-index counter
        const newZIndex = zIndexCounter + 1;
        setZIndexCounter(newZIndex);
        
        // Update the element's z-index
        const updatedElements = [...elements];
        updatedElements[elementIndex] = {
          ...updatedElements[elementIndex],
          zIndex: newZIndex
        };
        
        // Update the slide with the new elements
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: updatedElements
        };
        
        setSlides(updatedSlides);
      }
    }
  };

  const handleResizeStart = (e, elementId) => {
    e.preventDefault();
    
    if (selectedElementId !== elementId) {
      selectElement(elementId);
    }
    
    const currentSlide = slides[currentSlideIndex];
    const elements = currentSlide.elements || [];
    const element = elements.find(el => el.id === elementId);
    
    if (!element) return;
    
    setResizingElement(elementId);
    setResizeStartData({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.size.width,
      startHeight: element.size.height,
      aspectRatio: element.type === 'image' ? element.size.width / element.size.height : null
    });
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!resizingElement || !resizeStartData) return;
    
    const deltaX = e.clientX - resizeStartData.startX;
    const deltaY = e.clientY - resizeStartData.startY;
    
    let newWidth = Math.max(50, resizeStartData.startWidth + deltaX);
    let newHeight = Math.max(50, resizeStartData.startHeight + deltaY);
    
    // Maintain aspect ratio for images if needed
    if (resizeStartData.aspectRatio) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / resizeStartData.aspectRatio;
      } else {
        newWidth = newHeight * resizeStartData.aspectRatio;
      }
    }
    
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    const elements = currentSlide.elements || [];
    
    const elementIndex = elements.findIndex(el => el.id === resizingElement);
    if (elementIndex !== -1) {
      const updatedElements = [...elements];
      updatedElements[elementIndex] = {
        ...updatedElements[elementIndex],
        size: {
          width: newWidth,
          height: newHeight
        }
      };
      
      updatedSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: updatedElements
      };
      
      setSlides(updatedSlides);
    }
  };

  const handleResizeEnd = () => {
    setResizingElement(null);
    setResizeStartData(null);
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleDragStart = (e, elementId) => {
    e.preventDefault();
    
    // Select the element if it's not already selected
    if (selectedElementId !== elementId) {
      selectElement(elementId);
    }
    
    const currentSlide = slides[currentSlideIndex];
    const element = currentSlide.elements.find(el => el.id === elementId);
    
    if (!element) return;
    
    // Store the initial position and mouse coords for drag calculations
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = element.position.x;
    const startTop = element.position.y;
    
    // Set up drag handlers
    const handleMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Update element position
      const updatedSlides = [...slides];
      const currentSlide = updatedSlides[currentSlideIndex];
      const elements = currentSlide.elements || [];
      
      const elementIndex = elements.findIndex(el => el.id === elementId);
      if (elementIndex !== -1) {
        const updatedElements = [...elements];
        updatedElements[elementIndex] = {
          ...updatedElements[elementIndex],
          position: {
            x: startLeft + deltaX,
            y: startTop + deltaY
          }
        };
        
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: updatedElements
        };
        
        setSlides(updatedSlides);
      }
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  // Thêm chức năng tạo biểu đồ
  const addChartElement = () => {
    setShowChartDialog(true);
  };

  const handleAddChart = () => {
    const chartLabels = chartData.labels.split(',').map(label => label.trim());
    const chartValues = chartData.values.split(',').map(value => parseFloat(value.trim()));
    
    const processedData = chartLabels.map((label, index) => ({
      name: label,
      value: chartValues[index] || 0
    }));
    
    // Default colors for chart
    const chartColors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E24AA',
      '#16A085', '#F39C12', '#D35400', '#2C3E50', '#7F8C8D'
    ];
    
    const newElement = {
      id: Date.now(),
      type: 'chart',
      chartType: chartData.type,
      title: chartData.title,
      data: processedData,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      zIndex: zIndexCounter + 1,
      showLegend: true,
      showGrid: true,
      colors: chartColors.slice(0, processedData.length)
    };
    
    setZIndexCounter(zIndexCounter + 1);
    
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement]
    };
    
    setSlides(updatedSlides);
    setShowChartDialog(false);
  };

  // Cập nhật renderSlideElements để thêm biểu đồ
  const renderSlideElements = () => {
    if (!slides[currentSlideIndex] || !slides[currentSlideIndex].elements) return null;
    
    return slides[currentSlideIndex].elements.map(element => {
      if (element.type === 'image') {
        return renderImageElement(element);
      } 
      else if (element.type === 'text') {
        // Đảm bảo style tồn tại
        const elementStyle = element.style || {
          fontSize: '16px',
          fontWeight: 'normal',
          color: getCurrentTemplate().textColor,
          textAlign: 'left'
        };
        
        // Hiển thị phần tử văn bản
        return (
          <div 
            key={element.id}
            className="draggable-element text-element"
            style={{
              position: 'absolute',
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              minWidth: `${element.size.width}px`,
              cursor: element.isEditing ? 'text' : 'move',
              border: selectedElementId === element.id ? '2px solid #1a73e8' : 
                     element.isDragging ? '2px dashed #1a73e8' : 
                     element.isEditing ? '2px solid #1a73e8' : '1px solid transparent',
              padding: '8px',
              zIndex: element.zIndex || 1,
              backgroundColor: element.isEditing ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
            draggable={!element.isEditing}
            onDragStart={(e) => {
              if (!element.isEditing) {
                handleDragStart(e, element.id);
              }
            }}
            onDrag={handleDrag}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={(e) => {
              e.stopPropagation();
              selectElement(element.id);
              if (!element.isEditing) {
                updateElement(element.id, { isEditing: true });
              }
            }}
          >
            {element.isEditing ? (
              <textarea
                autoFocus
                value={element.content}
                onChange={(e) => updateElement(element.id, { content: e.target.value })}
                onBlur={() => updateElement(element.id, { isEditing: false })}
                style={{
                  width: '100%',
                  minHeight: '50px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: elementStyle.fontSize,
                  fontWeight: elementStyle.fontWeight,
                  color: elementStyle.color,
                  textAlign: elementStyle.textAlign,
                  resize: 'both',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                style={{
                  fontSize: elementStyle.fontSize,
                  fontWeight: elementStyle.fontWeight,
                  color: elementStyle.color,
                  textAlign: elementStyle.textAlign,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {element.content}
              </div>
            )}
            
            {renderElementControls(element)}
            
            {/* Nút điều chỉnh kích thước cho văn bản */}
            {selectedElementId === element.id && !element.isEditing && (
              <div
                className="resize-handle"
                style={{
                  position: 'absolute',
                  right: '-5px',
                  bottom: '-5px',
                  width: '15px',
                  height: '15px',
                  backgroundColor: '#1a73e8',
                  borderRadius: '50%',
                  cursor: 'nwse-resize',
                  zIndex: 1001
                }}
                onMouseDown={(e) => handleResizeStart(e, element.id)}
              ></div>
            )}
          </div>
        );
      }
      else if (element.type === 'chart') {
        return renderChartElement(element);
      }
      return null;
    });
  };

  // Tạo SlidePreview component để hiển thị slide
  const SlidePreview = ({ slide, template, isActive, onClick, onDelete }) => {
    const previewRef = useRef(null);
    
    useEffect(() => {
      if (previewRef.current) {
        slidePreviewRefs.current[slide.id] = previewRef.current;
      }
    }, [slide.id]);
    
    return (
      <div
        ref={previewRef}
        id={`slide-preview-${slide.id}`}
        className={`p-3 mb-2 rounded shadow-sm ${isActive ? 'border border-primary' : ''}`}
        style={{ 
          cursor: 'pointer',
          backgroundColor: template.background,
          color: template.textColor,
          fontFamily: template.fontFamily,
          position: 'relative'
        }}
        onClick={onClick}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-truncate fw-bold">{slide.title}</span>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ×
          </button>
        </div>
        <div 
          className="small text-truncate" 
          style={{ fontSize: '10px', maxHeight: '30px', overflow: 'hidden' }}
        >
          {slide.content}
        </div>
      </div>
    );
  };

  // Xuất tất cả slide và chuẩn bị DOM
  const prepareAndExport = (format) => {
    try {
      // Sử dụng các phần tử đã tham chiếu trong slidePreviewRefs
      const slidesWithRefs = slides.map(slide => ({
        ...slide,
        ref: slidePreviewRefs.current[slide.id]
      }));
      
      // Thực hiện xuất với các tham chiếu đã có
      exportPresentation(slidesWithRefs, templates, presentationTitle, format);
      setShowExportOptions(false);
    } catch (error) {
      console.error('Lỗi khi chuẩn bị xuất:', error);
      alert('Có lỗi khi xuất bài thuyết trình. Vui lòng thử lại.');
    }
  };

  // Toggle chế độ xem trước
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // Hàm mở dialog chọn template
  const openTemplateDialog = () => {
    setShowTemplateDialog(true);
  };

  // Cập nhật hàm áp dụng template
  const applyTemplateToSlide = (templateId) => {
    const template = templates.find(t => t.id === templateId) || templates[0];
    
    // Áp dụng template cho slide hiện tại
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      template: template.id
    };
    
    // Cập nhật màu sắc cho các phần tử văn bản
    if (updatedSlides[currentSlideIndex].elements) {
      updatedSlides[currentSlideIndex].elements = updatedSlides[currentSlideIndex].elements.map(element => {
        if (element.type === 'text') {
          return {
            ...element,
            style: {
              ...element.style,
              color: template.textColor
            }
          };
        }
        return element;
      });
    }
    
    setSlides(updatedSlides);
    setCurrentTemplate(template);
  };

  // Mẫu template cho slide
  const SlideTemplatePreview = ({ template, onClick }) => {
    return (
      <div 
        className="template-preview mb-3 p-2 border rounded shadow-sm"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <div className="template-thumbnail mb-2">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="img-fluid rounded"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ 
          backgroundColor: template.background,
          color: template.textColor,
          padding: '10px', 
          borderRadius: '4px',
          fontFamily: template.fontFamily
        }}>
          <div style={{ 
            backgroundColor: template.headerColor,
            color: '#fff',
            padding: '8px',
            marginBottom: '5px',
            borderRadius: '2px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {template.name}
          </div>
          <div style={{ 
            padding: '5px',
            fontSize: '12px'
          }}>
            Mẫu slide
          </div>
        </div>
      </div>
    );
  };

  // Thêm lại hàm addTextElement
  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Double-click to edit text',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 100 },
      zIndex: zIndexCounter + 1,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontWeight: 'normal',
        color: getCurrentTemplate().textColor,
        textAlign: 'left',
        backgroundColor: 'transparent'
      }
    };
    
    setZIndexCounter(zIndexCounter + 1);
    
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement]
    };
    
    setSlides(updatedSlides);
  };

  // Thêm lại hàm updateElement
  const updateElement = (elementId, updates) => {
    const updatedElements = slides[currentSlideIndex].elements.map(el => {
      if (el.id === elementId) {
        return { ...el, ...updates };
      }
      return el;
    });
    updateCurrentSlide('elements', updatedElements);
  };

  // Thêm lại biến filteredImages
  const filteredImages = imageCategory === 'all' 
    ? imageLibrary 
    : imageLibrary.filter(img => img.category === imageCategory);

  // Thêm lại hàm renderContentWithImages
  const renderContentWithImages = (content) => {
    if (!content) return null;
    
    // Tách các dòng
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Kiểm tra nếu dòng chứa thông tin hình ảnh
      if (line.includes('[Hình ảnh:') && line.includes(']')) {
        // Trích xuất URL
        const urlMatch = line.match(/\[Hình ảnh: (.*?)\]/);
        if (urlMatch && urlMatch[1]) {
          const imageUrl = urlMatch[1];
          return (
            <div key={index} className="my-3 text-center">
              <img 
                src={imageUrl} 
                alt="Hình ảnh trong bài thuyết trình" 
                className="img-fluid" 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
          );
        }
      }
      
      // Kiểm tra nếu dòng chứa biểu đồ
      if (line.includes('[Biểu đồ:') && line.includes(']')) {
        return (
          <div key={index} className="my-3 p-3 border rounded bg-light text-center">
            <i className="bi bi-bar-chart-fill fs-1 text-primary"></i>
            <p>{line.replace(/\[Biểu đồ: (.*?)\]/, '$1')}</p>
          </div>
        );
      }
      
      // Trả về văn bản thông thường
      return <p key={index}>{line}</p>;
    });
  };

  // Cập nhật phần render hình ảnh để thêm nút resize
  const renderImageElement = (element) => {
    return (
      <div
        key={element.id}
        className={`position-absolute ${selectedElementId === element.id ? 'element-selected' : ''}`}
        style={{
          left: element.position.x + 'px',
          top: element.position.y + 'px',
          width: element.size.width + 'px',
          height: element.size.height + 'px',
          cursor: selectedElementId === element.id ? 'move' : 'pointer',
          zIndex: element.zIndex || 1,
          boxShadow: selectedElementId === element.id ? '0 0 0 2px #4285f4' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectElement(element.id);
        }}
        onMouseDown={(e) => handleDragStart(e, element.id)}
      >
        <img
          src={element.url}
          alt={element.alt || 'Slide image'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          draggable="false"
        />
        
        {selectedElementId === element.id && (
          <div className="resize-handle" onMouseDown={(e) => handleResizeStart(e, element.id)}>
            <i className="bi bi-arrows-angle-expand"></i>
          </div>
        )}
      </div>
    );
  };

  // Hàm mở dialog chỉnh sửa biểu đồ
  const openChartEditor = (chartElement) => {
    const chartLabels = chartElement.data.labels.join(', ');
    const chartValues = chartElement.data.values.join(', ');
    
    setEditingChartId(chartElement.id);
    setEditingChartData({
      type: chartElement.chartType,
      title: chartElement.title,
      labels: chartLabels,
      values: chartValues
    });
  };

  // Hàm lưu chỉnh sửa biểu đồ
  const saveChartEdit = () => {
    if (!editingChartId || !editingChartData) return;
    
    const updatedElements = slides[currentSlideIndex].elements.map(el => {
      if (el.id === editingChartId) {
        return {
          ...el,
          chartType: editingChartData.type,
          title: editingChartData.title,
          data: {
            labels: editingChartData.labels.split(',').map(label => label.trim()),
            values: editingChartData.values.split(',').map(value => parseFloat(value.trim()))
          }
        };
      }
      return el;
    });
    
    updateCurrentSlide('elements', updatedElements);
    setEditingChartId(null);
    setEditingChartData(null);
  };

  // Cập nhật hàm render biểu đồ
  const renderChartElement = (element) => {
    const colors = element.colors || [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E24AA'
    ];
    
    const renderChart = () => {
      switch (element.chartType) {
        case 'bar':
          return (
            <div style={{ width: '100%', height: '100%' }}>
              <div className="chart-title" style={{ textAlign: 'center', marginBottom: '10px' }}>
                {element.title}
              </div>
              <div className="bar-chart">
                {element.data.map((item, index) => (
                  <div key={index} className="bar-chart-item">
                    <div className="bar-label">{item.name}</div>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ 
                          width: `${(item.value / Math.max(...element.data.map(d => d.value))) * 100}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      >
                        <span className="bar-value">{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {element.showLegend && (
                <div className="chart-legend">
                  {element.data.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span 
                        className="legend-color" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></span>
                      <span className="legend-label">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        case 'pie':
          // Simple SVG pie chart
          const total = element.data.reduce((sum, item) => sum + item.value, 0);
          let startAngle = 0;
          
          return (
            <div style={{ width: '100%', height: '100%' }}>
              <div className="chart-title" style={{ textAlign: 'center', marginBottom: '10px' }}>
                {element.title}
              </div>
              <svg viewBox="0 0 100 100" className="pie-chart">
                <g transform="translate(50,50)">
                  {element.data.map((item, index) => {
                    const percentage = item.value / total;
                    const angle = percentage * 360;
                    const endAngle = startAngle + angle;
                    
                    // Convert angles to radians for SVG
                    const startRadians = (startAngle - 90) * Math.PI / 180;
                    const endRadians = (endAngle - 90) * Math.PI / 180;
                    
                    // Calculate path
                    const x1 = 40 * Math.cos(startRadians);
                    const y1 = 40 * Math.sin(startRadians);
                    const x2 = 40 * Math.cos(endRadians);
                    const y2 = 40 * Math.sin(endRadians);
                    
                    // Create path for slice
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const pathData = `M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    // Update startAngle for next slice
                    startAngle = endAngle;
                    
                    return (
                      <path 
                        key={index} 
                        d={pathData} 
                        fill={colors[index % colors.length]}
                      />
                    );
                  })}
                </g>
              </svg>
              {element.showLegend && (
                <div className="chart-legend">
                  {element.data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div key={index} className="legend-item">
                        <span 
                          className="legend-color" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></span>
                        <span className="legend-label">
                          {item.name}: {percentage}% ({item.value})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        case 'line':
          // Simple line chart
          const maxValue = Math.max(...element.data.map(d => d.value));
          const points = element.data.map((item, index) => {
            const x = (index / (element.data.length - 1)) * 100;
            const y = 100 - ((item.value / maxValue) * 80);
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <div style={{ width: '100%', height: '100%' }}>
              <div className="chart-title" style={{ textAlign: 'center', marginBottom: '10px' }}>
                {element.title}
              </div>
              <svg viewBox="0 0 100 100" className="line-chart">
                {element.showGrid && (
                  <g className="grid-lines">
                    {[0, 25, 50, 75, 100].map(y => (
                      <line 
                        key={`h-${y}`} 
                        x1="0" 
                        y1={y} 
                        x2="100" 
                        y2={y} 
                        stroke="#e0e0e0" 
                        strokeWidth="0.5" 
                      />
                    ))}
                    {element.data.map((_, index) => {
                      const x = (index / (element.data.length - 1)) * 100;
                      return (
                        <line 
                          key={`v-${index}`} 
                          x1={x} 
                          y1="0" 
                          x2={x} 
                          y2="100" 
                          stroke="#e0e0e0" 
                          strokeWidth="0.5" 
                        />
                      );
                    })}
                  </g>
                )}
                <polyline
                  fill="none"
                  stroke={colors[0]}
                  strokeWidth="2"
                  points={points}
                />
                {element.data.map((item, index) => {
                  const x = (index / (element.data.length - 1)) * 100;
                  const y = 100 - ((item.value / maxValue) * 80);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="2"
                      fill={colors[0]}
                    />
                  );
                })}
                <g className="chart-labels">
                  {element.data.map((item, index) => {
                    const x = (index / (element.data.length - 1)) * 100;
                    return (
                      <text 
                        key={index} 
                        x={x} 
                        y="98" 
                        textAnchor="middle" 
                        fontSize="8"
                      >
                        {item.name}
                      </text>
                    );
                  })}
                </g>
              </svg>
              {element.showLegend && (
                <div className="chart-legend">
                  <div className="legend-item">
                    <span 
                      className="legend-color" 
                      style={{ backgroundColor: colors[0] }}
                    ></span>
                    <span className="legend-label">{element.title}</span>
                  </div>
                </div>
              )}
            </div>
          );
        default:
          return <div>Unsupported chart type</div>;
      }
    };
    
    return (
      <div
        key={element.id}
        className={`position-absolute chart-element ${selectedElementId === element.id ? 'element-selected' : ''}`}
        style={{
          left: element.position.x + 'px',
          top: element.position.y + 'px',
          width: element.size.width + 'px',
          height: element.size.height + 'px',
          cursor: selectedElementId === element.id ? 'move' : 'pointer',
          zIndex: element.zIndex || 1,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: selectedElementId === element.id ? '0 0 0 2px #4285f4' : 'none',
          overflow: 'hidden'
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectElement(element.id);
        }}
        onDoubleClick={() => {
          openChartEditor(element);
        }}
        onMouseDown={(e) => handleDragStart(e, element.id)}
      >
        {renderChart()}
        
        {selectedElementId === element.id && (
          <>
            <div className="resize-handle" onMouseDown={(e) => handleResizeStart(e, element.id)}>
              <i className="bi bi-arrows-angle-expand"></i>
            </div>
            <div 
              className="edit-chart-button"
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '4px',
                padding: '2px 5px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                openChartEditor(element);
              }}
            >
              <i className="bi bi-pencil"></i> Edit
            </div>
          </>
        )}
      </div>
    );
  };

  // Add these missing handler functions
  const handleDrag = (e) => {
    if (!e.clientX || !e.clientY) return; // Skip invalid events
  };

  const handleDragEnd = (e, elementId) => {
    if (!elementId) return;
    
    // Clear any dragging flags if needed
    const updatedElements = slides[currentSlideIndex].elements.map(el => {
      if (el.id === elementId) {
        return { ...el, isDragging: false };
      }
      return el;
    });
    
    updateCurrentSlide('elements', updatedElements);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Event handling for dropping elements is now handled by direct manipulation
    // through the handleDragStart/handleDrag/handleDragEnd functions
  };

  // Sửa hàm renderElementControls để kiểm tra style tồn tại
  const renderElementControls = (element) => {
    return (
      <div 
        className="element-controls"
        style={{
          display: selectedElementId === element.id ? 'block' : 'none',
          position: 'absolute',
          top: '-30px',
          right: '0',
          zIndex: 1000
        }}
      >
        <div className="btn-group btn-group-sm">
          <button 
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              const updatedElements = slides[currentSlideIndex].elements.filter(el => el.id !== element.id);
              updateCurrentSlide('elements', updatedElements);
              setSelectedElementId(null);
            }}
            title="Xóa phần tử"
          >
            <i className="bi bi-trash"></i>
          </button>
          
          {element.type === 'text' && (
            <>
              <button 
                className="btn btn-sm btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  const elementStyle = element.style || {};
                  updateElement(element.id, {
                    style: {
                      ...elementStyle,
                      fontWeight: (elementStyle.fontWeight === 'bold') ? 'normal' : 'bold'
                    }
                  });
                }}
                title="Đậm"
              >
                <i className="bi bi-type-bold"></i>
              </button>
              <button 
                className="btn btn-sm btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  const elementStyle = element.style || {};
                  const currentSize = parseInt(elementStyle.fontSize) || 16;
                  const newSize = currentSize + 2;
                  updateElement(element.id, {
                    style: {
                      ...elementStyle,
                      fontSize: `${newSize}px`
                    }
                  });
                }}
                title="Tăng cỡ chữ"
              >
                <i className="bi bi-plus-lg"></i>
              </button>
              <button 
                className="btn btn-sm btn-light"
                onClick={(e) => {
                  e.stopPropagation();
                  const elementStyle = element.style || {};
                  const currentSize = parseInt(elementStyle.fontSize) || 16;
                  const newSize = Math.max(12, currentSize - 2);
                  updateElement(element.id, {
                    style: {
                      ...elementStyle,
                      fontSize: `${newSize}px`
                    }
                  });
                }}
                title="Giảm cỡ chữ"
              >
                <i className="bi bi-dash-lg"></i>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Add this CSS style to the component's return statement
  // inside a <style> tag at the beginning of the component JSX
  const editorStyles = `
    .element-selected {
      cursor: move;
    }
    
    .resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      background-color: #4285f4;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: se-resize;
      font-size: 12px;
    }
    
    .bar-chart {
      height: 80%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .bar-chart-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .bar-label {
      width: 80px;
      text-align: right;
      padding-right: 10px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .bar-container {
      flex-grow: 1;
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .bar {
      height: 100%;
      display: flex;
      align-items: center;
      padding-left: 5px;
      color: white;
      font-size: 12px;
      transition: width 0.3s ease;
    }
    
    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 10px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-right: 15px;
      margin-bottom: 5px;
      font-size: 12px;
    }
    
    .legend-color {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 5px;
      border-radius: 2px;
    }
  `;

  /**
   * Xử lý khi nhập bài thuyết trình từ dịch vụ khác
   * @param {Object} presentationData - Dữ liệu bài thuyết trình
   */
  const handleImportPresentation = (presentationData) => {
    if (!presentationData || !presentationData.slides || presentationData.slides.length === 0) {
      return;
    }
    
    // Cập nhật tiêu đề bài thuyết trình
    setPresentationTitle(presentationData.title || 'Bài thuyết trình nhập');
    
    // Cài đặt các slide mới
    setSlides(presentationData.slides);
    setCurrentSlideIndex(0);
    
    // Hiển thị thông báo thành công
    setSaveStatus('Bài thuyết trình đã được nhập thành công');
    setTimeout(() => setSaveStatus(''), 2000);
    
    // Lưu bài thuyết trình ngay lập tức
    handleSave();
  };

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
                <>
                  <i className="bi bi-hourglass-split me-1"></i>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-magic me-1"></i>
                  <span>Tạo với AI</span>
                </>
              )}
            </button>
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={handleSave}
            >
              <i className="bi bi-save me-1"></i> Lưu
            </button>
            <button 
              className="btn btn-outline-info me-2"
              onClick={togglePreviewMode}
            >
              {previewMode ? (
                <>
                  <i className="bi bi-pencil-square me-1"></i> Chỉnh sửa
                </>
              ) : (
                <>
                  <i className="bi bi-eye me-1"></i> Xem trước
                </>
              )}
            </button>
            
            {/* Thêm nút Chia sẻ */}
            <button 
              className="btn btn-outline-success me-2"
              onClick={() => setShowSharingPanel(true)}
            >
              <i className="bi bi-share me-1"></i> Chia sẻ
            </button>
            
            {/* Nút Hợp tác */}
            <button 
              className="btn btn-outline-primary me-2 position-relative"
              onClick={() => setShowCollaborationPanel(true)}
            >
              <i className="bi bi-people me-1"></i> Hợp tác
              {hasNewComments && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">Bình luận mới</span>
                </span>
              )}
            </button>
            
            {/* Nút Tích hợp */}
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={() => setShowIntegrationPanel(true)}
            >
              <i className="bi bi-boxes me-1"></i> Tích hợp
            </button>
            
            <div className="dropdown d-inline-block">
              <button 
                className="btn btn-success" 
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <i className="bi bi-download me-1"></i> Xuất
              </button>
              {showExportOptions && (
                <div className="dropdown-menu dropdown-menu-end show">
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('pdf')}
                  >
                    <i className="bi bi-file-pdf me-1"></i> Xuất PDF
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('png')}
                  >
                    <i className="bi bi-file-image me-1"></i> Xuất PNG
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('pptx')}
                  >
                    <i className="bi bi-file-earmark-ppt me-1"></i> Xuất PPTX
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
            <SlidePreview 
              key={slide.id}
              slide={slide}
              template={templates.find(t => t.id === slide.template) || templates[0]}
              isActive={currentSlideIndex === index}
              onClick={() => setCurrentSlideIndex(index)}
              onDelete={() => deleteSlide(index)}
            />
          ))}
          <button
            className="btn btn-outline-primary w-100 mt-2"
            onClick={addSlide}
          >
            + Thêm Slide
          </button>
        </div>

        {/* Editor or Preview */}
        <div className="flex-grow-1 p-4 overflow-auto">
          {previewMode ? (
            // Chế độ xem trước
            <div 
              className="presentation-preview"
              style={{ width: '100%', height: '100%' }}
            >
              {slides[currentSlideIndex] && (
                <div
                  className="slide-preview-full position-relative"
                  style={{ 
                    backgroundColor: getCurrentTemplate().background,
                    color: getCurrentTemplate().textColor,
                    fontFamily: getCurrentTemplate().fontFamily,
                    padding: '40px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <h1 
                    style={{ 
                      color: getCurrentTemplate().headerColor,
                      marginBottom: '30px',
                      padding: '15px',
                      backgroundColor: getCurrentTemplate().headerColor,
                      color: '#fff',
                      borderRadius: '4px'
                    }}
                  >
                    {slides[currentSlideIndex].title}
                  </h1>
                  <div 
                    style={{ 
                      fontSize: '1.2rem',
                      lineHeight: '1.6',
                      flexGrow: 1,
                      overflow: 'auto'
                    }}
                  >
                    {renderContentWithImages(slides[currentSlideIndex].content)}
                  </div>
                  {renderSlideElements()}
                  <div className="slide-navigation d-flex justify-content-between mt-4">
                    <button 
                      className="btn btn-outline-secondary" 
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                    >
                      &larr; Slide trước
                    </button>
                    <span className="align-self-center">
                      {currentSlideIndex + 1} / {slides.length}
                    </span>
                    <button 
                      className="btn btn-outline-secondary" 
                      disabled={currentSlideIndex === slides.length - 1}
                      onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                    >
                      Slide tiếp &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Chế độ chỉnh sửa
            slides[currentSlideIndex] && (
              <div 
                className="card h-100"
                style={{ 
                  backgroundColor: getCurrentTemplate().background,
                  color: getCurrentTemplate().textColor,
                  fontFamily: getCurrentTemplate().fontFamily,
                  height: '500px',
                  overflow: 'hidden'
                }}
                onDragOver={(e) => {
                  e.preventDefault(); // Cần thiết để cho phép drop
                }}
                onDrop={handleDrop}
                onClick={() => {
                  // Bỏ chọn phần tử khi click vào khu vực trống
                  setSelectedElementId(null);
                }}
              >
                <div 
                  className="card-body position-relative"
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
                  
                  {/* Hiển thị phần tử có thể kéo thả */}
                  {renderSlideElements()}
                </div>
              </div>
            )
          )}
        </div>

        {/* Tools Panel */}
        <div className="bg-light p-3" style={{ width: "250px", overflowY: "auto" }}>
          <h6 className="mb-3">Công cụ</h6>
          <button 
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={addTextElement}
          >
            <i className="bi bi-fonts me-1"></i> Văn bản
          </button>
          <button 
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={() => setShowImageLibrary(true)}
          >
            <i className="bi bi-image me-1"></i> Hình ảnh
          </button>
          <button 
            className="btn btn-outline-secondary w-100 mb-2"
            onClick={addChartElement}
          >
            <i className="bi bi-bar-chart me-1"></i> Biểu đồ
          </button>
          
          <div className="mt-4 mb-4">
            <h6 className="mb-2">Template</h6>
            <button
              className="btn btn-outline-primary w-100 mb-2"
              onClick={openTemplateDialog}
            >
              <i className="bi bi-grid-3x3-gap me-1"></i> Chọn template
            </button>
            <div className="template-preview-mini p-2 border rounded mt-2">
              <small>Template hiện tại: <strong>{getCurrentTemplate().name}</strong></small>
              <div 
                className="mt-1 p-2 rounded"
                style={{
                  backgroundColor: getCurrentTemplate().background,
                  color: getCurrentTemplate().textColor,
                  fontFamily: getCurrentTemplate().fontFamily,
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div 
                  style={{ 
                    backgroundColor: getCurrentTemplate().headerColor,
                    color: '#fff',
                    padding: '4px',
                    borderRadius: '2px', 
                    marginBottom: '4px',
                    textAlign: 'center'
                  }}
                >
                  {getCurrentTemplate().name}
                </div>
                <div className="d-flex justify-content-between">
                  <div style={{ backgroundColor: getCurrentTemplate().accentColor, width: '48%', height: '15px', borderRadius: '2px' }}></div>
                  <div style={{ backgroundColor: getCurrentTemplate().secondary, width: '48%', height: '15px', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <hr />
          
          <h6 className="mb-3">Hỗ trợ AI</h6>
          <div className="card mb-3 border-primary">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-robot me-2"></i>
              Tính năng AI
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={() => setAiDialogOpen(true)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span><i className="bi bi-hourglass-split me-1"></i> Đang tạo...</span>
                ) : (
                  <span><i className="bi bi-magic me-1"></i> Tạo bài thuyết trình mới</span>
                )}
              </button>
              <button 
                className="btn btn-outline-primary w-100 mb-2"
                onClick={() => setShowAIEnhanceDialog(true)}
              >
                <i className="bi bi-stars me-1"></i> Cải thiện nội dung
              </button>
              <small className="text-muted d-block mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Sử dụng OpenAI API để tạo và cải thiện bài thuyết trình tự động
              </small>
            </div>
          </div>
          
          <hr />
          
          <button 
            className="btn btn-danger w-100 mt-4"
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn xóa slide này không?')) {
                deleteSlide(currentSlideIndex);
              }
            }}
            disabled={slides.length <= 1}
          >
            <i className="bi bi-trash me-1"></i> Xóa slide hiện tại
          </button>
        </div>
      </div>

      {/* AI Dialog */}
      {aiDialogOpen && (
        <AIPresentation 
          onGenerate={handleAIGenerate}
          onClose={() => setAiDialogOpen(false)}
        />
      )}

      {/* Collaboration Panel */}
      {showCollaborationPanel && (
        <CollaborationPanel
          presentationId={presentationId}
          onClose={() => setShowCollaborationPanel(false)}
        />
      )}

      {/* Integration Panel */}
      {showIntegrationPanel && (
        <IntegrationPanel
          presentation={{
            id: presentationId,
            title: presentationTitle,
            slides: slides
          }}
          onImport={handleImportPresentation}
          onClose={() => setShowIntegrationPanel(false)}
        />
      )}
      
      {/* Sharing Panel */}
      {showSharingPanel && (
        <SharingPanel
          presentationId={presentationId}
          presentationTitle={presentationTitle}
          onClose={() => setShowSharingPanel(false)}
        />
      )}

      {/* Dialog cải thiện nội dung bằng AI */}
      {showAIEnhanceDialog && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cải thiện nội dung với AI</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAIEnhanceDialog(false)}
                  disabled={isEnhancing}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info mb-3">
                  <h6 className="alert-heading"><i className="bi bi-info-circle me-2"></i>Hướng dẫn sử dụng</h6>
                  <p>Chức năng này sẽ cải thiện nội dung slide, làm cho chúng ngắn gọn, súc tích và dễ hiểu hơn bằng cách sử dụng AI.</p>
                  <ol className="mb-0">
                    <li>Chọn phạm vi cải thiện (slide hiện tại hoặc tất cả)</li>
                    <li>Nhập OpenAI API Key của bạn (bắt đầu bằng sk-...)</li>
                    <li>Nhấn nút "Cải thiện" và đợi quá trình hoàn tất</li>
                  </ol>
                  <hr />
                  <p className="mb-0"><i className="bi bi-key me-2"></i>Để sử dụng tính năng này, bạn cần có <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Key</a>.</p>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Cải thiện</label>
                  <select
                    className="form-select"
                    value={enhancementType}
                    onChange={(e) => setEnhancementType(e.target.value)}
                    disabled={isEnhancing}
                  >
                    <option value="content">Chỉ slide hiện tại</option>
                    <option value="all">Tất cả các slide</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">OpenAI API Key</label>
                  <input
                    type="password"
                    className="form-control"
                    value={enhanceApiKey}
                    onChange={(e) => setEnhanceApiKey(e.target.value)}
                    placeholder="sk-..."
                    disabled={isEnhancing}
                  />
                  <small className="text-muted">API key của bạn được lưu trên trình duyệt, không được gửi lên máy chủ.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAIEnhanceDialog(false)}
                  disabled={isEnhancing}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEnhanceContent}
                  disabled={isEnhancing}
                >
                  {isEnhancing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang cải thiện...
                    </>
                  ) : (
                    'Cải thiện'
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

      {/* Dialog chỉnh sửa biểu đồ */}
      {showChartDialog && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm biểu đồ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowChartDialog(false)}
                >
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Loại biểu đồ</label>
                  <div className="btn-group w-100">
                    {chartTypes.map(type => (
                      <button
                        key={type.id}
                        className={`btn ${chartData.type === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setChartData({...chartData, type: type.id})}
                      >
                        <i className={`bi ${type.icon} me-1`}></i>
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="chartTitle" className="form-label">Tiêu đề biểu đồ</label>
                  <input
                    type="text"
                    className="form-control"
                    id="chartTitle"
                    value={chartData.title}
                    onChange={(e) => setChartData({...chartData, title: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="chartLabels" className="form-label">Nhãn (phân cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="chartLabels"
                    value={chartData.labels}
                    onChange={(e) => setChartData({...chartData, labels: e.target.value})}
                    placeholder="Ví dụ: T1, T2, T3, T4"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="chartValues" className="form-label">Giá trị (phân cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="chartValues"
                    value={chartData.values}
                    onChange={(e) => setChartData({...chartData, values: e.target.value})}
                    placeholder="Ví dụ: 10, 20, 30, 40"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowChartDialog(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddChart}
                >
                  Thêm biểu đồ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thêm dialog chọn template */}
      {showTemplateDialog && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chọn template</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTemplateDialog(false)}
                >
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {templates.map(template => (
                    <div className="col-md-4" key={template.id}>
                      <SlideTemplatePreview
                        template={template}
                        onClick={() => {
                          applyTemplateToSlide(template.id);
                          setShowTemplateDialog(false);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTemplateDialog(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog chỉnh sửa biểu đồ */}
      {editingChartId && editingChartData && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa biểu đồ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setEditingChartId(null);
                    setEditingChartData(null);
                  }}
                >
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Loại biểu đồ</label>
                  <div className="btn-group w-100">
                    {chartTypes.map(type => (
                      <button
                        key={type.id}
                        className={`btn ${editingChartData.type === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setEditingChartData({...editingChartData, type: type.id})}
                      >
                        <i className={`bi ${type.icon} me-1`}></i>
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="chartTitle" className="form-label">Tiêu đề biểu đồ</label>
                  <input
                    type="text"
                    className="form-control"
                    id="chartTitle"
                    value={editingChartData.title}
                    onChange={(e) => setEditingChartData({...editingChartData, title: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="chartLabels" className="form-label">Nhãn (phân cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="chartLabels"
                    value={editingChartData.labels}
                    onChange={(e) => setEditingChartData({...editingChartData, labels: e.target.value})}
                    placeholder="Ví dụ: T1, T2, T3, T4"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="chartValues" className="form-label">Giá trị (phân cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="chartValues"
                    value={editingChartData.values}
                    onChange={(e) => setEditingChartData({...editingChartData, values: e.target.value})}
                    placeholder="Ví dụ: 10, 20, 30, 40"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingChartId(null);
                    setEditingChartData(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveChartEdit}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thêm CSS cho các yếu tố có thể kéo thả */}
      <style>
        {editorStyles}
      </style>
    </div>
  );
};

export default EditorPage;