import axios from 'axios';

/**
 * Cấu hình API key cho Unsplash
 * @type {string}
 */
let UNSPLASH_API_KEY = '';

/**
 * Thiết lập API key cho Unsplash
 * @param {string} apiKey - API key
 */
export const setUnsplashApiKey = (apiKey) => {
  UNSPLASH_API_KEY = apiKey;
  localStorage.setItem('unsplash_api_key', apiKey);
};

/**
 * Lấy API key cho Unsplash từ localStorage
 * @returns {string} - API key hoặc chuỗi rỗng
 */
export const getUnsplashApiKey = () => {
  if (!UNSPLASH_API_KEY) {
    UNSPLASH_API_KEY = localStorage.getItem('unsplash_api_key') || '';
  }
  return UNSPLASH_API_KEY;
};

/**
 * Tìm kiếm hình ảnh từ Unsplash
 * @param {string} query - Từ khóa tìm kiếm
 * @param {Object} options - Tùy chọn tìm kiếm
 * @returns {Promise<Array>} - Kết quả tìm kiếm
 */
export const searchUnsplashImages = async (query, options = {}) => {
  try {
    const apiKey = getUnsplashApiKey();
    
    if (!apiKey) {
      throw new Error('Unsplash API Key không được cung cấp');
    }
    
    const { page = 1, perPage = 20, orientation = 'landscape' } = options;
    
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      },
      params: {
        query,
        page,
        per_page: perPage,
        orientation
      }
    });
    
    if (response.data && response.data.results) {
      // Biến đổi kết quả trả về thành định dạng phù hợp
      return response.data.results.map(image => ({
        id: image.id,
        url: image.urls.regular,
        thumbnail: image.urls.thumb,
        description: image.description || image.alt_description || query,
        user: {
          name: image.user.name,
          username: image.user.username,
          portfolio: image.user.portfolio_url
        },
        download_url: image.links.download,
        width: image.width,
        height: image.height
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Unsplash images:', error);
    
    // Xử lý lỗi API cụ thể
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          throw new Error('API key không hợp lệ');
        case 403:
          throw new Error('Không có quyền truy cập API');
        case 429:
          throw new Error('Đã vượt quá giới hạn tần suất gọi API');
        default:
          throw new Error(`Lỗi từ API Unsplash: ${error.message}`);
      }
    }
    
    throw error;
  }
};

/**
 * Lấy hình ảnh ngẫu nhiên từ Unsplash
 * @param {string} query - Từ khóa tìm kiếm (tùy chọn)
 * @param {Object} options - Tùy chọn
 * @returns {Promise<Object>} - Hình ảnh
 */
export const getRandomUnsplashImage = async (query = '', options = {}) => {
  try {
    const apiKey = getUnsplashApiKey();
    
    if (!apiKey) {
      throw new Error('Unsplash API Key không được cung cấp');
    }
    
    const { orientation = 'landscape' } = options;
    const params = {
      orientation
    };
    
    if (query) {
      params.query = query;
    }
    
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      },
      params
    });
    
    if (response.data) {
      // Biến đổi kết quả trả về thành định dạng phù hợp
      const image = response.data;
      return {
        id: image.id,
        url: image.urls.regular,
        thumbnail: image.urls.thumb,
        description: image.description || image.alt_description || query,
        user: {
          name: image.user.name,
          username: image.user.username,
          portfolio: image.user.portfolio_url
        },
        download_url: image.links.download,
        width: image.width,
        height: image.height
      };
    }
    
    throw new Error('Không nhận được phản hồi hợp lệ từ Unsplash');
  } catch (error) {
    console.error('Error getting random Unsplash image:', error);
    throw error;
  }
};

/**
 * Lấy danh sách các danh mục hình ảnh
 * @returns {Array} - Danh sách các danh mục
 */
export const getImageCategories = () => {
  return [
    { id: 'business', name: 'Kinh doanh', sample: 'business meeting' },
    { id: 'technology', name: 'Công nghệ', sample: 'technology' },
    { id: 'education', name: 'Giáo dục', sample: 'education' },
    { id: 'nature', name: 'Thiên nhiên', sample: 'nature' },
    { id: 'travel', name: 'Du lịch', sample: 'travel' },
    { id: 'food', name: 'Ẩm thực', sample: 'food' },
    { id: 'health', name: 'Sức khỏe', sample: 'healthcare' },
    { id: 'art', name: 'Nghệ thuật', sample: 'art' },
    { id: 'science', name: 'Khoa học', sample: 'science' },
    { id: 'sport', name: 'Thể thao', sample: 'sports' }
  ];
};

