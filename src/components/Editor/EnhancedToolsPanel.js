// src/components/Editor/EnhancedToolsPanel.js
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { createNewElement } from '../../utils/editorUtils';
import { TableCreator } from './TableEditor';

/**
 * Enhanced Tools Panel Component
 * @param {Object} props
 * @param {Function} props.onAddElement - Callback khi thêm phần tử
 * @param {Function} props.onSelectTemplate - Callback khi chọn template
 * @param {Function} props.onUseAI - Callback khi sử dụng AI
 * @param {Object} props.currentSlide - Slide hiện tại
 * @param {Object} props.template - Template hiện tại
 */
const EnhancedToolsPanel = ({
  onAddElement,
  onSelectTemplate,
  onUseAI,
  currentSlide,
  template
}) => {
  const [activeTab, setActiveTab] = useState('elements'); // 'elements', 'style', 'ai'
  const [showElementOptions, setShowElementOptions] = useState(null);
  const [showTableCreator, setShowTableCreator] = useState(false);

  // Danh sách các phần tử có thể thêm
  const elementTools = [
    { id: 'text', name: 'Văn bản', icon: 'bi-type', subTypes: [
      { id: 'heading', name: 'Tiêu đề lớn' },
      { id: 'subheading', name: 'Tiêu đề phụ' },
      { id: 'paragraph', name: 'Đoạn văn' },
      { id: 'bullet-list', name: 'Danh sách đánh dấu' },
      { id: 'numbered-list', name: 'Danh sách đánh số' }
    ]},
    { id: 'image', name: 'Hình ảnh', icon: 'bi-image', subTypes: [
      { id: 'image-library', name: 'Thư viện hình ảnh' },
      { id: 'image-upload', name: 'Tải lên hình ảnh' },
      { id: 'image-url', name: 'Từ URL' }
    ]},
    { id: 'shape', name: 'Hình dạng', icon: 'bi-square', subTypes: [
      { id: 'rectangle', name: 'Hình chữ nhật' },
      { id: 'circle', name: 'Hình tròn' },
      { id: 'triangle', name: 'Hình tam giác' },
      { id: 'line', name: 'Đường thẳng' },
      { id: 'arrow', name: 'Mũi tên' }
    ]},
    { id: 'table', name: 'Bảng', icon: 'bi-table' },
    { id: 'icon', name: 'Biểu tượng', icon: 'bi-emoji-smile' }
  ];

  // Danh sách các tùy chọn style
  const styleOptions = [
    { id: 'template', name: 'Thay đổi template', icon: 'bi-palette', action: onSelectTemplate },
    { id: 'background', name: 'Màu nền', icon: 'bi-card-image' },
    { id: 'typography', name: 'Phông chữ', icon: 'bi-fonts' },
    { id: 'color-scheme', name: 'Bảng màu', icon: 'bi-palette2' }
  ];

  // Danh sách các tùy chọn AI
  const aiOptions = [
    { id: 'generate-content', name: 'Tạo nội dung', icon: 'bi-magic', action: onUseAI },
    { id: 'improve-content', name: 'Cải thiện nội dung', icon: 'bi-stars' },
    { id: 'summarize', name: 'Tóm tắt nội dung', icon: 'bi-file-earmark-text' },
    { id: 'generate-image', name: 'Tạo hình ảnh', icon: 'bi-image-alt' }
  ];

  /**
   * Xử lý khi click vào phần tử
   * @param {string} elementType - Loại phần tử
   */
  const handleElementClick = (elementType) => {
    const element = elementTools.find(el => el.id === elementType);
    
    if (element && element.subTypes) {
      setShowElementOptions(elementType);
    } else {
      handleAddElement(elementType);
    }
  };

  /**
   * Xử lý khi thêm phần tử
   * @param {string} elementType - Loại phần tử
   * @param {string} subType - Loại phần tử con (tùy chọn)
   */
  const handleAddElement = (elementType, subType = null) => {
    const element = createNewElement(elementType, {
      subType,
      style: {}
    });
    
    if (onAddElement) {
      onAddElement(element);
    }
    
    setShowElementOptions(null);
  };

  const handleAddTable = (tableData) => {
    if (onAddElement) {
      onAddElement({
        type: 'table',
        data: tableData,
        position: { x: 50, y: 50 },
        size: { width: 500, height: 300 }
      });
    }
    setShowTableCreator(false);
  };

  /**
   * Render nội dung tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'elements':
        return (
          <div className="elements-tab">
            <h6 className="mb-3">Thêm phần tử</h6>
            <div className="element-tools">
              {elementTools.map(tool => (
                <div key={tool.id} className="position-relative mb-2">
                  <button
                    className="btn btn-outline-secondary w-100 text-start d-flex align-items-center"
                    onClick={() => handleElementClick(tool.id)}
                  >
                    <i className={`bi ${tool.icon} me-2`}></i>
                    {tool.name}
                    {tool.subTypes && (
                      <i className="bi bi-chevron-down ms-auto"></i>
                    )}
                  </button>
                  
                  {showElementOptions === tool.id && tool.subTypes && (
                    <div className="element-options position-absolute bg-white shadow-sm border rounded w-100 mt-1" style={{ zIndex: 10 }}>
                      {tool.subTypes.map(subType => (
                        <button
                          key={subType.id}
                          className="btn btn-sm btn-light w-100 text-start"
                          onClick={() => handleAddElement(tool.id, subType.id)}
                        >
                          {subType.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'style':
        return (
          <div className="style-tab">
            <h6 className="mb-3">Tùy chỉnh Style</h6>
            <div className="style-options">
              {styleOptions.map(option => (
                <button
                  key={option.id}
                  className="btn btn-outline-secondary w-100 text-start d-flex align-items-center mb-2"
                  onClick={option.action}
                >
                  <i className={`bi ${option.icon} me-2`}></i>
                  {option.name}
                </button>
              ))}
            </div>
            
            <div className="current-template-info mt-4">
              <h6 className="mb-2">Template hiện tại</h6>
              <div className="card">
                <div className="card-body p-2">
                  <div 
                    className="template-preview mb-2 p-2 rounded"
                    style={{ 
                      backgroundColor: template?.colors?.background || '#ffffff',
                      color: template?.colors?.text || '#333333',
                      fontFamily: template?.fontFamily || 'Arial, sans-serif',
                      border: `1px solid ${template?.colors?.primary || '#1a73e8'}`
                    }}
                  >
                    <div 
                      className="template-preview-header p-1 mb-1 rounded"
                      style={{ 
                        backgroundColor: template?.colors?.primary || '#1a73e8',
                        color: '#ffffff'
                      }}
                    >
                      Header
                    </div>
                    <div className="template-preview-content small">
                      Content
                    </div>
                  </div>
                  <h6 className="mb-0 small">{template?.name || 'Template mặc định'}</h6>
                  <p className="mb-0 small text-muted">{template?.description || 'Không có mô tả'}</p>
                </div>
              </div>
            </div>
            
            <div className="slide-options mt-4">
              <h6 className="mb-2">Tùy chọn slide</h6>
              <div className="mb-3">
                <label className="form-label small">Bố cục</label>
                <select className="form-select form-select-sm">
                  <option value="title">Slide tiêu đề</option>
                  <option value="content">Slide nội dung</option>
                  <option value="image-content">Slide hình ảnh & nội dung</option>
                  <option value="quote">Slide trích dẫn</option>
                  <option value="comparison">Slide so sánh</option>
                  <option value="data">Slide dữ liệu</option>
                  <option value="thank-you">Slide cảm ơn</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'ai':
        return (
          <div className="ai-tab">
            <h6 className="mb-3">Tính năng AI</h6>
            <div className="ai-options">
              {aiOptions.map(option => (
                <button
                  key={option.id}
                  className="btn btn-outline-primary w-100 text-start d-flex align-items-center mb-2"
                  onClick={option.action}
                >
                  <i className={`bi ${option.icon} me-2`}></i>
                  {option.name}
                </button>
              ))}
            </div>
            
            <div className="ai-prompt mt-4">
              <h6 className="mb-2">Gợi ý bằng AI</h6>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Mô tả nội dung bạn muốn AI tạo..."
                ></textarea>
              </div>
              <button className="btn btn-primary btn-sm w-100">
                <i className="bi bi-magic me-2"></i>
                Tạo nội dung
              </button>
            </div>
            
            <div className="ai-suggestions mt-4">
              <h6 className="mb-2">Đề xuất cải thiện</h6>
              <div className="list-group">
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-stars me-2 text-primary"></i>
                  Cải thiện cấu trúc
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-spellcheck me-2 text-primary"></i>
                  Kiểm tra lỗi chính tả
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-graph-up me-2 text-primary"></i>
                  Thêm dữ liệu minh họa
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="tools-panel bg-light border-start overflow-auto" style={{ width: '250px', padding: '16px' }}>
      {/* Tab Headers */}
      <ul className="nav nav-pills nav-fill mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'elements' ? 'active' : ''}`}
            onClick={() => setActiveTab('elements')}
          >
            <i className="bi bi-grid me-1"></i>
            Phần tử
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            <i className="bi bi-palette me-1"></i>
            Style
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <i className="bi bi-magic me-1"></i>
            AI
          </button>
        </li>
      </ul>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      <div className="tools-group mb-3">
        <h6 className="mb-2">Thành phần nâng cao</h6>
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowTableCreator(true)}
          >
            <i className="bi bi-table me-1"></i> Bảng
          </Button>
        </div>
      </div>
      
      {showTableCreator && (
        <TableCreator 
          onSelectTable={handleAddTable}
          onClose={() => setShowTableCreator(false)}
        />
      )}
    </div>
  );
};

export default EnhancedToolsPanel;