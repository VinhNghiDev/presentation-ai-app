import axios from 'axios';

// Log environment variables for debugging
console.log('Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log API configuration
console.log('API Configuration:', {
  baseURL: api.defaults.baseURL,
  headers: api.defaults.headers
});

// Lưu trữ thông tin người dùng vào localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Hàm retry với exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) {
        retries++;
        if (retries === maxRetries) {
          throw new Error('Server đang bận. Vui lòng thử lại sau vài phút.');
        }
        // Tính thời gian chờ với exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

/**
 * Service xử lý xác thực người dùng
 */
const authService = {
  // Đăng nhập
  login: async (email, password) => {
    try {
      console.log('Đang gửi request đăng nhập:', { email, password: '***' });
      console.log('API URL:', api.defaults.baseURL);
      
      const response = await retryWithBackoff(() => 
        api.post('/auth/login', { email, password })
      );
      
      console.log('Response đăng nhập:', response.data);

      if (!response.data) {
        console.error('Không có response data');
        throw new Error('Không nhận được response từ server');
      }

      const { user, token } = response.data;
      
      // Lưu vào localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Chi tiết lỗi đăng nhập:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.code === 'ECONNABORTED') {
        throw new Error('Kết nối đến server bị timeout');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng và đảm bảo server đang chạy.');
      } else if (error.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không chính xác');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy tài khoản');
      } else if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.');
      } else {
        throw new Error(error.response?.data?.error || 'Có lỗi xảy ra khi đăng nhập');
      }
    }
  },

  // Đăng nhập với Google
  loginWithGoogle: async () => {
    try {
      // Mở cửa sổ popup mới để xác thực với Google
      const googleAuthUrl = `${process.env.REACT_APP_API_URL}/auth/google`;
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      
      const popup = window.open(
        googleAuthUrl,
        'googlePopup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Theo dõi kết quả đăng nhập thông qua message từ popup
      return new Promise((resolve, reject) => {
        window.addEventListener('message', async (event) => {
          // Đảm bảo origin đúng để tránh XSS
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'social_auth_success') {
            const { user, token } = event.data;
            
            // Lưu vào localStorage
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            
            popup.close();
            resolve({ user, token });
          } else if (event.data.type === 'social_auth_error') {
            popup.close();
            reject(new Error(event.data.error || 'Đăng nhập với Google thất bại'));
          }
        });
        
        // Theo dõi trường hợp popup bị đóng mà không hoàn thành đăng nhập
        const checkPopupClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopupClosed);
            reject(new Error('Quá trình đăng nhập bị hủy'));
          }
        }, 1000);
      });
    } catch (error) {
      console.error('Lỗi đăng nhập với Google:', error);
      throw new Error('Đăng nhập với Google thất bại. Vui lòng thử lại sau.');
    }
  },

  // Đăng nhập với Microsoft
  loginWithMicrosoft: async () => {
    try {
      // Mở cửa sổ popup mới để xác thực với Microsoft
      const msAuthUrl = `${process.env.REACT_APP_API_URL}/auth/microsoft`;
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      
      const popup = window.open(
        msAuthUrl,
        'microsoftPopup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Theo dõi kết quả đăng nhập thông qua message từ popup
      return new Promise((resolve, reject) => {
        window.addEventListener('message', async (event) => {
          // Đảm bảo origin đúng để tránh XSS
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'social_auth_success') {
            const { user, token } = event.data;
            
            // Lưu vào localStorage
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            
            popup.close();
            resolve({ user, token });
          } else if (event.data.type === 'social_auth_error') {
            popup.close();
            reject(new Error(event.data.error || 'Đăng nhập với Microsoft thất bại'));
          }
        });
        
        // Theo dõi trường hợp popup bị đóng mà không hoàn thành đăng nhập
        const checkPopupClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopupClosed);
            reject(new Error('Quá trình đăng nhập bị hủy'));
          }
        }, 1000);
      });
    } catch (error) {
      console.error('Lỗi đăng nhập với Microsoft:', error);
      throw new Error('Đăng nhập với Microsoft thất bại. Vui lòng thử lại sau.');
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      console.log('Đang gửi request đăng ký:', { ...userData, password: '***' });
      
      const response = await retryWithBackoff(() =>
        api.post('/auth/register', userData)
      );
      
      console.log('Response đăng ký:', response.data);

      if (!response.data) {
        console.error('Không có response data');
        throw new Error('Không nhận được response từ server');
      }

      const { user, token } = response.data;
      
      // Lưu vào localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Chi tiết lỗi đăng ký:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Dữ liệu không hợp lệ');
      } else if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Kết nối đến server bị timeout');
      } else {
        throw new Error(error.response?.data?.error || 'Có lỗi xảy ra khi đăng ký');
      }
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Lấy token xác thực
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  // Kiểm tra quyền admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Kiểm tra quyền thực hiện hành động
  canPerformAction: (action) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    // Admin có thể thực hiện tất cả các hành động
    if (user.role === 'admin') return true;
    
    // Người dùng thông thường chỉ có thể thực hiện các hành động cơ bản
    const basicActions = [
      'view_profile',
      'edit_profile',
      'change_password'
    ];
    return basicActions.includes(action);
  },

  // Setup interceptor cho axios
  setupAxiosInterceptors: () => {
    api.interceptors.request.use(
      config => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (userData) => {
    try {
      const response = await retryWithBackoff(() =>
        api.put('/auth/profile', userData)
      );
      
      // Cập nhật thông tin trong localStorage
      const updatedUser = { ...authService.getCurrentUser(), ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const response = await retryWithBackoff(() =>
        api.put('/auth/change-password', passwordData)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService; 