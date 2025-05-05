import React, { useState } from 'react';
import './TemplateSelector.css';

// Dữ liệu templates
const templateCategories = [
  {
    id: 'popular',
    name: 'Phổ biến',
    templates: [
      { id: 'business', name: 'Kinh doanh', color: '#0a66c2', tags: ['kinh doanh', 'chuyên nghiệp'], imageUrl: 'https://placehold.co/300x180?text=Business' },
      { id: 'creative', name: 'Sáng tạo', color: '#ff7262', tags: ['sáng tạo', 'thiết kế'], imageUrl: 'https://placehold.co/300x180?text=Creative' },
      { id: 'education', name: 'Giáo dục', color: '#5cb85c', tags: ['giáo dục', 'đào tạo'], imageUrl: 'https://placehold.co/300x180?text=Education' },
    ]
  },
  {
    id: 'presentation',
    name: 'Thuyết trình',
    templates: [
      { id: 'pitch', name: 'Thuyết trình dự án', color: '#9c27b0', tags: ['thuyết trình', 'dự án'], imageUrl: 'https://placehold.co/300x180?text=Pitch' },
      { id: 'sales', name: 'Sales Deck', color: '#f44336', tags: ['bán hàng', 'marketing'], imageUrl: 'https://placehold.co/300x180?text=Sales' },
      { id: 'report', name: 'Báo cáo tổng kết', color: '#2196f3', tags: ['báo cáo', 'tổng kết'], imageUrl: 'https://placehold.co/300x180?text=Report' },
    ]
  },
  {
    id: 'professional',
    name: 'Chuyên nghiệp',
    templates: [
      { id: 'corporate', name: 'Doanh nghiệp', color: '#0d47a1', tags: ['doanh nghiệp', 'công ty'], imageUrl: 'https://placehold.co/300x180?text=Corporate' },
      { id: 'minimal', name: 'Tối giản', color: '#212121', tags: ['tối giản', 'đơn giản'], imageUrl: 'https://placehold.co/300x180?text=Minimal', textColor: 'white' },
      { id: 'portfolio', name: 'Portfolio', color: '#e91e63', tags: ['portfolio', 'cá nhân'], imageUrl: 'https://placehold.co/300x180?text=Portfolio' },
    ]
  },
  {
    id: 'academic',
    name: 'Học thuật',
    templates: [
      { id: 'thesis', name: 'Luận văn', color: '#004d40', tags: ['luận văn', 'học thuật'], imageUrl: 'https://placehold.co/300x180?text=Thesis' },
      { id: 'research', name: 'Nghiên cứu', color: '#0097a7', tags: ['nghiên cứu', 'khoa học'], imageUrl: 'https://placehold.co/300x180?text=Research' },
      { id: 'lecture', name: 'Bài giảng', color: '#00796b', tags: ['bài giảng', 'giáo dục'], imageUrl: 'https://placehold.co/300x180?text=Lecture' },
    ]
  },
  {
    id: 'special',
    name: 'Đặc biệt',
    templates: [
      { id: 'event', name: 'Sự kiện', color: '#ff9800', tags: ['sự kiện', 'lễ hội'], imageUrl: 'https://placehold.co/300x180?text=Event' },
      { id: 'infographic', name: 'Infographic', color: '#8bc34a', tags: ['infographic', 'dữ liệu'], imageUrl: 'https://placehold.co/300x180?text=Infographic' },
      { id: 'timeline', name: 'Timeline', color: '#3f51b5', tags: ['timeline', 'lịch sử'], imageUrl: 'https://placehold.co/300x180?text=Timeline' },
    ]
  },
];

