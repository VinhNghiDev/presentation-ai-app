import axios from 'axios';

// Tạo instance axios với base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000
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
        statusText: error.response?.statusText
      });
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không chính xác');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy tài khoản');
      } else if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Kết nối đến server bị timeout');
      } else {
        throw new Error(error.response?.data?.error || 'Có lỗi xảy ra khi đăng nhập');
      }
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