// src/services/imageService.js - Sử dụng Fetch API thay vì Axios

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
 * Lấy URL hình ảnh dựa trên từ khóa
 * Hàm này được thiết kế để sử dụng với chức năng tạo bài thuyết trình tự động
 * @param {string|Array} keyword - Từ khóa hoặc mảng từ khóa
 * @param {Object} options - Các tùy chọn bổ sung (kích thước, v.v.)
 * @returns {string} - URL hình ảnh
 */
export const getImageByKeyword = (keyword, options = {}) => {
  try {
    // Xử lý từ khóa nếu là mảng
    const searchTerm = Array.isArray(keyword) ? keyword[0] : keyword;
    const encodedKeyword = encodeURIComponent(searchTerm);
    
    // Lấy kích thước từ tùy chọn hoặc sử dụng giá trị mặc định
    const { width = 800, height = 600 } = options;
    
    // Đầu tiên thử sử dụng Unsplash Source API (không cần API key)
    return `https://source.unsplash.com/${width}x${height}/?${encodedKeyword}`;
  } catch (error) {
    console.error('Error generating image URL:', error);
    // Fallback đến Lorem Picsum nếu có lỗi
    return `https://picsum.photos/${options.width || 800}/${options.height || 600}?text=${encodeURIComponent(keyword)}`;
  }
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
    
    // Xây dựng URL với query params
    const params = new URLSearchParams({
      query,
      page,
      per_page: perPage,
      orientation
    });
    
    // Sử dụng Fetch API thay vì Axios
    const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.results) {
      // Biến đổi kết quả trả về thành định dạng phù hợp
      return data.results.map(image => ({
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
    
    // Xây dựng URL với query params
    const params = new URLSearchParams({ orientation });
    if (query) {
      params.append('query', query);
    }
    
    // Sử dụng Fetch API
    const response = await fetch(`https://api.unsplash.com/photos/random?${params.toString()}`, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const image = await response.json();
    
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