import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import TemplateSelector from '../components/Templates/TemplateSelector';
import TemplateDetails from '../components/Templates/TemplateDetails';
import templateService from '../services/templateService';
import { toast } from 'react-toastify';
import './TemplatesPage.css';

const TemplatesPage = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [templatesData, categoriesData] = await Promise.all([
          templateService.getTemplates(),
          templateService.getCategories()
        ]);
        setTemplates(templatesData);
        setCategories(['Tất cả', ...categoriesData]);
      } catch (err) {
        setError('Không thể tải dữ liệu template');
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'Tất cả' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    // TODO: Implement AI creation
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const results = await templateService.searchTemplates(searchQuery);
      setTemplates(results);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

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