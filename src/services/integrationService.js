/**
 * Dịch vụ tích hợp với các công cụ khác
 * Phiên bản giả lập cho các tính năng tích hợp
 */

// Danh sách các dịch vụ tích hợp
export const availableIntegrations = [
  { 
    id: 'google_slides', 
    name: 'Google Slides', 
    icon: 'bi-google',
    description: 'Nhập và xuất bài thuyết trình từ Google Slides',
    connected: false
  },
  { 
    id: 'powerpoint', 
    name: 'Microsoft PowerPoint', 
    icon: 'bi-microsoft',
    description: 'Chuyển đổi qua lại với Microsoft PowerPoint',
    connected: false
  },
  { 
    id: 'canva', 
    name: 'Canva',
    icon: 'bi-palette',
    description: 'Sử dụng và chỉnh sửa mẫu từ Canva',
    connected: false
  },
  { 
    id: 'google_drive', 
    name: 'Google Drive',
    icon: 'bi-google',
    description: 'Lưu trữ và đồng bộ với Google Drive',
    connected: true
  },
  { 
    id: 'dropbox', 
    name: 'Dropbox',
    icon: 'bi-dropbox',
    description: 'Lưu trữ và đồng bộ với Dropbox',
    connected: false
  }
];

// Lưu trữ các kết nối tạm thời
let connectedIntegrations = ['google_drive'];

/**
 * Lấy danh sách tất cả các tích hợp có sẵn
 * @returns {Promise<Array>} - Danh sách tích hợp
 */
export const getAvailableIntegrations = async () => {
  // Giả lập độ trễ
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Lấy trạng thái tích hợp từ localStorage
  try {
    const storedIntegrations = localStorage.getItem('connected_integrations');
    if (storedIntegrations) {
      connectedIntegrations = JSON.parse(storedIntegrations);
    }
  } catch (error) {
    console.error('Error loading integrations from localStorage:', error);
  }
  
  // Cập nhật trạng thái kết nối
  return availableIntegrations.map(integration => ({
    ...integration,
    connected: connectedIntegrations.includes(integration.id)
  }));
};

/**
 * Kết nối với một dịch vụ
 * @param {string} integrationId - ID tích hợp
 * @returns {Promise<boolean>} - Kết quả kết nối
 */
export const connectToService = async (integrationId) => {
  // Giả lập độ trễ
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Giả lập kết nối
  const success = Math.random() > 0.2; // 80% thành công
  
  if (success) {
    // Thêm vào danh sách đã kết nối
    if (!connectedIntegrations.includes(integrationId)) {
      connectedIntegrations.push(integrationId);
    }
    
    // Lưu vào localStorage
    try {
      localStorage.setItem('connected_integrations', JSON.stringify(connectedIntegrations));
    } catch (error) {
      console.error('Error saving integrations to localStorage:', error);
    }
  }
  
  return success;
};

/**
 * Ngắt kết nối với một dịch vụ
 * @param {string} integrationId - ID tích hợp
 * @returns {Promise<boolean>} - Kết quả ngắt kết nối
 */
export const disconnectService = async (integrationId) => {
  // Giả lập độ trễ
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Xóa khỏi danh sách đã kết nối
  connectedIntegrations = connectedIntegrations.filter(id => id !== integrationId);
  
  // Lưu vào localStorage
  try {
    localStorage.setItem('connected_integrations', JSON.stringify(connectedIntegrations));
  } catch (error) {
    console.error('Error saving integrations to localStorage:', error);
  }
  
  return true;
};

/**
 * Nhập bài thuyết trình từ dịch vụ khác
 * @param {string} serviceId - ID dịch vụ
 * @param {string} fileId - ID tập tin (nếu có)
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình
 */
export const importFromService = async (serviceId, fileId = null) => {
  // Giả lập độ trễ
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Kiểm tra xem dịch vụ đã được kết nối chưa
  if (!connectedIntegrations.includes(serviceId)) {
    throw new Error('Chưa kết nối với dịch vụ này. Vui lòng kết nối trước khi nhập.');
  }
  
  // Tạo dữ liệu mẫu
  const demoPresentation = {
    id: 'imported-' + Date.now(),
    title: `Bài thuyết trình nhập từ ${getServiceName(serviceId)}`,
    slides: [
      {
        id: 'slide-1',
        title: 'Trang bìa',
        content: 'Bài thuyết trình nhập từ dịch vụ bên ngoài',
        template: 'default',
        elements: []
      },
      {
        id: 'slide-2',
        title: 'Giới thiệu',
        content: 'Nội dung giới thiệu mẫu',
        template: 'default',
        elements: []
      },
      {
        id: 'slide-3',
        title: 'Nội dung chính',
        content: 'Nội dung chính của bài thuyết trình',
        template: 'default',
        elements: []
      }
    ],
    metadata: {
      source: serviceId,
      originalId: fileId || 'unknown',
      importDate: new Date().toISOString()
    }
  };
  
  return demoPresentation;
};

/**
 * Xuất bài thuyết trình sang dịch vụ khác
 * @param {string} serviceId - ID dịch vụ
 * @param {Object} presentationData - Dữ liệu bài thuyết trình
 * @returns {Promise<Object>} - Kết quả xuất
 */
export const exportToService = async (serviceId, presentationData) => {
  // Giả lập độ trễ
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Kiểm tra xem dịch vụ đã được kết nối chưa
  if (!connectedIntegrations.includes(serviceId)) {
    throw new Error('Chưa kết nối với dịch vụ này. Vui lòng kết nối trước khi xuất.');
  }
  
  // Giả lập thành công
  return {
    success: true,
    url: `https://example.com/${serviceId}/document/123456`,
    message: `Đã xuất thành công sang ${getServiceName(serviceId)}`
  };
};

/**
 * Lấy danh sách tệp gần đây từ dịch vụ
 * @param {string} serviceId - ID dịch vụ
 * @returns {Promise<Array>} - Danh sách tệp
 */
export const getRecentFiles = async (serviceId) => {
  // Giả lập độ trễ
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Kiểm tra xem dịch vụ đã được kết nối chưa
  if (!connectedIntegrations.includes(serviceId)) {
    throw new Error('Chưa kết nối với dịch vụ này');
  }
  
  // Tạo danh sách tệp mẫu
  const files = [
    {
      id: 'file1',
      name: 'Bài thuyết trình cuối kỳ',
      lastModified: new Date(Date.now() - 7200000).toISOString(),
      thumbnail: 'https://placehold.co/100x70?text=Slide+1'
    },
    {
      id: 'file2',
      name: 'Kế hoạch marketing 2024',
      lastModified: new Date(Date.now() - 172800000).toISOString(),
      thumbnail: 'https://placehold.co/100x70?text=Slide+2'
    },
    {
      id: 'file3',
      name: 'Báo cáo tài chính Q2',
      lastModified: new Date(Date.now() - 604800000).toISOString(),
      thumbnail: 'https://placehold.co/100x70?text=Slide+3'
    }
  ];
  
  return files;
};

/**
 * Lấy tên dịch vụ từ ID
 * @param {string} serviceId - ID dịch vụ
 * @returns {string} - Tên dịch vụ
 */
const getServiceName = (serviceId) => {
  const service = availableIntegrations.find(i => i.id === serviceId);
  return service ? service.name : serviceId;
}; 