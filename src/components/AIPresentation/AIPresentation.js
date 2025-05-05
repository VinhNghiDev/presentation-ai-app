import React, { useState } from 'react';
import { generatePresentation } from '../../services/aiService';
import { suggestImageKeywords } from '../../services/apiService';
import { getImageByKeyword } from '../../services/imageService';
import { createNewElement } from '../../utils/editorUtils';
import './AIPresentation.css';

/**
 * Component cho việc tạo và quản lý bài thuyết trình AI
 */
const AIPresentation = ({ onGenerate, onClose, isVisible = false }) => {
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

      if (!Array.isArray(presentationData.slides)) {
        console.error('Dữ liệu slides không phải dạng mảng:', presentationData.slides);
        throw new Error('Dữ liệu slides không hợp lệ');
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
  
  // Reset form khi đóng popup
  const handleClose = () => {
    if (!isGenerating) {
      setTopic('');
      setError('');
      setProgress(0);
      setShowAdvanced(false);
      onClose();
    }
  };

  /**
   * Tạo dữ liệu biểu đồ dựa trên nội dung slide
   */
  const generateChartData = async (slideContent, slideTitle) => {
    try {
      setGenerationStatus('Đang tạo dữ liệu biểu đồ...');
      
      // Phân tích nội dung của slide để tìm dữ liệu có thể dùng cho biểu đồ
      // Kiểm tra các từ khóa như "thống kê", "số liệu", "dữ liệu", v.v.
      const chartKeywords = ['thống kê', 'số liệu', 'dữ liệu', 'phần trăm', '%', 'tỷ lệ', 'so sánh', 'đánh giá'];
      const hasChartData = chartKeywords.some(keyword => 
        slideContent.toLowerCase().includes(keyword.toLowerCase()) || 
        slideTitle.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Nếu có từ khóa liên quan đến biểu đồ, tạo dữ liệu phù hợp
      if (hasChartData) {
        // Chiết xuất các con số từ nội dung nếu có
        const numberMatches = slideContent.match(/\d+(\.\d+)?%?/g);
        let chartData = [];
        
        if (numberMatches && numberMatches.length >= 3) {
          // Nếu có ít nhất 3 con số, sử dụng chúng làm dữ liệu
          chartData = numberMatches.slice(0, 5).map((num, index) => {
            return {
              name: `Mục ${index + 1}`,
              value: parseFloat(num.replace('%', ''))
            };
          });
        } else {
          // Nếu không có đủ số, sử dụng dữ liệu ngẫu nhiên
          const categories = slideContent.split(/[,\n\.]/).filter(item => item.trim().length > 0).slice(0, 5);
          chartData = categories.map((cat, index) => {
            return {
              name: cat.trim().length > 15 ? cat.trim().substring(0, 15) + '...' : cat.trim() || `Mục ${index + 1}`,
              value: Math.floor(Math.random() * 60) + 20
            };
          });
        }
        
        // Nếu không đủ 4 mục, thêm mục mặc định
        while (chartData.length < 4) {
          chartData.push({
            name: `Mục ${chartData.length + 1}`,
            value: Math.floor(Math.random() * 60) + 20
          });
        }
        
        // Xác định loại biểu đồ phù hợp
        let chartType = 'bar';
        if (slideContent.toLowerCase().includes('tỷ lệ') || slideContent.toLowerCase().includes('phần trăm')) {
          chartType = 'pie';
        } else if (slideContent.toLowerCase().includes('xu hướng') || slideContent.toLowerCase().includes('thời gian')) {
          chartType = 'line';
        }
        
        return {
          chartType: chartType,
          title: slideTitle,
          data: chartData
        };
      }
      
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
    try {
      const appSlides = [];
      
      if (!presentationData) {
        console.error('convertToAppSlides: Dữ liệu không hợp lệ - không có presentationData');
        return [];
      }
      
      // Đảm bảo slides là mảng
      if (!presentationData.slides) {
        console.error('convertToAppSlides: Không có thuộc tính slides trong dữ liệu');
        return [];
      }
      
      if (!Array.isArray(presentationData.slides)) {
        console.error('convertToAppSlides: slides không phải là mảng:', typeof presentationData.slides);
        return [];
      }
      
      const slides = presentationData.slides;
      
      if (slides.length === 0) {
        console.warn('Không có slides để chuyển đổi');
        return [];
      }
      
      for (let i = 0; i < slides.length; i++) {
        const apiSlide = slides[i] || {};
        setGenerationStatus(`Đang xử lý slide ${i + 1}/${slides.length}...`);
        setProgress(50 + Math.floor((i / slides.length) * 50));
        
        // Xác định kiểu slide (slideType) nếu không có
        const slideType = apiSlide.slideType || determineSlideType(apiSlide.title, i, slides.length);
        
        // Tạo đối tượng slide mới với giá trị mặc định cho các thuộc tính
        const newSlide = {
          id: Date.now() + i,
          title: apiSlide.title || `Slide ${i + 1}`,
          content: apiSlide.content || '',
          notes: apiSlide.notes || '',
          template: getTemplateForStyle(style, slideType),
          elements: [],
          slideType: slideType
        };
        
        // Thêm phần tử tiêu đề với định dạng dựa trên kiểu slide
        newSlide.elements.push({
          id: `title-${newSlide.id}`,
          type: 'text',
          content: newSlide.title,
          style: {
            fontWeight: 'bold',
            fontSize: slideType === 'cover' ? '32px' : '24px',
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
        
        // Thêm phần tử nội dung với định dạng dựa trên kiểu slide
        newSlide.elements.push({
          id: `content-${newSlide.id}`,
          type: 'text',
          content: formatContentBySlideType(newSlide.content, slideType),
          style: {
            fontSize: '18px',
            color: getThemeColor(style, 'text'),
            width: '80%',
            height: 'auto',
            top: slideType === 'cover' ? '35%' : '25%',
            left: '10%',
            padding: '10px',
            zIndex: 10
          }
        });
        
        // Thêm hình ảnh nếu có từ khóa, dựa trên kiểu slide
        if (includeImages && shouldAddImageForSlideType(slideType)) {
          try {
            // Sử dụng từ khóa đã có trong API response nếu có
            let imageKeywords = apiSlide.keywords;
            
            // Nếu không có từ khóa, thử lấy từ khóa từ dịch vụ gợi ý
            if (!imageKeywords || !Array.isArray(imageKeywords) || imageKeywords.length === 0) {
              try {
                const keywordsResult = await suggestImageKeywords(apiSlide.content);
                if (keywordsResult && keywordsResult.keywords) {
                  imageKeywords = keywordsResult.keywords;
                }
              } catch (keywordError) {
                console.log('Không thể lấy từ khóa hình ảnh:', keywordError);
                // Nếu không thể lấy từ khóa, sử dụng tiêu đề làm từ khóa
                imageKeywords = [apiSlide.title.split(' ')[0]];
              }
            }
            
            // Đảm bảo có ít nhất một từ khóa
            if (!imageKeywords || !Array.isArray(imageKeywords) || imageKeywords.length === 0) {
              imageKeywords = [topic];
            }
            
            // Điều chỉnh vị trí và kích thước hình ảnh theo kiểu slide
            const imagePosition = getImagePositionBySlideType(slideType);
            
            // Sử dụng hàm getImageByKeyword để lấy URL hình ảnh
            const imageUrl = getImageByKeyword(imageKeywords, { 
              width: imagePosition.width, 
              height: imagePosition.height 
            });
            
            // Tạo phần tử hình ảnh với từ khóa đầu tiên
            const imageElement = createNewElement({
              type: 'image',
              src: imageUrl,
              alt: Array.isArray(imageKeywords) ? imageKeywords[0] : imageKeywords,
              style: {
                width: `${imagePosition.width}px`,
                height: 'auto',
                top: `${imagePosition.top}%`,
                left: `${imagePosition.left}%`,
                zIndex: 5
              }
            });
            newSlide.elements.push(imageElement);
          } catch (error) {
            console.error('Lỗi khi thêm hình ảnh:', error);
          }
        }
        
        // Thêm biểu đồ nếu phù hợp với kiểu slide
        if (includeCharts && shouldAddChartForSlideType(slideType, apiSlide.content || '')) {
          try {
            const chartData = await generateChartData(apiSlide.content || '', apiSlide.title || '');
            const chartElement = createNewElement({
              type: 'chart',
              chartType: getChartTypeForSlideType(slideType, chartData.chartType),
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
        
        // Thêm citation/references cho slide nếu là slide tài liệu tham khảo
        if (slideType === 'references' || apiSlide.title.includes('Tài liệu tham khảo') || apiSlide.title.includes('References')) {
          const citationElement = createNewElement({
            type: 'text',
            content: 'Nguồn: Dữ liệu thị trường, báo cáo ngành và nghiên cứu',
            style: {
              fontSize: '12px',
              color: getThemeColor(style, 'text'),
              fontStyle: 'italic',
              width: '80%',
              height: 'auto',
              top: '85%',
              left: '10%',
              textAlign: 'center',
              padding: '5px',
              zIndex: 5
            }
          });
          newSlide.elements.push(citationElement);
        }
        
        appSlides.push(newSlide);
      }
      
      return appSlides;
    } catch (error) {
      console.error('Lỗi khi chuyển đổi slides:', error);
      return []; // Trả về mảng rỗng trong trường hợp có lỗi
    }
  };

  /**
   * Xác định kiểu slide dựa trên tiêu đề và vị trí
   * @param {string} title - Tiêu đề slide
   * @param {number} index - Vị trí slide
   * @param {number} totalSlides - Tổng số slide
   * @returns {string} - Kiểu slide
   */
  const determineSlideType = (title, index, totalSlides) => {
    const titleLower = title.toLowerCase();
    
    // Dựa vào tiêu đề
    if (index === 0) return 'cover';
    if (titleLower.includes('giới thiệu') || titleLower.includes('introduction')) return 'introduction';
    if (titleLower.includes('mục lục') || titleLower.includes('nội dung') || titleLower.includes('outline') || titleLower.includes('agenda')) return 'outline';
    if (titleLower.includes('thống kê') || titleLower.includes('statistics') || titleLower.includes('số liệu')) return 'statistics';
    if (titleLower.includes('case study') || titleLower.includes('trường hợp') || titleLower.includes('nghiên cứu')) return 'caseStudy';
    if (titleLower.includes('xu hướng') || titleLower.includes('trend') || titleLower.includes('tương lai')) return 'trends';
    if (titleLower.includes('thách thức') || titleLower.includes('challenge') || titleLower.includes('giải pháp') || titleLower.includes('solution')) return 'challenges';
    if (titleLower.includes('kết luận') || titleLower.includes('conclusion') || titleLower.includes('tóm tắt') || titleLower.includes('summary')) return 'conclusion';
    if (titleLower.includes('tài liệu') || titleLower.includes('references') || titleLower.includes('source')) return 'references';
    
    // Dựa vào vị trí
    if (index === totalSlides - 1) return 'conclusion';
    if (index === totalSlides - 2) return 'references';
    
    // Mặc định
    return 'content';
  };

  /**
   * Định dạng nội dung dựa trên kiểu slide
   * @param {string} content - Nội dung gốc
   * @param {string} slideType - Kiểu slide
   * @returns {string} - Nội dung đã định dạng
   */
  const formatContentBySlideType = (content, slideType) => {
    if (!content) return '';
    
    switch (slideType) {
      case 'statistics':
        // Tô đậm các con số và phần trăm
        return content.replace(/(\d+(\.\d+)?%?)/g, '**$1**');
        
      case 'caseStudy':
        // Tô đậm tên công ty và kết quả
        const lines = content.split('\n');
        return lines.map(line => {
          if (line.startsWith('-') || line.startsWith('•')) {
            return line;
          } else if (line.includes(':')) {
            const parts = line.split(':');
            return `**${parts[0]}:** ${parts.slice(1).join(':')}`;
          }
          return line;
        }).join('\n');
        
      case 'conclusion':
        // Tô đậm các điểm chính
        return content;
        
      case 'references':
        // Định dạng tài liệu tham khảo
        return content;
        
      default:
        return content;
    }
  };

  /**
   * Xác định có nên thêm hình ảnh cho kiểu slide không
   * @param {string} slideType - Kiểu slide
   * @returns {boolean} - Có nên thêm hình ảnh không
   */
  const shouldAddImageForSlideType = (slideType) => {
    switch (slideType) {
      case 'cover': // Trang bìa luôn có hình
      case 'caseStudy': // Case study nên có hình minh họa
      case 'trends': // Xu hướng nên có hình minh họa
        return true;
      case 'statistics': // Thống kê thường dùng biểu đồ thay vì hình
      case 'outline': // Mục lục thường không cần hình
      case 'references': // Tài liệu tham khảo không cần hình
        return false;
      default:
        return Math.random() > 0.3; // 70% slide khác có hình
    }
  };

  /**
   * Xác định vị trí và kích thước hình ảnh dựa trên kiểu slide
   * @param {string} slideType - Kiểu slide
   * @returns {Object} - Vị trí và kích thước hình ảnh
   */
  const getImagePositionBySlideType = (slideType) => {
    switch (slideType) {
      case 'cover':
        return { top: 45, left: 30, width: 400, height: 300 };
      case 'caseStudy':
        return { top: 55, left: 55, width: 350, height: 250 };
      case 'trends':
        return { top: 55, left: 55, width: 350, height: 250 };
      default:
        return { top: 55, left: 55, width: 300, height: 200 };
    }
  };

  /**
   * Xác định có nên thêm biểu đồ cho kiểu slide không
   * @param {string} slideType - Kiểu slide
   * @param {string} content - Nội dung slide
   * @returns {boolean} - Có nên thêm biểu đồ không
   */
  const shouldAddChartForSlideType = (slideType, content) => {
    // Ưu tiên slide thống kê luôn có biểu đồ
    if (slideType === 'statistics') return true;
    
    // Một số kiểu slide khác có thể có biểu đồ nếu nội dung phù hợp
    if ((slideType === 'analysis' || slideType === 'trends') && 
        shouldAddChart(content, 0)) {
      return true;
    }
    
    // Các kiểu slide không nên có biểu đồ
    if (slideType === 'cover' || slideType === 'outline' || 
        slideType === 'conclusion' || slideType === 'references') {
      return false;
    }
    
    // Kiểm tra nội dung slide có phù hợp cho biểu đồ không
    return shouldAddChart(content, 0);
  };

  /**
   * Xác định loại biểu đồ phù hợp với kiểu slide
   * @param {string} slideType - Kiểu slide
   * @param {string} defaultChartType - Loại biểu đồ mặc định
   * @returns {string} - Loại biểu đồ
   */
  const getChartTypeForSlideType = (slideType, defaultChartType) => {
    switch (slideType) {
      case 'statistics':
        return 'bar'; // Thống kê thường dùng biểu đồ cột
      case 'trends':
        return 'line'; // Xu hướng thường dùng biểu đồ đường
      case 'analysis':
        // Phân tích có thể dùng biểu đồ tròn để hiển thị tỷ lệ
        return Math.random() > 0.5 ? 'pie' : 'bar';
      default:
        return defaultChartType;
    }
  };

  /**
   * Kiểm tra xem có nên thêm biểu đồ vào slide không
   */
  const shouldAddChart = (content, slideIndex) => {
    // Bỏ qua slide đầu tiên (trang bìa) và slide cuối cùng (lời cảm ơn)
    if (slideIndex === 0 || slideIndex === slideCount - 1) return false;
    
    // Kiểm tra nội dung slide có phù hợp cho biểu đồ không
    const chartKeywords = ['thống kê', 'số liệu', 'dữ liệu', 'phần trăm', '%', 'tỷ lệ', 'so sánh'];
    return chartKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
  };

  /**
   * Xác định template dựa trên style
   */
  const getTemplateForStyle = (style) => {
    switch (style) {
      case 'professional':
        return 'corporate';
      case 'creative':
        return 'creative';
      case 'minimal':
        return 'minimal';
      case 'academic':
        return 'academic';
      case 'nature':
        return 'nature';
      case 'tech':
        return 'tech';
      default:
        return 'default';
    }
  };

  /**
   * Lấy màu chủ đề dựa trên style
   */
  const getThemeColor = (style, colorType) => {
    const themeColors = {
      professional: {
        header: '#1a3b5c',
        text: '#333333',
        background: '#ffffff',
        accent: '#2c88d9'
      },
      creative: {
        header: '#e63946',
        text: '#293241',
        background: '#f1faee',
        accent: '#a8dadc'
      },
      minimal: {
        header: '#2b2d42',
        text: '#2b2d42',
        background: '#edf2f4',
        accent: '#d90429'
      },
      academic: {
        header: '#003049',
        text: '#333333',
        background: '#eae2b7',
        accent: '#fcbf49'
      },
      nature: {
        header: '#354f52',
        text: '#2f3e46',
        background: '#cad2c5',
        accent: '#84a98c'
      },
      tech: {
        header: '#3a506b',
        text: '#1c2541',
        background: '#ffffff',
        accent: '#5bc0be'
      }
    };
    
    const defaultColor = colorType === 'header' ? '#333333' : 
                        colorType === 'text' ? '#555555' : 
                        colorType === 'background' ? '#ffffff' : '#0078d4';
                        
    return themeColors[style]?.[colorType] || defaultColor;
  };

  /**
   * Xử lý khi người dùng chọn chủ đề gợi ý
   */
  const handleSuggestionClick = (suggestion) => {
    setTopic(suggestion);
  };

  // Nếu isVisible là false, không render gì cả
  if (!isVisible) {
    return null;
  }

  return (
    <div className="ai-presentation-overlay" onClick={handleClose}>
      <div className="ai-presentation-card" onClick={(e) => e.stopPropagation()}>
        <div className="ai-presentation-header">
          <h2>Tạo bài thuyết trình với AI</h2>
          <button className="close-button" onClick={handleClose} disabled={isGenerating}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="ai-presentation-content">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="topic">Chủ đề bài thuyết trình:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề chi tiết để có kết quả tốt nhất..."
              disabled={isGenerating}
            />
          </div>
          
          <div className="suggestion-topics">
            <div className="suggestion-label">Đề xuất:</div>
            <div className="suggestion-chips">
              {suggestionTopics.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-chip" 
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="style">Phong cách:</label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isGenerating}
            >
              <option value="professional">Chuyên nghiệp</option>
              <option value="creative">Sáng tạo</option>
              <option value="minimal">Tối giản</option>
              <option value="academic">Học thuật</option>
              <option value="tech">Công nghệ</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="slideCount">Số lượng slide:</label>
            <div className="slide-count-container">
              <input
                type="range"
                id="slideCount"
                min="3"
                max="15"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                disabled={isGenerating}
              />
              <span className="slide-count-value">{slideCount}</span>
            </div>
          </div>
          
          <div className="toggle-advanced" onClick={() => !isGenerating && setShowAdvanced(!showAdvanced)}>
            <span>Tùy chọn nâng cao</span>
            <i className={`bi bi-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
          </div>
          
          {showAdvanced && (
            <div className="advanced-options">
              <div className="form-group">
                <label htmlFor="language">Ngôn ngữ:</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">Tiếng Anh</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="purpose">Mục đích:</label>
                <select
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="business">Doanh nghiệp</option>
                  <option value="education">Giáo dục</option>
                  <option value="marketing">Marketing</option>
                  <option value="academic">Học thuật</option>
                  <option value="personal">Cá nhân</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="audience">Đối tượng:</label>
                <select
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="general">Đại chúng</option>
                  <option value="executive">Lãnh đạo</option>
                  <option value="technical">Kỹ thuật</option>
                  <option value="student">Học sinh/Sinh viên</option>
                  <option value="client">Khách hàng</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    disabled={isGenerating}
                  />
                  <span className="checkmark"></span>
                  Thêm biểu đồ
                </label>
              </div>
              
              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    disabled={isGenerating}
                  />
                  <span className="checkmark"></span>
                  Thêm hình ảnh
                </label>
              </div>
            </div>
          )}
          
          {isGenerating && (
            <div className="generation-status">
              <div className="progress-container">
                <div className="progress-bar">
                  <div style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <div className="status-text">{generationStatus}</div>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-cancel" 
            onClick={handleClose} 
            disabled={isGenerating}
          >
            Hủy
          </button>
          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
          >
            {isGenerating ? 'Đang tạo...' : 'Tạo bài thuyết trình'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPresentation;