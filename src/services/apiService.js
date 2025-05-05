/**
 * Service xử lý các API calls đến backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Gọi API với fetch
 * @param {string} endpoint - Đường dẫn API
 * @param {Object} options - Tùy chọn fetch
 * @returns {Promise<Object>} - Dữ liệu phản hồi
 */
const callApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * API tạo bài thuyết trình
 * @param {Object} options - Tùy chọn bài thuyết trình
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình
 */
export const generatePresentation = async (options) => {
  return callApi('presentation/generate', {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

/**
 * API nâng cao nội dung slide
 * @param {string} content - Nội dung cần nâng cao
 * @param {string} type - Loại nâng cao
 * @returns {Promise<Object>} - Nội dung đã nâng cao
 */
export const enhanceSlideContent = async (content, type = 'improve') => {
  return callApi('presentation/enhance', {
    method: 'POST',
    body: JSON.stringify({ content, type }),
  });
};

/**
 * API gợi ý từ khóa hình ảnh
 * @param {string} slideContent - Nội dung slide
 * @returns {Promise<Object>} - Danh sách từ khóa
 */
export const suggestImageKeywords = async (slideContent) => {
  return callApi('presentation/image-keywords', {
    method: 'POST',
    body: JSON.stringify({ slideContent }),
  });
};

/**
 * API kiểm tra trạng thái server
 * @returns {Promise<Object>} - Trạng thái server
 */
export const checkServerHealth = async () => {
  return callApi('health');
};

export default {
  generatePresentation,
  enhanceSlideContent,
  suggestImageKeywords,
  checkServerHealth,
}; 