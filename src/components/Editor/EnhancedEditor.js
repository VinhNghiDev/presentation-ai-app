// src/components/Editor/EnhancedEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHistory } from '../hooks/useHistory';
import EnhancedSlideList from './EnhancedSlideList';
import EnhancedToolsPanel from './EnhancedToolsPanel';
import SlideEditor from './SlideEditor';
import EnhancedTemplateSelector from './EnhancedTemplateSelector';
import AIDialog from '../AIDialog';
import SlidePreview from './SlidePreview';
import { getTemplateById } from '../../utils/enhancedTemplates';
import { createSlideFromTemplate } from '../../utils/enhancedTemplates';
import { TableCreator } from './TableEditor';

/**
 * Enhanced Editor Component với tính năng undo/redo, drag & drop...
 * @param {Object} props - Component props
 * @param {Array} props.initialSlides - Slides ban đầu
 * @param {string} props.initialTitle - Tiêu đề ban đầu
 * @param {Function} props.onSave - Callback khi lưu
 * @param {Function} props.onExport - Callback khi xuất
 * @param {Function} props.onClose - Callback khi đóng
 */
const EnhancedEditor = ({
  initialSlides = [],
  initialTitle = 'Bài thuyết trình mới',
  onSave,
  onExport,
  onClose
}) => {
  // State cho các slide
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presentationTitle, setPresentationTitle] = useState(initialTitle);
  
  // State cho UI
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [currentView, setCurrentView] = useState('edit'); // 'edit' hoặc 'preview'
  
  // State cho lịch sử undo/redo
  const { 
    state: historyState, 
    setState: setHistoryState, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    addToHistory
  } = useHistory({ slides: [], title: '' });
  
  // Chỉ lưu lịch sử sau khi chỉnh sửa xong một khoảng thời gian
  const saveTimeoutRef = useRef(null);
  
  // Khởi tạo dữ liệu ban đầu
  useEffect(() => {
    if (initialSlides.length > 0) {
      setSlides(initialSlides);
      setHistoryState({ slides: initialSlides, title: initialTitle });
    } else {
      // Tạo slide mới nếu không có dữ liệu
      const defaultSlide = createSlideFromTemplate('business-classic', 'title');
      setSlides([defaultSlide]);
      setHistoryState({ slides: [defaultSlide], title: initialTitle });
    }
    
    setPresentationTitle(initialTitle);
  }, [initialSlides, initialTitle]);
  
  // Kiểm tra thay đổi và lưu lịch sử sau 1 giây không có thay đổi
  useEffect(() => {
    if (slides.length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        addToHistory({ slides, title: presentationTitle });
      }, 1000);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [slides, presentationTitle]);
  
  /**
   * Xử lý phím tắt
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Z - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          const prevState = undo();
          if (prevState) {
            setSlides(prevState.slides);
            setPresentationTitle(prevState.title);
          }
        }
      }
      
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y - Redo
      if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) || 
          ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          const nextState = redo();
          if (nextState) {
            setSlides(nextState.slides);
            setPresentationTitle(nextState.title);
          }
        }
      }
      
      // Cmd/Ctrl + S - Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, slides, presentationTitle]);
  
  /**
   * Cập nhật slide hiện tại
   * @param {Object} updatedSlide - Slide đã cập nhật
   */
  const updateCurrentSlide = (updatedSlide) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = updatedSlide;
    setSlides(updatedSlides);
  };
  
  /**
   * Thêm slide mới
   * @param {string} slideType - Loại slide (mặc định: 'content')
   */
  const addSlide = (slideType = 'content') => {
    // Lấy template từ slide hiện tại
    const currentTemplateId = slides[currentSlideIndex]?.template || 'business-classic';
    const newSlide = createSlideFromTemplate(currentTemplateId, slideType);
    
    // Thêm slide mới sau slide hiện tại
    const newSlides = [
      ...slides.slice(0, currentSlideIndex + 1),
      newSlide,
      ...slides.slice(currentSlideIndex + 1)
    ];
    
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };
  
  /**
   * Xóa slide hiện tại
   */
  const deleteCurrentSlide = () => {
    if (slides.length <= 1) {
      // Không xóa slide cuối cùng
      return;
    }
    
    const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
    setSlides(newSlides);
    
    // Điều chỉnh index nếu cần
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };
  
  /**
   * Di chuyển slide
   * @param {number} fromIndex - Vị trí nguồn
   * @param {number} toIndex - Vị trí đích
   */
  const moveSlide = (fromIndex, toIndex) => {
    const newSlides = [...slides];
    const [removed] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, removed);
    
    setSlides(newSlides);
    
    // Cập nhật slide hiện tại nếu slide được di chuyển là slide hiện tại
    if (currentSlideIndex === fromIndex) {
      setCurrentSlideIndex(toIndex);
    } else if (
      (currentSlideIndex > fromIndex && currentSlideIndex <= toIndex) ||
      (currentSlideIndex < fromIndex && currentSlideIndex >= toIndex)
    ) {
      // Điều chỉnh index nếu slide hiện tại bị ảnh hưởng bởi việc di chuyển
      setCurrentSlideIndex(
        currentSlideIndex + (fromIndex < toIndex ? -1 : 1)
      );
    }
  };
  
  /**
   * Nhân bản slide hiện tại
   */
  const duplicateCurrentSlide = () => {
    const currentSlide = slides[currentSlideIndex];
    const duplicatedSlide = {
      ...JSON.parse(JSON.stringify(currentSlide)), // Deep copy
      id: `slide-${Date.now()}`
    };
    
    const newSlides = [
      ...slides.slice(0, currentSlideIndex + 1),
      duplicatedSlide,
      ...slides.slice(currentSlideIndex + 1)
    ];
    
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };
  
  /**
   * Áp dụng template cho tất cả slides
   * @param {Object} template - Template cần áp dụng
   */
  const applyTemplateToAllSlides = (template) => {
    const updatedSlides = slides.map(slide => ({
      ...slide,
      template: template.id,
      backgroundColor: template.colors.background,
      textColor: template.colors.text
    }));
    
    setSlides(updatedSlides);
  };
  
  /**
   * Áp dụng template cho slide hiện tại
   * @param {Object} template - Template cần áp dụng
   */
  const applyTemplateToCurrentSlide = (template) => {
    updateCurrentSlide({
      ...slides[currentSlideIndex],
      template: template.id,
      backgroundColor: template.colors.background,
      textColor: template.colors.text
    });
  };
  
  /**
   * Xử lý khi chọn template
   * @param {Object} template - Template được chọn
   */
  const handleSelectTemplate = (template) => {
    // Nếu không có slide nào, tạo slide mới với template được chọn
    if (slides.length === 0) {
      const newSlide = createSlideFromTemplate(template.id, 'title');
      setSlides([newSlide]);
      setCurrentSlideIndex(0);
    } else {
      // Nếu là slide đầu tiên, hỏi người dùng muốn áp dụng cho tất cả hay chỉ slide hiện tại
      if (window.confirm('Bạn muốn áp dụng template này cho tất cả slide?')) {
        applyTemplateToAllSlides(template);
      } else {
        applyTemplateToCurrentSlide(template);
      }
    }
    
    setShowTemplateSelector(false);
  };
  
  /**
   * Xử lý khi lưu bài thuyết trình
   */
  const handleSave = () => {
    if (onSave) {
      onSave({
        title: presentationTitle,
        slides: slides,
        lastModified: Date.now()
      });
    }
    
    // Hiển thị thông báo
    setSaveStatus('Đã lưu');
    setTimeout(() => setSaveStatus(''), 2000);
  };
  
  /**
   * Xử lý khi xuất bài thuyết trình
   * @param {string} format - Định dạng xuất (pdf, png, pptx)
   */
  const handleExport = (format) => {
    if (onExport) {
      onExport({
        title: presentationTitle,
        slides: slides,
        format
      });
    }
  };
  
  /**
   * Xử lý khi AI tạo nội dung
   * @param {Object} generatedContent - Nội dung được tạo bởi AI
   */
  const handleAIGenerate = (generatedContent) => {
    if (generatedContent.slides && generatedContent.slides.length > 0) {
      setSlides(generatedContent.slides);
      setPresentationTitle(generatedContent.title || presentationTitle);
      setCurrentSlideIndex(0);
    }
    
    setShowAIDialog(false);
  };
  
  /**
   * Xử lý khi thêm phần tử mới vào slide hiện tại
   * @param {Object} element - Phần tử cần thêm
   */
  const handleAddElement = (element) => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;
    
    // Tạo ID duy nhất cho phần tử mới
    const newElement = {
      ...element,
      id: `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    
    // Cập nhật slide hiện tại với phần tử mới
    const updatedElements = currentSlide.elements ? [...currentSlide.elements, newElement] : [newElement];
    const updatedSlide = {
      ...currentSlide,
      elements: updatedElements
    };
    
    updateCurrentSlide(updatedSlide);
  };
  
  // Lấy template hiện tại
  const currentTemplate = slides[currentSlideIndex] 
    ? getTemplateById(slides[currentSlideIndex].template) 
    : null;
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="editor-container d-flex flex-column vh-100">
        {/* Header */}
        <div className="editor-header border-bottom shadow-sm bg-white">
          <div className="container-fluid py-2">
            <div className="row align-items-center">
              <div className="col-md-5 d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary me-3"
                  onClick={onClose}
                >
                  &larr;
                </button>
                <input
                  type="text"
                  className="form-control"
                  value={presentationTitle}
                  onChange={(e) => setPresentationTitle(e.target.value)}
                  placeholder="Tiêu đề bài thuyết trình"
                />
              </div>
              <div className="col-md-7 d-flex justify-content-end">
                <div className="btn-group me-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={undo}
                    disabled={!canUndo}
                    title="Hoàn tác (Ctrl+Z)"
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={redo}
                    disabled={!canRedo}
                    title="Làm lại (Ctrl+Y)"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
                <button
                  className="btn btn-primary me-2"
                  onClick={() => setShowAIDialog(true)}
                >
                  <i className="bi bi-magic me-1"></i>
                  Tạo với AI
                </button>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={handleSave}
                >
                  <i className="bi bi-save me-1"></i>
                  Lưu
                </button>
                <div className="dropdown d-inline-block me-2">
                  <button
                    className="btn btn-outline-success dropdown-toggle"
                    type="button"
                    id="exportDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-file-earmark-arrow-down me-1"></i>
                    Xuất
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="exportDropdown">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleExport('pdf')}
                      >
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        PDF
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleExport('png')}
                      >
                        <i className="bi bi-file-earmark-image me-2"></i>
                        PNG
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleExport('pptx')}
                      >
                        <i className="bi bi-file-earmark-slides me-2"></i>
                        PowerPoint
                      </button>
                    </li>
                  </ul>
                </div>
                <button
                  className={`btn ${currentView === 'preview' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentView(currentView === 'edit' ? 'preview' : 'edit')}
                >
                  <i className={`bi ${currentView === 'preview' ? 'bi-pencil' : 'bi-eye'} me-1`}></i>
                  {currentView === 'preview' ? 'Chỉnh sửa' : 'Xem trước'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Main Area */}
        <div className="editor-main-area flex-grow-1 d-flex overflow-hidden">
          {/* Slide List */}
          <EnhancedSlideList
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSelectSlide={setCurrentSlideIndex}
            onAddSlide={addSlide}
            onDeleteSlide={deleteCurrentSlide}
            onMoveSlide={moveSlide}
            onDuplicateSlide={duplicateCurrentSlide}
          />

          {/* Editor or Preview */}
          <div className="editor-content flex-grow-1 overflow-auto">
            {currentView === 'edit' ? (
              <SlideEditor
                currentSlide={slides[currentSlideIndex] || {}}
                template={currentTemplate}
                updateSlide={updateCurrentSlide}
              />
            ) : (
              <SlidePreview
                slides={slides}
                currentSlideIndex={currentSlideIndex}
                onNavigate={setCurrentSlideIndex}
              />
            )}
          </div>

          {/* Tools Panel */}
          {currentView === 'edit' && (
            <EnhancedToolsPanel
              onAddElement={handleAddElement}
              onSelectTemplate={() => setShowTemplateSelector(true)}
              onUseAI={() => setShowAIDialog(true)}
              currentSlide={slides[currentSlideIndex] || {}}
              template={currentTemplate}
            />
          )}
        </div>

        {/* Status bar */}
        <div className="editor-statusbar border-top py-1 px-3 d-flex justify-content-between align-items-center bg-light">
          <div className="slide-info">
            Slide {currentSlideIndex + 1}/{slides.length}
          </div>
          <div className="status-info">
            {saveStatus && (
              <span className="text-success">{saveStatus}</span>
            )}
          </div>
        </div>

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <EnhancedTemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplateSelector(false)}
            currentTemplateId={slides[currentSlideIndex]?.template}
          />
        )}

        {/* AI Dialog */}
        {showAIDialog && (
          <AIDialog
            show={showAIDialog}
            onClose={() => setShowAIDialog(false)}
            onGenerate={handleAIGenerate}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default EnhancedEditor;