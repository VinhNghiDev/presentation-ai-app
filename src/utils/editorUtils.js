/**
 * Chức năng hỗ trợ cho EditorPage
 */

// Vị trí mặc định cho các phần tử mới
export const DEFAULT_POSITIONS = {
    text: { x: 50, y: 100, width: 500, height: 100 },
    image: { x: 50, y: 200, width: 400, height: 300 },
    chart: { x: 50, y: 150, width: 500, height: 300 },
    shape: { x: 300, y: 200, width: 200, height: 200 }
  };
  
  /**
   * Tạo một element ID mới
   * @param {string} type - Loại phần tử
   * @returns {string} - Element ID
   */
  export const generateElementId = (type) => {
    return `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };
  
  /**
   * Tạo một phần tử mới
   * @param {string} type - Loại phần tử (text, image, chart, shape)
   * @param {object} options - Tùy chọn bổ sung
   * @returns {object} - Phần tử mới
   */
  export const createNewElement = (type, options = {}) => {
    const defaultContent = getDefaultContent(type);
    const defaultPosition = DEFAULT_POSITIONS[type] || DEFAULT_POSITIONS.text;
    
    const element = {
      id: generateElementId(type),
      type,
      content: options.content || defaultContent,
      position: options.position || { 
        x: defaultPosition.x, 
        y: defaultPosition.y 
      },
      size: options.size || { 
        width: defaultPosition.width, 
        height: defaultPosition.height 
      },
      style: options.style || {},
      zIndex: options.zIndex || 1
    };
    
    // Xử lý các loại phần tử đặc biệt
    if (type === 'chart' && options.chartType) {
      element.chartType = options.chartType;
      element.data = options.data || getChartData(options.chartType).datasets[0].data;
      element.labels = options.labels || getChartData(options.chartType).labels;
      element.colors = options.colors || ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
      element.title = options.title || 'Biểu đồ';
      element.showLegend = options.showLegend !== undefined ? options.showLegend : true;
      element.showGrid = options.showGrid !== undefined ? options.showGrid : true;
    } else if (type === 'image') {
      element.url = options.url || options.content || defaultContent;
      element.alt = options.alt || 'Hình ảnh';
    }
    
    return element;
  };
  
  /**
   * Lấy nội dung mặc định dựa trên loại phần tử
   * @param {string} type - Loại phần tử
   * @returns {string} - Nội dung mặc định
   */
  export const getDefaultContent = (type) => {
    switch (type) {
      case 'text':
        return 'Nhấp để chỉnh sửa văn bản';
      case 'image':
        return 'https://placehold.co/400x300?text=Hình+ảnh';
      case 'chart':
        return 'bar-chart';
      case 'shape':
        return 'rectangle';
      default:
        return '';
    }
  };
  
  /**
   * Cập nhật vị trí phần tử
   * @param {object} element - Phần tử cần cập nhật
   * @param {number} x - Tọa độ x mới
   * @param {number} y - Tọa độ y mới
   * @returns {object} - Phần tử đã cập nhật
   */
  export const updateElementPosition = (element, x, y) => {
    return {
      ...element,
      position: {
        x: Math.max(0, x),
        y: Math.max(0, y)
      }
    };
  };
  
  /**
   * Cập nhật kích thước phần tử
   * @param {object} element - Phần tử cần cập nhật
   * @param {number} width - Chiều rộng mới
   * @param {number} height - Chiều cao mới
   * @returns {object} - Phần tử đã cập nhật
   */
  export const updateElementSize = (element, width, height) => {
    return {
      ...element,
      size: {
        width: Math.max(50, width), // Giới hạn kích thước tối thiểu
        height: Math.max(50, height)
      }
    };
  };
  
  /**
   * Cập nhật nội dung phần tử
   * @param {object} element - Phần tử cần cập nhật
   * @param {string} content - Nội dung mới
   * @returns {object} - Phần tử đã cập nhật
   */
  export const updateElementContent = (element, content) => {
    return {
      ...element,
      content
    };
  };
  
  /**
   * Cập nhật style của phần tử
   * @param {object} element - Phần tử cần cập nhật
   * @param {object} newStyle - Style mới
   * @returns {object} - Phần tử đã cập nhật
   */
  export const updateElementStyle = (element, newStyle) => {
    return {
      ...element,
      style: {
        ...element.style,
        ...newStyle
      }
    };
  };
  
  /**
   * Tạo dữ liệu mẫu cho các loại biểu đồ khác nhau
   * @param {string} chartType - Loại biểu đồ
   * @returns {object} - Dữ liệu biểu đồ
   */
  export const getChartData = (chartType) => {
    switch (chartType) {
      case 'bar-chart':
      case 'bar':
        return {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [
            {
              label: 'Dữ liệu mẫu',
              data: [12, 19, 3, 5],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }
          ]
        };
      case 'line-chart':
      case 'line':
        return {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
          datasets: [
            {
              label: 'Dữ liệu mẫu',
              data: [12, 19, 3, 5, 2, 3],
              borderColor: '#36A2EB',
              tension: 0.1
            }
          ]
        };
      case 'pie-chart':
      case 'pie':
        return {
          labels: ['Red', 'Blue', 'Yellow'],
          datasets: [
            {
              data: [300, 50, 100],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
          ]
        };
      default:
        return {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [
            {
              label: 'Dữ liệu mẫu',
              data: [12, 19, 3, 5],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }
          ]
        };
    }
  };
  
  /**
   * Tạo dữ liệu biểu đồ từ văn bản
   * @param {string} text - Văn bản dữ liệu
   * @param {string} chartType - Loại biểu đồ
   * @returns {object} - Dữ liệu biểu đồ đã xử lý
   */
  export const createChartDataFromText = (text, chartType = 'bar-chart') => {
    // Tách dữ liệu từ văn bản (định dạng giản lược: label, value mỗi dòng)
    const lines = text.trim().split('\n');
    const labels = [];
    const data = [];
    
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        labels.push(parts[0].trim());
        const value = parseFloat(parts[1].trim());
        if (!isNaN(value)) {
          data.push(value);
        } else {
          data.push(0);
        }
      }
    });
    
    // Sử dụng dữ liệu mặc định nếu không phân tích được
    if (labels.length === 0 || data.length === 0) {
      return getChartData(chartType);
    }
    
    // Tạo dữ liệu biểu đồ phù hợp
    const chartData = getChartData(chartType);
    chartData.labels = labels;
    chartData.datasets[0].data = data;
    
    return chartData;
  };
  
  /**
   * Chuyển đổi dữ liệu biểu đồ từ AI sang định dạng biểu đồ
   * @param {object} aiData - Dữ liệu biểu đồ từ API AI
   * @returns {object} - Dữ liệu biểu đồ định dạng chuẩn
   */
  export const convertAIChartData = (aiData) => {
    if (!aiData) return null;

    const chartType = aiData.chartType || 'bar';
    const title = aiData.title || 'Biểu đồ';
    
    // Dữ liệu mẫu từ AI có thể có định dạng khác nhau, cần chuẩn hóa
    const data = [];
    const labels = [];
    const colors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E24AA',
      '#16A085', '#F39C12', '#D35400', '#2C3E50', '#7F8C8D'
    ];
    
    if (Array.isArray(aiData.data)) {
      aiData.data.forEach(item => {
        if (item.name && item.value !== undefined) {
          labels.push(item.name);
          data.push(item.value);
        } else if (item.label && item.value !== undefined) {
          labels.push(item.label);
          data.push(item.value);
        }
      });
    }
    
    if (labels.length === 0 || data.length === 0) {
      return getChartData(chartType);
    }
    
    return {
      chartType,
      title,
      labels,
      data,
      colors: aiData.colors || colors.slice(0, labels.length)
    };
  };
  
  /**
   * Chuyển đổi dữ liệu mô hình từ dữ liệu thô
   * @param {object} rawData - Dữ liệu thô
   * @returns {object} - Dữ liệu đã xử lý
   */
  export const convertAIModelData = (rawData) => {
    if (!rawData || !rawData.slides) {
      return null;
    }

    // Tạo dữ liệu chuẩn từ dữ liệu thô
    return {
      title: rawData.title || 'Bài thuyết trình mới',
      slides: rawData.slides.map(slide => ({
        id: slide.id || Date.now() + Math.floor(Math.random() * 1000),
        title: slide.title || '',
        content: slide.content || '',
        notes: slide.notes || '',
        template: slide.template || 'default',
        elements: slide.elements || []
      }))
    };
  };
  
  /**
   * Phân tích nội dung văn bản để xác định loại dữ liệu (ví dụ: có phải danh sách, số liệu, v.v.)
   * @param {string} text - Văn bản cần phân tích
   * @returns {object} - Kết quả phân tích
   */
  export const analyzeTextContent = (text) => {
    if (!text) return { type: 'empty' };
    
    const lines = text.split('\n').filter(line => line.trim());
    const result = {
      type: 'text',
      hasList: false,
      hasNumbers: false,
      wordCount: 0,
      isBulletPoints: false
    };
    
    // Đếm số từ
    result.wordCount = text.split(/\s+/).filter(word => word.trim()).length;
    
    // Kiểm tra danh sách
    const bulletPointRegex = /^\s*[\-\*\•]\s+/;
    const numberedListRegex = /^\s*\d+[\.\)]\s+/;
    
    let bulletPoints = 0;
    let numberedItems = 0;
    
    lines.forEach(line => {
      if (bulletPointRegex.test(line)) {
        bulletPoints++;
      } else if (numberedListRegex.test(line)) {
        numberedItems++;
      }
      
      // Kiểm tra có số liệu không
      const hasNumbers = /\d+([,.]\d+)?\s*(%|phần trăm|tỷ lệ)?/.test(line);
      if (hasNumbers) {
        result.hasNumbers = true;
      }
    });
    
    if (bulletPoints > 0 && bulletPoints / lines.length > 0.5) {
      result.hasList = true;
      result.isBulletPoints = true;
    } else if (numberedItems > 0 && numberedItems / lines.length > 0.5) {
      result.hasList = true;
      result.isBulletPoints = false;
    }
    
    // Kiểm tra khả năng là dữ liệu biểu đồ
    const potentialChartData = text.split('\n')
      .filter(line => line.trim())
      .filter(line => /^.+:\s*\d+([,.]\d+)?$/.test(line) || /^.+,\s*\d+([,.]\d+)?$/.test(line));
    
    if (potentialChartData.length >= 3 && potentialChartData.length / lines.length > 0.5) {
      result.type = 'chart-data';
    }
    
    return result;
  };
  
  /**
   * Tạo đề xuất biểu đồ dựa trên nội dung văn bản
   * @param {string} text - Nội dung văn bản
   * @returns {object|null} - Đề xuất biểu đồ nếu phù hợp, null nếu không
   */
  export const suggestChartFromText = (text) => {
    const analysis = analyzeTextContent(text);
    
    if (analysis.type === 'chart-data' || (analysis.hasList && analysis.hasNumbers)) {
      const lines = text.split('\n').filter(line => line.trim());
      const chartData = {
        labels: [],
        data: [],
        chartType: 'bar'
      };
      
      // Ưu tiên xử lý dòng có định dạng "tên: giá trị" hoặc "tên, giá trị"
      lines.forEach(line => {
        let match = line.match(/^(.+?):\s*(\d+([,.]\d+)?)$/);
        if (!match) {
          match = line.match(/^(.+?),\s*(\d+([,.]\d+)?)$/);
        }
        
        if (match) {
          const label = match[1].trim();
          const value = parseFloat(match[2].replace(',', '.'));
          
          if (!isNaN(value)) {
            chartData.labels.push(label);
            chartData.data.push(value);
          }
        }
      });
      
      // Nếu xử lý được dữ liệu, đề xuất biểu đồ
      if (chartData.labels.length >= 2 && chartData.data.length >= 2) {
        // Đề xuất loại biểu đồ phù hợp
        if (chartData.labels.length <= 3) {
          chartData.chartType = 'pie'; // Ít dữ liệu, đề xuất biểu đồ tròn
        } else if (chartData.labels.length >= 6) {
          chartData.chartType = 'line'; // Nhiều dữ liệu, đề xuất biểu đồ đường
        }
        
        return chartData;
      }
    }
    
    return null;
  };
  
  /**
   * Tính toán kích thước slide cho việc xuất PDF
   * @param {object} slideSize - Kích thước slide
   * @returns {object} - Kích thước đã tính
   */
  export const calculateSlideExportSize = (slideSize = { width: 1280, height: 720 }) => {
    const width = slideSize.width || 1280;
    const height = slideSize.height || 720;
    
    return { width, height };
  };