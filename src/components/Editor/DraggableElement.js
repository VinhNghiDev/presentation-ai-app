import React, { useState, useRef, useEffect } from 'react';

/**
 * Component phần tử có thể kéo thả
 * @param {object} props - Props
 * @param {object} props.element - Thông tin phần tử
 * @param {function} props.onUpdate - Callback khi phần tử thay đổi
 * @param {function} props.onSelect - Callback khi phần tử được chọn
 * @param {boolean} props.isSelected - Trạng thái đã chọn
 * @param {string} props.className - CSS class bổ sung
 */
const DraggableElement = ({ 
  element, 
  onUpdate, 
  onSelect, 
  isSelected,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [resizeStartPoint, setResizeStartPoint] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  
  const elementRef = useRef(null);
  const contentEditableRef = useRef(null);
  
  // Xử lý bắt đầu kéo
  const handleDragStart = (e) => {
    // Ngăn chọn text khi kéo
    e.preventDefault();
    
    if (!isSelected) {
      onSelect(element.id);
    }
    
    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setInitialPos({
      x: element.position.x,
      y: element.position.y
    });
    
    setIsDragging(true);
    
    // Đăng ký sự kiện toàn cục
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };
  
  // Xử lý kéo
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    // Tính toán vị trí mới
    const parent = elementRef.current.parentElement;
    const parentRect = parent.getBoundingClientRect();
    
    const x = e.clientX - parentRect.left - dragOffset.x;
    const y = e.clientY - parentRect.top - dragOffset.y;
    
    // Đảm bảo phần tử nằm trong canvas
    const boundedX = Math.max(0, Math.min(x, parentRect.width - element.size.width));
    const boundedY = Math.max(0, Math.min(y, parentRect.height - element.size.height));
    
    onUpdate({
      ...element,
      position: {
        x: boundedX,
        y: boundedY
      }
    });
  };
  
  // Xử lý kết thúc kéo
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Hủy đăng ký sự kiện toàn cục
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };
  
  // Xử lý bắt đầu resize
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSelected) {
      onSelect(element.id);
    }
    
    setResizeStartPoint({
      x: e.clientX,
      y: e.clientY
    });
    
    setInitialSize({
      width: element.size.width,
      height: element.size.height
    });
    
    setIsResizing(true);
    
    // Đăng ký sự kiện toàn cục
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Xử lý resize
  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    // Tính toán kích thước mới
    const deltaX = e.clientX - resizeStartPoint.x;
    const deltaY = e.clientY - resizeStartPoint.y;
    
    const newWidth = Math.max(50, initialSize.width + deltaX);
    const newHeight = Math.max(50, initialSize.height + deltaY);
    
    onUpdate({
      ...element,
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  };
  
  // Xử lý kết thúc resize
  const handleResizeEnd = () => {
    setIsResizing(false);
    
    // Hủy đăng ký sự kiện toàn cục
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  // Xử lý click chọn phần tử
  const handleElementClick = (e) => {
    e.stopPropagation();
    onSelect(element.id);
  };
  
  // Xử lý chỉnh sửa nội dung
  const handleContentClick = (e) => {
    e.stopPropagation();
    if (element.type === 'text' && isSelected) {
      setIsEditing(true);
    }
  };
  
  // Xử lý khi kết thúc chỉnh sửa
  const handleContentBlur = () => {
    if (isEditing && contentEditableRef.current) {
      onUpdate({
        ...element,
        content: contentEditableRef.current.textContent || ''
      });
      setIsEditing(false);
    }
  };
  
  // Xử lý phím tắt khi chỉnh sửa
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      contentEditableRef.current.blur();
    }
  };
  
  // Đăng ký sự kiện xử lý phím tắt khi chỉnh sửa
  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(contentEditableRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      contentEditableRef.current.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (contentEditableRef.current) {
        contentEditableRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isEditing]);
  
  // Tạo nội dung phần tử
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            ref={contentEditableRef}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            onClick={handleContentClick}
            onBlur={handleContentBlur}
            className="w-full h-full p-2 overflow-auto"
            style={{
              cursor: isEditing ? 'text' : 'pointer',
              outline: 'none',
              fontSize: element.style?.fontSize || '16px',
              fontWeight: element.style?.fontWeight || 'normal',
              color: element.style?.color || 'inherit',
              textAlign: element.style?.textAlign || 'left',
              ...element.style
            }}
          >
            {element.content}
          </div>
        );
      
      case 'image':
        return (
          <img
            src={element.content}
            alt="Element"
            className="w-full h-full object-contain"
            style={{
              cursor: 'pointer',
              ...element.style
            }}
          />
        );
      
      case 'shape':
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: element.style?.backgroundColor || '#e0e0e0',
              borderRadius: element.content === 'circle' ? '50%' : (element.style?.borderRadius || '0'),
              border: element.style?.border || 'none',
              ...element.style
            }}
          >
            {element.style?.text && (
              <span>{element.style.text}</span>
            )}
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-center p-2">
            {element.content || 'Nội dung phần tử'}
          </div>
        );
    }
  };
  
  return (
    <div
      ref={elementRef}
      className={`absolute ${className} ${isSelected ? 'element-selected' : ''} ${isDragging ? 'opacity-75' : ''}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #0d6efd' : '1px solid transparent',
        boxShadow: isSelected ? '0 0 0 2px rgba(13, 110, 253, 0.2)' : 'none',
        zIndex: isSelected ? 10 : 1,
        userSelect: 'none'
      }}
      onClick={handleElementClick}
      onMouseDown={handleDragStart}
    >
      {renderElementContent()}
      
      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute cursor-se-resize bg-white border border-primary rounded-full"
          style={{
            width: '12px',
            height: '12px',
            right: '-6px',
            bottom: '-6px',
            zIndex: 20
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default DraggableElement;