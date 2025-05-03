import React, { useState, useEffect } from 'react';
import { generatePresentation, enhanceSlideContent, suggestImageKeywords } from '../../services/openaiService';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

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

    if (!apiKey.trim()) {
      setError('Vui lòng nhập OpenAI API Key');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setProgress(10);
      setGenerationStatus('Đang khởi tạo...');

      // Lưu API key vào localStorage để dùng lại sau
      localStorage.setItem('openai_api_key', apiKey);

      // Tạo options cho API
      const options = {
        topic,
        style,
        slides: slideCount,
        language
      };

      setGenerationStatus('Đang tạo nội dung...');
      setProgress(30);

      // Gọi API để tạo nội dung
      const presentationData = await generatePresentation(options, apiKey);
      setProgress(60);

      if (!presentationData || !presentationData.slides) {
        throw new Error('Không nhận được dữ liệu bài thuyết trình hợp lệ');
      }

      setGenerationStatus('Đang tối ưu hóa và xử lý hình ảnh...');
      setProgress(80);

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
   * Chuyển đổi dữ liệu từ API thành định dạng slide cho ứng dụng
   */
  const convertToAppSlides = async (presentationData, apiKey) => {
    const { slides } = presentationData;
    const convertedSlides = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideIndex = i + 1;
      const progress = 80 + (i / slides.length) * 20;
      setProgress(progress);
      setGenerationStatus(`Đang xử lý slide ${slideIndex}/${slides.length}...`);

      // Tạo các phần tử cho slide
      const elements = [];

      // Thêm phần tử tiêu đề
      elements.push(createNewElement('text', {
        content: slide.title,
        position: { x: 50, y: 50 },
        size: { width: 700, height: 80 },
        style: {
          fontSize: '32px',
          fontWeight: 'bold'
        }
      }));

      // Thêm phần tử nội dung
      elements.push(createNewElement('text', {
        content: slide.content,
        position: { x: 50, y: 150 },
        size: { width: 700, height: 300 },
        style: {
          fontSize: '18px'
        }
      }));

      // Tìm từ khóa hình ảnh liên quan
      try {
        const imageKeywords = await suggestImageKeywords(slide.content, apiKey);
        
        if (imageKeywords && imageKeywords.length > 0) {
          // Chọn một từ khóa ngẫu nhiên từ danh sách
          const keyword = imageKeywords[Math.floor(Math.random() * imageKeywords.length)];
          
          // Tạo URL hình ảnh mẫu (trong thực tế, bạn sẽ tích hợp với API hình ảnh)
          const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}`;
          
          // Thêm phần tử hình ảnh
          elements.push(createNewElement('image', {
            content: imageUrl,
            position: { x: 500, y: 200 },
            size: { width: 300, height: 250 }
          }));
        }
      } catch (error) {
        console.error('Error suggesting image keywords:', error);
        // Tiếp tục xử lý ngay cả khi không thể gợi ý hình ảnh
      }

      convertedSlides.push({
        id: Date.now() + i,
        title: slide.title,
        content: slide.content,
        template: style === 'professional' ? 'default' : 
                 style === 'creative' ? 'creative' : 
                 style === 'minimal' ? 'dark' : 
                 style === 'academic' ? 'business' : 
                 'default',
        elements,
        notes: slide.notes || ''
      });
    }

    return convertedSlides;
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
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
                disabled={isGenerating}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Phong cách</label>
              <select 
                className="form-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={isGenerating}
              >
                <option value="professional">Chuyên nghiệp</option>
                <option value="creative">Sáng tạo</option>
                <option value="minimal">Tối giản</option>
                <option value="academic">Học thuật</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Số lượng slides</label>
              <input
                type="range"
                className="form-range"
                min="3"
                max="15"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                disabled={isGenerating}
              />
              <div className="text-center">{slideCount} slides</div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">OpenAI API Key</label>
              <input
                type="password"
                className="form-control"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                disabled={isGenerating}
              />
              <div className="form-text">
                API key của bạn sẽ được lưu cục bộ trên trình duyệt và không được gửi đến bất kỳ máy chủ nào khác ngoài OpenAI.
              </div>
            </div>
            
            <div className="mb-3">
              <button 
                className="btn btn-link p-0" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={isGenerating}
              >
                {showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Hiển thị tùy chọn nâng cao'}
              </button>
            </div>
            
            {showAdvanced && (
              <div className="card mb-3">
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Ngôn ngữ</label>
                    <select 
                      className="form-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={isGenerating}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">Tiếng Anh</option>
                      <option value="fr">Tiếng Pháp</option>
                      <option value="de">Tiếng Đức</option>
                      <option value="ja">Tiếng Nhật</option>
                      <option value="zh">Tiếng Trung</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {isGenerating && (
              <div className="card mb-3 border-primary">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Đang tạo...</span>
                    </div>
                    <h6 className="mb-0">{generationStatus}</h6>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      style={{ width: `${progress}%` }}
                      aria-valuenow={progress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
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
              {isGenerating ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPresentation;