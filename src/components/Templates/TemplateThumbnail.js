import React from 'react';
import './TemplateThumbnail.css';

// Component hiển thị hình ảnh xem trước cho các template
const TemplateThumbnail = ({ template, size = 'medium' }) => {
  const { id, name, color, textColor = 'white' } = template;
  
  // Mảng các phần tử mẫu cho từng loại template để hiển thị
  const getTemplatePreview = () => {
    switch (id) {
      case 'business':
        return (
          <div className="business-preview">
            <div className="preview-header" style={{ backgroundColor: color }}>
              <div className="preview-circle"></div>
              <div className="preview-line"></div>
            </div>
            <div className="preview-body">
              <div className="preview-title-block"></div>
              <div className="preview-content">
                <div className="preview-graph"></div>
                <div className="preview-text">
                  <div className="preview-line short"></div>
                  <div className="preview-line medium"></div>
                  <div className="preview-line long"></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'creative':
        return (
          <div className="creative-preview">
            <div className="preview-side" style={{ backgroundColor: color }}></div>
            <div className="preview-content">
              <div className="preview-title-block"></div>
              <div className="preview-image-block"></div>
              <div className="preview-text">
                <div className="preview-line short"></div>
                <div className="preview-line long"></div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="minimal-preview" style={{ backgroundColor: color }}>
            <div className="preview-content" style={{ color: textColor }}>
              <div className="preview-title-block"></div>
              <div className="preview-line medium"></div>
              <div className="preview-line short"></div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="education-preview">
            <div className="preview-top" style={{ backgroundColor: color }}></div>
            <div className="preview-content">
              <div className="preview-title-block"></div>
              <div className="preview-points">
                <div className="preview-point">
                  <div className="preview-bullet" style={{ backgroundColor: color }}></div>
                  <div className="preview-line medium"></div>
                </div>
                <div className="preview-point">
                  <div className="preview-bullet" style={{ backgroundColor: color }}></div>
                  <div className="preview-line long"></div>
                </div>
                <div className="preview-point">
                  <div className="preview-bullet" style={{ backgroundColor: color }}></div>
                  <div className="preview-line short"></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="default-preview" style={{ backgroundColor: color }}>
            <div className="preview-title" style={{ color: textColor }}>{name}</div>
          </div>
        );
    }
  };

  return (
    <div className={`template-thumbnail ${size}`}>
      {getTemplatePreview()}
    </div>
  );
};

export default TemplateThumbnail; 