const TemplateSelector = ({ onSelectTemplate, onUseAI }) => {
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');

  // Lọc templates dựa trên từ khóa tìm kiếm
  const getFilteredTemplates = () => {
    if (!searchTerm.trim()) {
      return templateCategories.find(cat => cat.id === selectedCategory)?.templates || [];
    }

    const searchTermLower = searchTerm.toLowerCase();
    const allTemplates = templateCategories.flatMap(cat => cat.templates);
    
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(searchTermLower) || 
      template.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
    );
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  const handleUseAI = () => {
    if (aiPrompt.trim()) {
      onUseAI(aiPrompt);
    }
  };

  return (
    <div className="template-selector">
      <div className="template-selector-header">
        <div className="search-container">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm template..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!searchTerm && (
        <div className="template-categories">
          {templateCategories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="templates-container">
        {getFilteredTemplates().length > 0 ? (
          <>
            <div className="templates-grid">
              {getFilteredTemplates().map(template => (
                <div 
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="template-card-preview">
                    <img src={template.imageUrl} alt={template.name} />
                    <div className="template-overlay" style={{ backgroundColor: template.color }}>
                      <span className="template-name" style={{ color: template.textColor || 'white' }}>
                        {template.name}
                      </span>
                    </div>
                  </div>
                  <div className="template-card-footer">
                    <h4>{template.name}</h4>
                    <div className="template-tags">
                      {template.tags.map((tag, idx) => (
                        <span key={idx} className="template-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="template-card empty">
                <div className="template-card-preview empty">
                  <div className="empty-icon">
                    <i className="bi bi-plus-lg"></i>
                    <span>Trống</span>
                  </div>
                </div>
                <div className="template-card-footer">
                  <h4>Bắt đầu trống</h4>
                  <div className="template-tags">
                    <span className="template-tag">Tùy chỉnh</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedTemplate && (
              <div className="template-preview-panel">
                <div className="preview-header">
                  <h3>Xem trước template</h3>
                  <button className="use-template-btn" onClick={handleUseTemplate}>
                    Sử dụng template này
                  </button>
                </div>
                <div className="preview-content">
                  <div className="preview-image" style={{ backgroundColor: selectedTemplate.color }}>
                    <img src={selectedTemplate.imageUrl} alt={selectedTemplate.name} />
                  </div>
                  <div className="preview-details">
                    <h2>{selectedTemplate.name}</h2>
                    <div className="preview-tags">
                      {selectedTemplate.tags.map((tag, idx) => (
                        <span key={idx} className="preview-tag">{tag}</span>
                      ))}
                    </div>
                    <p className="preview-description">
                      Template {selectedTemplate.name} hoàn hảo cho các bài thuyết trình {selectedTemplate.tags.join(', ')}.
                      Thiết kế chuyên nghiệp với bố cục rõ ràng và dễ tùy chỉnh.
                    </p>
                    <div className="preview-features">
                      <div className="feature-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Bố cục chuyên nghiệp</span>
                      </div>
                      <div className="feature-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Đa dạng loại slide</span>
                      </div>
                      <div className="feature-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Dễ dàng tùy chỉnh</span>
                      </div>
                      <div className="feature-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Hiệu ứng chuyển cảnh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-templates">
            <i className="bi bi-search"></i>
            <h3>Không tìm thấy template phù hợp</h3>
            <p>Thử tìm kiếm với từ khóa khác hoặc sử dụng AI để tạo bài thuyết trình</p>
          </div>
        )}
      </div>

      <div className="ai-creation-section">
        <h3>
          <i className="bi bi-magic"></i>
          Tạo bài thuyết trình với AI
        </h3>
        <p>Chỉ cần nhập chủ đề hoặc mô tả, AI sẽ tự động tạo bài thuyết trình cho bạn</p>
        <div className="ai-input-container">
          <textarea
            placeholder="Nhập chủ đề hoặc mô tả chi tiết cho bài thuyết trình của bạn..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          ></textarea>
          <button 
            className="ai-generate-btn"
            onClick={handleUseAI}
            disabled={!aiPrompt.trim()}
          >
            <i className="bi bi-lightning"></i>
            Tạo với AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 