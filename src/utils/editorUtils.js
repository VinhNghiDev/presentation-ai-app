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
    
    return {
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
      style: options.style || {}
    };
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
        data.push(parseFloat(parts[1].trim()) || 0);
      }
    });
    
    if (labels.length === 0) {
      return getChartData(chartType);
    }
    
    // Tạo dữ liệu biểu đồ
    switch (chartType) {
      case 'bar-chart':
      case 'line-chart':
        return {
          labels,
          datasets: [
            {
              label: 'Dữ liệu',
              data,
              backgroundColor: chartType === 'bar-chart' 
                ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] 
                : '#36A2EB',
              borderColor: chartType === 'line-chart' ? '#36A2EB' : undefined,
              tension: chartType === 'line-chart' ? 0.1 : undefined
            }
          ]
        };
      case 'pie-chart':
      case 'doughnut-chart':
        return {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
          ]
        };
      default:
        return getChartData(chartType);
    }
  };
  
  /**
   * Tính toán kích thước slide cho việc xuất PDF
   * @param {object} slideSize - Kích thước slide
   * @returns {object} - Kích thước đã tính
   */
  export const calculateSlideExportSize = (slideSize = { width: 1280, height: 720 }) => {
    const { width, height } = slideSize;
    const aspectRatio = width / height;
    
    // Kích thước mục tiêu cho việc xuất
    const targetWidth = 1200;
    const targetHeight = targetWidth / aspectRatio;
    
    return {
      width: targetWidth,
      height: targetHeight
    };
  };