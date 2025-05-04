import React, { useState, useEffect } from 'react';
import { generatePresentation, enhanceSlideContent, suggestImageKeywords, translateContent } from '../../services/openaiService';
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
  const [apiKey, setApiKey] = useState('');
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

  // Lấy API key từ localStorage nếu có
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  /**
   * Xử lý khi người dùng nhấn nút tạo
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề bài thuyết trình');
      return;
    }

    if (!apiKey.trim() || !apiKey.startsWith('sk-')) {
      setError('Vui lòng nhập OpenAI API Key hợp lệ (bắt đầu bằng sk-)');
      return;
    }

    try {
      // Lưu API key vào localStorage để dùng lại sau
      localStorage.setItem('openai_api_key', apiKey);

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
      const presentationData = await generatePresentation(options, apiKey);
      setProgress(50);

      if (!presentationData || !presentationData.slides) {
        throw new Error('Không nhận được dữ liệu bài thuyết trình hợp lệ');
      }

      setGenerationStatus('Đang tối ưu hóa và xử lý hình ảnh...');
      setProgress(60);

      // Chuyển đổi dữ liệu từ API thành định dạng slide cho ứng dụng
      const convertedSlides = await convertToAppSlides(presentationData, apiKey);
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
  const generateChartData = async (slideContent, slideTitle, apiKey) => {
    try {
      setGenerationStatus('Đang tạo dữ liệu biểu đồ...');
      
      // Tạo prompt cho biểu đồ
      const prompt = `
        Dựa trên nội dung slide sau: "${slideTitle}: ${slideContent}"
        Hãy tạo dữ liệu biểu đồ phù hợp. Phân tích nội dung và tạo số liệu thống kê minh họa hợp lý.
        Trả về kết quả dưới dạng JSON với các trường sau:
        {
          "chartType": "bar|line|pie", // Loại biểu đồ phù hợp nhất
          "title": "Tiêu đề biểu đồ",
          "data": [
            {"name": "Nhãn 1", "value": 30},
            {"name": "Nhãn 2", "value": 50},
            ...
          ]
        }
      `;
      
      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia phân tích dữ liệu và tạo biểu đồ minh họa.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      };

      // Gọi OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error('Không thể tạo dữ liệu biểu đồ');
      }
      
      const responseData = await response.json();
      const content = responseData.choices[0].message.content;
      
      // Phân tích JSON từ kết quả
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const chartData = JSON.parse(jsonMatch[0]);
          return chartData;
        }
      } catch (e) {
        console.error('Lỗi phân tích JSON biểu đồ:', e);
      }
      
      // Dữ liệu mặc định nếu không thể tạo
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
  const convertToAppSlides = async (presentationData, apiKey) => {
    const { slides } = presentationData;
    const convertedSlides = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideIndex = i + 1;
      const progress = 60 + (i / slides.length) * 40;
      setProgress(Math.min(95, progress));
      setGenerationStatus(`Đang xử lý slide ${slideIndex}/${slides.length}...`);

      // Tạo các phần tử cho slide
      const elements = [];
      const isFirstSlide = i === 0;
      const isLastSlide = i === slides.length - 1;

      // Thêm phần tử tiêu đề với vị trí và kích thước phù hợp
      elements.push(createNewElement('text', {
        content: slide.title,
        position: { x: 50, y: 30 },
        size: { width: 700, height: 60 },
        style: {
          fontSize: isFirstSlide ? '36px' : '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: getThemeColor(style, 'headerColor')
        }
      }));

      // Xử lý trường hợp đặc biệt cho slide đầu và slide cuối
      if (isFirstSlide) {
        // Slide đầu - Trang bìa
        elements.push(createNewElement('text', {
          content: presentationData.title || topic,
          position: { x: 50, y: 120 },
          size: { width: 700, height: 80 },
          style: {
            fontSize: '42px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: getThemeColor(style, 'accentColor')
          }
        }));
        
        elements.push(createNewElement('text', {
          content: slide.content,
          position: { x: 100, y: 220 },
          size: { width: 600, height: 150 },
          style: {
            fontSize: '22px',
            textAlign: 'center'
          }
        }));
        
      } else if (isLastSlide) {
        // Slide cuối - Trang kết luận
        elements.push(createNewElement('text', {
          content: slide.content,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 300 },
          style: {
            fontSize: '20px',
            lineHeight: '1.5'
          }
        }));
        
        // Thêm phần tử "Cảm ơn" nếu là slide cuối
        elements.push(createNewElement('text', {
          content: 'Cảm ơn!',
          position: { x: 250, y: 420 },
          size: { width: 300, height: 60 },
          style: {
            fontSize: '36px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: getThemeColor(style, 'accentColor')
          }
        }));
        
      } else {
        // Các slide nội dung
        const contentElement = createNewElement('text', {
          content: slide.content,
          position: { x: 50, y: 100 },
          size: { width: 400, height: 300 },
          style: {
            fontSize: '18px',
            lineHeight: '1.5'
          }
        });
        elements.push(contentElement);
        
        // Thêm biểu đồ nếu người dùng yêu cầu và nội dung slide phù hợp
        if (includeCharts && shouldAddChart(slide.content, slideIndex)) {
          try {
            const chartData = await generateChartData(slide.content, slide.title, apiKey);
            const chartElement = createNewElement('chart', {
              chartType: chartData.chartType || 'bar',
              title: chartData.title || slide.title,
              data: Array.isArray(chartData.data) ? chartData.data : [
                {name: 'Mục 1', value: 30},
                {name: 'Mục 2', value: 50},
                {name: 'Mục 3', value: 20}
              ],
              position: { x: 470, y: 120 },
              size: { width: 320, height: 240 },
              showLegend: true,
              showGrid: true,
              colors: [
                '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E24AA',
                '#16A085', '#F39C12', '#D35400', '#2C3E50', '#7F8C8D'
              ]
            });
            elements.push(chartElement);
            
            // Điều chỉnh lại vị trí nội dung để không chồng lên biểu đồ
            contentElement.position = { x: 50, y: 100 };
            contentElement.size = { width: 400, height: 300 };
          } catch (error) {
            console.error('Lỗi khi tạo biểu đồ:', error);
          }
        }
      }

      // Thêm hình ảnh nếu được yêu cầu
      if (includeImages && !isFirstSlide) {
        try {
          const imageKeywords = await suggestImageKeywords(slide.content + ' ' + slide.title, apiKey);
          
          if (imageKeywords && Array.isArray(imageKeywords) && imageKeywords.length > 0) {
            // Chọn một từ khóa ngẫu nhiên từ danh sách
            const keyword = imageKeywords[Math.floor(Math.random() * imageKeywords.length)];
            const safeKeyword = typeof keyword === 'string' ? keyword : 'presentation';
            
            // Tạo URL hình ảnh từ Unsplash
            const imageUrl = `https://source.unsplash.com/500x300/?${encodeURIComponent(safeKeyword)}`;
            
            // Thêm phần tử hình ảnh với vị trí phù hợp
            const imageElement = createNewElement('image', {
              url: imageUrl,
              alt: safeKeyword,
              position: includeCharts && !isLastSlide ? { x: 180, y: 320 } : { x: 470, y: 120 },
              size: { width: 300, height: 200 }
            });
            
            elements.push(imageElement);
          }
        } catch (error) {
          console.error('Error suggesting image keywords:', error);
        }
      }

      convertedSlides.push({
        id: Date.now() + i,
        title: slide.title,
        content: slide.content,
        template: getTemplateForStyle(style),
        elements,
        notes: slide.notes || ''
      });
    }

    return convertedSlides;
  };

  /**
   * Kiểm tra xem có nên thêm biểu đồ cho slide hay không
   */
  const shouldAddChart = (content, slideIndex) => {
    // Không thêm biểu đồ cho slide đầu tiên hoặc cuối cùng
    if (slideIndex === 1 || slideIndex === slideCount) {
      return false;
    }
    
    // Kiểm tra nội dung có chứa các từ khóa liên quan đến dữ liệu
    const dataKeywords = ['số liệu', 'thống kê', 'phần trăm', '%', 'tăng', 'giảm', 'so sánh'];
    return dataKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
  };

  /**
   * Lấy template tương ứng với style
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
   * Lấy màu từ theme dựa trên style
   */
  const getThemeColor = (style, colorType) => {
    const themeColors = {
      'professional': {
        headerColor: '#1a73e8',
        accentColor: '#e8f0fe',
        textColor: '#333333'
      },
      'creative': {
        headerColor: '#ea4335',
        accentColor: '#fce8e6',
        textColor: '#333333'
      },
      'minimal': {
        headerColor: '#4285f4',
        accentColor: '#303134',
        textColor: '#ffffff'
      },
      'academic': {
        headerColor: '#0f4c81',
        accentColor: '#e6f3ff',
        textColor: '#1d1d1d'
      },
      'nature': {
        headerColor: '#54a32a',
        accentColor: '#e9f4e5',
        textColor: '#2e5b1e'
      },
      'tech': {
        headerColor: '#64ffda',
        accentColor: '#172a45',
        textColor: '#e6f1ff'
      }
    };
    
    return themeColors[style]?.[colorType] || themeColors['professional'][colorType];
  };

  /**
   * Xử lý chọn đề xuất
   */
  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className={`modal-dialog ${showAdvanced ? 'modal-lg' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tạo bài thuyết trình với AI</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isGenerating}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Hướng dẫn sử dụng */}
            <div className="alert alert-info mb-3">
              <h6 className="alert-heading"><i className="bi bi-info-circle me-2"></i>Hướng dẫn sử dụng</h6>
              <p><strong>Cách sử dụng:</strong></p>
              <ol className="mb-0">
                <li>Nhập chủ đề bài thuyết trình (hoặc chọn từ gợi ý)</li>
                <li>Chọn phong cách và số lượng slide mong muốn</li>
                <li>Nhập OpenAI API Key của bạn (bắt đầu bằng sk-...)</li>
                <li>Tùy chỉnh các cài đặt nâng cao (không bắt buộc)</li>
                <li>Nhấn nút "Tạo bài thuyết trình"</li>
              </ol>
              <hr />
              <p className="mb-0"><i className="bi bi-key me-2"></i>Để sử dụng tính năng này, bạn cần có <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Key</a>. API Key của bạn chỉ được lưu trong trình duyệt và không được gửi tới máy chủ.</p>
            </div>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="aiTopic" className="form-label">Chủ đề bài thuyết trình</label>
              <input
                type="text"
                className="form-control"
                id="aiTopic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Chiến lược marketing 2025"
              />
              
              {/* Đề xuất chủ đề */}
              <div className="mt-2">
                <small className="text-muted">Đề xuất:</small>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {suggestionTopics.map((suggestion, index) => (
                    <span 
                      key={index} 
                      className="badge bg-light text-dark border p-2" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Phong cách</label>
                <select 
                  className="form-select"
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
              
              <div className="col-md-6">
                <label className="form-label">Số lượng slides</label>
                <div className="d-flex align-items-center">
                  <input
                    type="range"
                    className="form-range me-2"
                    min="3"
                    max="15"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  />
                  <span className="badge bg-primary">{slideCount}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label">API Key của OpenAI</label>
                <button 
                  className="btn btn-link btn-sm p-0"
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Tùy chọn nâng cao'}
                </button>
              </div>
              <input
                type="password"
                className="form-control"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <small className="text-muted">API key của bạn được lưu trên trình duyệt, không được gửi lên máy chủ.</small>
            </div>
            
            {showAdvanced && (
              <div className="card mb-3">
                <div className="card-header">Tùy chọn nâng cao</div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Ngôn ngữ</label>
                      <select 
                        className="form-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">Tiếng Anh</option>
                        <option value="fr">Tiếng Pháp</option>
                        <option value="ja">Tiếng Nhật</option>
                        <option value="ko">Tiếng Hàn</option>
                        <option value="zh">Tiếng Trung</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Mục đích sử dụng</label>
                      <select 
                        className="form-select"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      >
                        <option value="business">Kinh doanh / Doanh nghiệp</option>
                        <option value="education">Giáo dục / Đào tạo</option>
                        <option value="marketing">Marketing / Truyền thông</option>
                        <option value="academic">Học thuật / Nghiên cứu</option>
                        <option value="personal">Cá nhân / Sở thích</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Đối tượng người xem</label>
                      <select 
                        className="form-select"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                      >
                        <option value="general">Đại chúng</option>
                        <option value="executive">Lãnh đạo / Quản lý cấp cao</option>
                        <option value="technical">Chuyên gia kỹ thuật</option>
                        <option value="student">Học sinh / Sinh viên</option>
                        <option value="client">Khách hàng / Đối tác</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Thành phần tự động</label>
                      <div className="mt-2">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="includeCharts"
                            checked={includeCharts}
                            onChange={(e) => setIncludeCharts(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="includeCharts">
                            Biểu đồ
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="includeImages"
                            checked={includeImages}
                            onChange={(e) => setIncludeImages(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="includeImages">
                            Hình ảnh
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isGenerating && (
              <div className="mb-3">
                <label className="form-label">{generationStatus}</label>
                <div className="progress">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isGenerating}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tạo...
                </>
              ) : (
                'Tạo bài thuyết trình'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPresentation;