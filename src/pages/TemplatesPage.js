import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import TemplateSelector from '../components/Templates/TemplateSelector';
import TemplateDetails from '../components/Templates/TemplateDetails';
import './TemplatesPage.css';

const TemplatesPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Danh mục template
  const templateCategories = [
    {
      id: 'popular',
      name: 'Phổ biến',
      icon: 'bi-star',
      description: 'Các template được sử dụng nhiều nhất'
    },
    {
      id: 'presentation',
      name: 'Thuyết trình',
      icon: 'bi-easel',
      description: 'Template cho các bài thuyết trình chuyên nghiệp'
    },
    {
      id: 'professional',
      name: 'Chuyên nghiệp',
      icon: 'bi-briefcase',
      description: 'Template cho môi trường công sở và doanh nghiệp'
    },
    {
      id: 'academic',
      name: 'Học thuật',
      icon: 'bi-book',
      description: 'Template phù hợp cho giáo dục và nghiên cứu'
    },
    {
      id: 'special',
      name: 'Đặc biệt',
      icon: 'bi-gem',
      description: 'Template cho các trường hợp đặc biệt'
    }
  ];

  // Xử lý khi chọn template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowDetails(true);
  };

  // Xử lý khi sử dụng template
  const handleUseTemplate = (template) => {
    navigate('/editor', { state: { template: template.id } });
  };

  // Xử lý khi tạo với AI
  const handleUseAI = (prompt) => {
    navigate('/editor', { state: { aiPrompt: prompt } });
  };

  return (
    <div className="templates-page">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <div className="templates-container">
        <div className="templates-header">
          <div className="container">
            <h1>Thư viện template</h1>
            <p>
              Khám phá và lựa chọn từ hàng trăm template chuyên nghiệp được thiết kế 
              bởi đội ngũ chuyên gia. Mỗi template đều được tối ưu hóa cho từng mục đích 
              sử dụng cụ thể.
            </p>
          </div>
        </div>

        {showDetails && selectedTemplate ? (
          <div className="container">
            <div className="details-nav">
              <button onClick={() => setShowDetails(false)} className="back-btn">
                <i className="bi bi-arrow-left"></i> Quay lại thư viện
              </button>
            </div>
            <TemplateDetails 
              template={selectedTemplate} 
              onUseTemplate={handleUseTemplate}
            />
          </div>
        ) : (
          <>
            <div className="categories-section">
              <div className="container">
                <div className="categories-grid">
                  {templateCategories.map(category => (
                    <div key={category.id} className="category-card">
                      <div className="category-icon">
                        <i className={`bi ${category.icon}`}></i>
                      </div>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="selector-section">
              <div className="container">
                <TemplateSelector 
                  onSelectTemplate={handleSelectTemplate}
                  onUseAI={handleUseAI}
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default TemplatesPage; 