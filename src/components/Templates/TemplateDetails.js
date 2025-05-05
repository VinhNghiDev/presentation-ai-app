import React from 'react';
import './TemplateDetails.css';
import TemplateThumbnail from './TemplateThumbnail';

const TemplateDetails = ({ template, onUseTemplate }) => {
  if (!template) return null;
  
  // Danh sách các slide mẫu trong template
  const sampleSlides = [
    { name: 'Trang bìa', description: 'Slide giới thiệu chính về bài thuyết trình' },
    { name: 'Mục lục', description: 'Liệt kê nội dung chính trong bài thuyết trình' },
    { name: 'Giới thiệu', description: 'Bối cảnh và tổng quan về chủ đề' },
    { name: 'Phần chính', description: 'Trình bày nội dung chi tiết với dữ liệu và ví dụ' },
    { name: 'Kết luận', description: 'Tóm tắt và kết luận bài thuyết trình' }
  ];

  // Các tính năng template
  const features = [
    { icon: 'bi-layout-text-window', text: 'Bố cục chuyên nghiệp' },
    { icon: 'bi-palette2', text: 'Phối màu hài hòa' },
    { icon: 'bi-layers', text: 'Đa dạng loại slide' },
    { icon: 'bi-images', text: 'Vị trí hình ảnh tối ưu' },
    { icon: 'bi-fonts', text: 'Typography hiện đại' },
    { icon: 'bi-easel', text: 'Hiệu ứng chuyển cảnh' }
  ];

  return (
    <div className="template-details">
      <div className="template-header">
        <div className="template-preview-large">
          <TemplateThumbnail template={template} size="large" />
        </div>
        <div className="template-info">
          <h2 className="template-title">{template.name}</h2>
          <div className="template-tags">
            {template.tags && template.tags.map((tag, idx) => (
              <span key={idx} className="template-tag">{tag}</span>
            ))}
          </div>
          <p className="template-description">
            Template {template.name} được thiết kế chuyên biệt cho các bài thuyết trình 
            {template.tags ? ' về ' + template.tags.join(', ') : ''}. Với bố cục rõ ràng 
            và thiết kế hiện đại, template này sẽ giúp bài thuyết trình của bạn trở nên 
            chuyên nghiệp và thu hút người xem.
          </p>
          <button className="use-template-btn" onClick={() => onUseTemplate(template)}>
            Sử dụng template này
          </button>
        </div>
      </div>

      <div className="template-sections">
        <div className="template-section">
          <h3 className="section-title">
            <i className="bi bi-grid-3x3"></i>
            Các slide mẫu
          </h3>
          <div className="slide-list">
            {sampleSlides.map((slide, idx) => (
              <div key={idx} className="slide-item">
                <div className="slide-number">{idx + 1}</div>
                <div className="slide-content">
                  <h4>{slide.name}</h4>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="template-section">
          <h3 className="section-title">
            <i className="bi bi-stars"></i>
            Tính năng nổi bật
          </h3>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                <i className={`bi ${feature.icon}`}></i>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tips-section">
        <h3 className="section-title">
          <i className="bi bi-lightbulb"></i>
          Lời khuyên khi sử dụng
        </h3>
        <ul className="tips-list">
          <li>Giữ nội dung ngắn gọn và dễ đọc, sử dụng điểm nhấn cho phần quan trọng</li>
          <li>Sử dụng hình ảnh chất lượng cao và liên quan đến nội dung</li>
          <li>Tùy chỉnh màu sắc phù hợp với thương hiệu hoặc chủ đề của bạn</li>
          <li>Tập trung vào một ý tưởng chính cho mỗi slide</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateDetails; 