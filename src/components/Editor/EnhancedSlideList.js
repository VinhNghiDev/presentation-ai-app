// src/components/Editor/EnhancedSlideList.js
import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getTemplateById } from '../../utils/enhancedTemplates';

// Constants
const ITEM_TYPE = 'SLIDE';

/**
 * Slide Item Component - Draggable
 */
const SlideItem = ({ slide, index, currentIndex, onSelect, onDelete, onDuplicate, onMoveSlide }) => {
  // Cấu hình kéo thả
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: ITEM_TYPE,
    hover(item, monitor) {
      if (item.index === index) {
        return;
      }
      onMoveSlide(item.index, index);
      item.index = index;
    },
  });

  // Drop menu state
  const [showDropMenu, setShowDropMenu] = useState(false);

  // Lấy thông tin template
  const template = getTemplateById(slide.template);
  const isSelected = index === currentIndex;

  // Ref kết hợp kéo và thả
  const ref = (node) => {
    dragRef(node);
    dropRef(node);
  };

  return (
    <div
      ref={ref}
      className={`slide-item mb-2 ${isSelected ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={() => onSelect(index)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
      }}
    >
      <div 
        className="slide-preview p-2 border rounded"
        style={{
          backgroundColor: template?.colors?.background || '#ffffff',
          color: template?.colors?.text || '#333333',
          borderColor: isSelected ? '#0d6efd' : '#dee2e6',
          borderWidth: isSelected ? '2px' : '1px',
        }}
      >
        <div className="slide-number position-absolute top-0 start-0 p-1 bg-light rounded-bottom rounded-end" style={{ fontSize: '0.7rem' }}>
          {index + 1}
        </div>
        
        <div className="slide-actions position-absolute top-0 end-0">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light rounded-circle"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropMenu(!showDropMenu);
              }}
              style={{ width: '24px', height: '24px', padding: 0 }}
            >
              <i className="bi bi-three-dots-vertical small"></i>
            </button>
            
            {showDropMenu && (
              <div className="dropdown-menu show dropdown-menu-end position-absolute" style={{ right: 0, top: '24px' }}>
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(index);
                    setShowDropMenu(false);
                  }}
                >
                  <i className="bi bi-files me-2"></i>
                  Nhân bản
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index);
                    setShowDropMenu(false);
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="slide-content p-2 text-center" style={{ minHeight: '60px', marginTop: '10px' }}>
          <div className="slide-title small text-truncate" style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
            {slide.title || 'Slide không có tiêu đề'}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Slide List Component
 * @param {Object} props
 * @param {Array} props.slides - Danh sách slide
 * @param {number} props.currentSlideIndex - Index của slide hiện tại
 * @param {Function} props.onSelectSlide - Callback khi chọn slide
 * @param {Function} props.onAddSlide - Callback khi thêm slide
 * @param {Function} props.onDeleteSlide - Callback khi xóa slide
 * @param {Function} props.onMoveSlide - Callback khi di chuyển slide
 * @param {Function} props.onDuplicateSlide - Callback khi nhân bản slide
 */
const EnhancedSlideList = ({
  slides = [],
  currentSlideIndex = 0,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onMoveSlide,
  onDuplicateSlide
}) => {
  const [showNewSlideOptions, setShowNewSlideOptions] = useState(false);

  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) {
      alert('Không thể xóa slide cuối cùng');
      return;
    }
    
    if (window.confirm('Bạn có chắc muốn xóa slide này?')) {
      onDeleteSlide(index);
    }
  };

  return (
    <div className="slide-list-container bg-light border-end overflow-auto" style={{ width: '250px', padding: '16px' }}>
      <div className="slide-list-header d-flex justify-content-between align-items-center mb-3">
        <h6 className="m-0">Danh sách slide</h6>
        <div className="dropdown">
          <button
            className="btn btn-primary btn-sm dropdown-toggle"
            type="button"
            id="addSlideDropdown"
            onClick={() => setShowNewSlideOptions(!showNewSlideOptions)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm
          </button>
          
          {showNewSlideOptions && (
            <div className="dropdown-menu show position-absolute" aria-labelledby="addSlideDropdown">
              <h6 className="dropdown-header">Loại slide</h6>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('title');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-card-heading me-2"></i>
                Slide tiêu đề
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('content');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-card-text me-2"></i>
                Slide nội dung
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('image-content');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-card-image me-2"></i>
                Slide hình ảnh
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('quote');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-quote me-2"></i>
                Slide trích dẫn
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('comparison');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-columns-gap me-2"></i>
                Slide so sánh
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('data');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-bar-chart me-2"></i>
                Slide dữ liệu
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onAddSlide('thank-you');
                  setShowNewSlideOptions(false);
                }}
              >
                <i className="bi bi-emoji-smile me-2"></i>
                Slide cảm ơn
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="slide-list">
        {slides.length === 0 ? (
          <div className="text-center text-muted p-3">
            <p>Chưa có slide nào.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAddSlide('title')}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Thêm slide đầu tiên
            </button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <SlideItem
              key={slide.id || index}
              slide={slide}
              index={index}
              currentIndex={currentSlideIndex}
              onSelect={onSelectSlide}
              onDelete={() => handleDeleteSlide(index)}
              onDuplicate={onDuplicateSlide}
              onMoveSlide={onMoveSlide}
            />
          ))
        )}
      </div>
      
      <div className="slide-list-footer mt-3">
        <button
          className="btn btn-outline-secondary btn-sm w-100"
          onClick={() => onAddSlide('content')}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Thêm slide
        </button>
      </div>
    </div>
  );
};

export default EnhancedSlideList;