/**
 * Biến đổi hình ảnh thành dạng Base64
 * @param {string} url - URL hình ảnh
 * @returns {Promise<string>} - Chuỗi base64
 */
export const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Tải hình ảnh từ máy tính người dùng
 * @param {Function} onSuccess - Callback khi tải lên thành công
 */
export const uploadImageFromComputer = (onSuccess) => {
  // Tạo một input file tạm thời
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  
  // Xử lý sự kiện khi người dùng chọn file
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Đọc file thành base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        
        // Gọi callback với thông tin hình ảnh
        onSuccess({
          id: `local-${Date.now()}`,
          url: base64,
          thumbnail: base64,
          description: file.name,
          isLocal: true,
          width: 800, // Kích thước mặc định
          height: 600
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Có lỗi khi tải lên hình ảnh. Vui lòng thử lại.');
    }
  });
  
  // Kích hoạt dialog chọn file
  fileInput.click();
};

/**
 * Lấy hình ảnh mẫu cho trường hợp không có API key
 * @param {string} category - Danh mục
 * @param {number} count - Số lượng hình ảnh cần lấy
 * @returns {Array} - Danh sách hình ảnh
 */
export const getSampleImages = (category = 'all', count = 8) => {
  // Mảng các hình ảnh mẫu từ Lorem Picsum
  const allImages = [
    // Business
    { id: 'b1', url: 'https://picsum.photos/id/1/800/600', thumbnail: 'https://picsum.photos/id/1/200/150', category: 'business', description: 'Business meeting' },
    { id: 'b2', url: 'https://picsum.photos/id/20/800/600', thumbnail: 'https://picsum.photos/id/20/200/150', category: 'business', description: 'Office space' },
    
    // Technology
    { id: 't1', url: 'https://picsum.photos/id/2/800/600', thumbnail: 'https://picsum.photos/id/2/200/150', category: 'technology', description: 'Technology concept' },
    { id: 't2', url: 'https://picsum.photos/id/30/800/600', thumbnail: 'https://picsum.photos/id/30/200/150', category: 'technology', description: 'Digital workspace' },
    
    // Education
    { id: 'e1', url: 'https://picsum.photos/id/3/800/600', thumbnail: 'https://picsum.photos/id/3/200/150', category: 'education', description: 'Learning environment' },
    { id: 'e2', url: 'https://picsum.photos/id/24/800/600', thumbnail: 'https://picsum.photos/id/24/200/150', category: 'education', description: 'Book collection' },
    
    // Nature
    { id: 'n1', url: 'https://picsum.photos/id/10/800/600', thumbnail: 'https://picsum.photos/id/10/200/150', category: 'nature', description: 'Mountain landscape' },
    { id: 'n2', url: 'https://picsum.photos/id/15/800/600', thumbnail: 'https://picsum.photos/id/15/200/150', category: 'nature', description: 'Forest scene' },
    
    // Travel
    { id: 'tr1', url: 'https://picsum.photos/id/42/800/600', thumbnail: 'https://picsum.photos/id/42/200/150', category: 'travel', description: 'City exploration' },
    { id: 'tr2', url: 'https://picsum.photos/id/70/800/600', thumbnail: 'https://picsum.photos/id/70/200/150', category: 'travel', description: 'Tourist destination' },
    
    // Food
    { id: 'f1', url: 'https://picsum.photos/id/100/800/600', thumbnail: 'https://picsum.photos/id/100/200/150', category: 'food', description: 'Gourmet meal' },
    { id: 'f2', url: 'https://picsum.photos/id/102/800/600', thumbnail: 'https://picsum.photos/id/102/200/150', category: 'food', description: 'Healthy options' }
  ];
  
  // Lọc theo danh mục nếu cần
  const filtered = category === 'all' 
    ? allImages 
    : allImages.filter(img => img.category === category);
  
  // Trả về số lượng tương ứng
  return filtered.slice(0, count);
};