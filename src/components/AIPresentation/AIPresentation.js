import React, { useState } from 'react';
import { generatePresentation, suggestImageKeywords } from '../../services/apiService';
import { createNewElement } from '../../utils/editorUtils';

/**
 * Component cho việc tạo và quản lý bài thuyết trình AI
 */
const AIPresentation = ({ onGenerate, onClose }) => {
  // State cho form AI
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('professional');
  const [slideCount, setSlideCount] = useState(5);
  const [language, setLanguage] = useState('vi');
  const [purpose, setPurpose] = useState('business'); // Mục đích sử dụng
  const [audience, setAudience] = useState('general'); // Đối tượng người xem
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  
  // Các mẫu đề xuất
  const suggestionTopics = [
    'Chiến lược digital marketing 2024',
    'Xu hướng công nghệ AI trong doanh nghiệp',
    'Phương pháp học tập hiệu quả',
    'Kỹ năng thuyết trình chuyên nghiệp',
    'Xây dựng thương hiệu cá nhân'
  ];

  /**
   * Xử lý khi người dùng nhấn nút tạo
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề bài thuyết trình');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setProgress(5);
      setGenerationStatus('Đang khởi tạo...');

      // Tạo options cho API
      const options = {
        topic,
        style,
        slides: slideCount,
        language,
        purpose,
        audience,
        includeCharts,
        includeImages
      };

      setGenerationStatus('Đang tạo nội dung...');
      setProgress(20);

      // Gọi API để tạo nội dung
      const presentationData = await generatePresentation(options);
      setProgress(50);

      if (!presentationData || !presentationData.slides) {
        throw new Error('Không nhận được dữ liệu bài thuyết trình hợp lệ');
      }

      setGenerationStatus('Đang tối ưu hóa và xử lý hình ảnh...');
      setProgress(60);

      // Chuyển đổi dữ liệu từ API thành định dạng slide cho ứng dụng
      const convertedSlides = await convertToAppSlides(presentationData);
      setProgress(100);

      // Gọi callback để truyền dữ liệu về component cha
      onGenerate({
        title: presentationData.title || topic,
        slides: convertedSlides
      });

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating presentation:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo bài thuyết trình');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  /**
   * Tạo dữ liệu biểu đồ dựa trên nội dung slide
   */
  const generateChartData = async (slideContent, slideTitle) => {
    try {
      setGenerationStatus('Đang tạo dữ liệu biểu đồ...');
      
      // Dữ liệu mẫu để sử dụng khi API không trả về kết quả hợp lệ
      const defaultChartData = {
        chartType: 'bar',
        title: slideTitle,
        data: [
          {name: 'Mục 1', value: 30},
          {name: 'Mục 2', value: 50},
          {name: 'Mục 3', value: 20},
          {name: 'Mục 4', value: 40}
        ]
      };
      
      return defaultChartData;
    } catch (error) {
      console.error('Lỗi tạo dữ liệu biểu đồ:', error);
      // Trả về dữ liệu mặc định
      return {
        chartType: 'bar',
        title: slideTitle,
        data: [
          {name: 'Mục 1', value: 30},
          {name: 'Mục 2', value: 50},
          {name: 'Mục 3', value: 20},
          {name: 'Mục 4', value: 40}
        ]
      };
    }
  };

  /**
   * Chuyển đổi dữ liệu từ API thành định dạng slide cho ứng dụng
   */
  const convertToAppSlides = async (presentationData) => {
    const appSlides = [];
    
    for (let i = 0; i < presentationData.slides.length; i++) {
      const apiSlide = presentationData.slides[i];
      setGenerationStatus(`Đang xử lý slide ${i + 1}/${presentationData.slides.length}...`);
      setProgress(50 + Math.floor((i / presentationData.slides.length) * 50));
      
      // Tạo đối tượng slide mới
      const newSlide = {
        id: Date.now() + i,
        title: apiSlide.title,
        content: apiSlide.content,
        notes: apiSlide.notes || '',
        template: getTemplateForStyle(style),
        elements: []
      };
      
      // Thêm phần tử tiêu đề
      newSlide.elements.push({
        id: `title-${newSlide.id}`,
        type: 'text',
        content: apiSlide.title,
        style: {
          fontWeight: 'bold',
          fontSize: '24px',
          color: getThemeColor(style, 'header'),
          width: '80%',
          height: 'auto',
          top: '5%',
          left: '10%',
          textAlign: 'center',
          padding: '10px',
          zIndex: 10
        }
      });
      
      // Thêm phần tử nội dung
      newSlide.elements.push({
        id: `content-${newSlide.id}`,
        type: 'text',
        content: apiSlide.content,
        style: {
          fontSize: '18px',
          color: getThemeColor(style, 'text'),
          width: '80%',
          height: 'auto',
          top: '25%',
          left: '10%',
          padding: '10px',
          zIndex: 10
        }
      });
      
      // Thêm hình ảnh nếu có từ khóa
      if (apiSlide.keywords && apiSlide.keywords.length > 0 && includeImages) {
        const imageElement = createNewElement({
          type: 'image',
          src: `https://placehold.co/600x400?text=${encodeURIComponent(apiSlide.keywords[0])}`,
          alt: apiSlide.keywords[0],
          style: {
            width: '40%',
            height: 'auto',
            top: '55%',
            left: '55%',
            zIndex: 5
          }
        });
        newSlide.elements.push(imageElement);
      } else {
        // Nếu không có từ khóa, thử lấy từ khóa từ nội dung
        try {
          if (includeImages) {
            const keywordsResult = await suggestImageKeywords(apiSlide.content);
            if (keywordsResult && keywordsResult.keywords && keywordsResult.keywords.length > 0) {
              const imageElement = createNewElement({
                type: 'image',
                src: `https://placehold.co/600x400?text=${encodeURIComponent(keywordsResult.keywords[0])}`,
                alt: keywordsResult.keywords[0],
                style: {
                  width: '40%',
                  height: 'auto',
                  top: '55%',
                  left: '55%',
                  zIndex: 5
                }
              });
              newSlide.elements.push(imageElement);
            }
          }
        } catch (error) {
          console.error('Lỗi lấy từ khóa hình ảnh:', error);
        }
      }
      
      // Thêm biểu đồ nếu phù hợp
      if (includeCharts && shouldAddChart(apiSlide.content, i)) {
        try {
          const chartData = await generateChartData(apiSlide.content, apiSlide.title);
          const chartElement = createNewElement({
            type: 'chart',
            chartType: chartData.chartType || 'bar',
            chartTitle: chartData.title,
            data: chartData.data,
            style: {
              width: '45%',
              height: '40%',
              top: '45%',
              left: '5%',
              zIndex: 15
            }
          });
          newSlide.elements.push(chartElement);
        } catch (error) {
          console.error('Lỗi khi tạo biểu đồ:', error);
        }
      }
      
      appSlides.push(newSlide);
    }
    
    return appSlides;
  };

  /**
   * Kiểm tra xem có nên thêm biểu đồ vào slide không
   */
  const shouldAddChart = (content, slideIndex) => {
    const keywords = ['thống kê', 'số liệu', 'dữ liệu', 'phần trăm', '%', 'tăng trưởng', 'giảm', 'so sánh', 'kết quả'];
    // Không thêm biểu đồ vào slide đầu và cuối
    if (slideIndex === 0) return false;
    
    // Kiểm tra nội dung có phù hợp để thêm biểu đồ không
    return keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
  };

  /**
   * Lấy template phù hợp với phong cách
   */
  const getTemplateForStyle = (style) => {
    switch (style) {
      case 'professional': return 'default';
      case 'creative': return 'creative';
      case 'minimal': return 'dark';
      case 'academic': return 'business';
      case 'nature': return 'nature';
      case 'tech': return 'tech';
      default: return 'default';
    }
  };

  /**
   * Lấy màu chủ đề theo phong cách
   */
  const getThemeColor = (style, colorType) => {
    if (colorType === 'header') {
      switch (style) {
        case 'professional': return '#1a73e8';
        case 'creative': return '#ea4335';
        case 'minimal': return '#ffffff';
        case 'academic': return '#0f4c81';
        case 'nature': return '#54a32a';
        case 'tech': return '#64ffda';
        default: return '#1a73e8';
      }
    } else if (colorType === 'text') {
      switch (style) {
        case 'minimal': return '#ffffff';
        case 'tech': return '#e6f1ff';
        default: return '#333333';
      }
    } else if (colorType === 'background') {
      switch (style) {
        case 'minimal': return '#212121';
        case 'tech': return '#0a192f';
        case 'nature': return '#f9fff5';
        default: return '#ffffff';
      }
    }
    
    return '#333333';
  };

  /**
   * Xử lý khi người dùng click vào đề xuất
   */
  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion);
  };

  return (
    <div className="ai-presentation-dialog">
      <div className="ai-dialog-header">
        <h2>Tạo bài thuyết trình bằng AI</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="ai-dialog-content">
        {isGenerating ? (
          <div className="generating-status">
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{generationStatus}</p>
          </div>
        ) : (
          <div className="ai-form">
            <div className="form-group">
              <label htmlFor="ai-topic">Chủ đề bài thuyết trình</label>
              <input 
                type="text" 
                id="ai-topic" 
                placeholder="Nhập chủ đề bài thuyết trình" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              
              <div className="topic-suggestions">
                <p>Đề xuất:</p>
                <div className="suggestion-tags">
                  {suggestionTopics.map((suggestion, index) => (
                    <span 
                      key={index} 
                      className="suggestion-tag"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ai-style">Phong cách</label>
                <select 
                  id="ai-style" 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option value="professional">Chuyên nghiệp</option>
                  <option value="creative">Sáng tạo</option>
                  <option value="minimal">Tối giản</option>
                  <option value="academic">Học thuật</option>
                  <option value="nature">Thiên nhiên</option>
                  <option value="tech">Công nghệ</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="ai-slides">Số slides</label>
                <select 
                  id="ai-slides" 
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                >
                  <option value="3">3 slides</option>
                  <option value="5">5 slides</option>
                  <option value="7">7 slides</option>
                  <option value="10">10 slides</option>
                  <option value="15">15 slides</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <button 
                className="toggle-advanced-btn" 
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Hiển thị tùy chọn nâng cao'} ▼
              </button>
            </div>
            
            {showAdvanced && (
              <div className="advanced-options">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ai-purpose">Mục đích</label>
                    <select 
                      id="ai-purpose" 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      <option value="business">Doanh nghiệp</option>
                      <option value="education">Giáo dục</option>
                      <option value="marketing">Marketing</option>
                      <option value="academic">Học thuật</option>
                      <option value="personal">Cá nhân</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="ai-audience">Đối tượng</label>
                    <select 
                      id="ai-audience" 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <option value="general">Đại chúng</option>
                      <option value="executive">Lãnh đạo</option>
                      <option value="technical">Chuyên gia kỹ thuật</option>
                      <option value="student">Học sinh/Sinh viên</option>
                      <option value="client">Khách hàng</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ai-language">Ngôn ngữ</label>
                    <select 
                      id="ai-language" 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">Tiếng Anh</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="include-charts" 
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                    />
                    <label htmlFor="include-charts">Thêm biểu đồ tự động</label>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="include-images" 
                      checked={includeImages}
                      onChange={(e) => setIncludeImages(e.target.checked)}
                    />
                    <label htmlFor="include-images">Thêm hình ảnh tự động</label>
                  </div>
                </div>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button 
                className="cancel-button" 
                onClick={onClose}
              >
                Hủy
              </button>
              <button 
                className="generate-button" 
                onClick={handleGenerate}
                disabled={!topic.trim()}
              >
                Tạo bài thuyết trình
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPresentation;