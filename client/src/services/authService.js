import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Log API URL

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Thêm timeout để tránh request treo
  timeout: 10000
});

// Thêm interceptor để xử lý token
api.interceptors.request.use(
  (config) => {
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Lỗi khi gửi request:', error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export const authService = {
  // Đăng ký
  async register(userData) {
    try {
      console.log('Đang gửi request đăng ký:', { ...userData, password: '***' });
      const response = await api.post('/auth/register', userData);
      console.log('Response đăng ký:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Lỗi đăng ký:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Có lỗi xảy ra khi đăng ký');
    }
  },

  // Đăng nhập
  async login(email, password) {
    try {
      console.log('Đang gửi request đăng nhập:', { email, password: '***' });
      const response = await api.post('/auth/login', { email, password });
      console.log('Response đăng nhập:', response.data);

      // Kiểm tra response data
      if (!response.data) {
        console.error('Không có response data');
        throw new Error('Không nhận được response từ server');
      }

      // Response có thể là array hoặc object
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log('Data sau khi xử lý:', data);

      if (!data.token) {
        console.error('Không có token trong response');
        throw new Error('Không nhận được token từ server');
      }

      // Lưu token và thông tin user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Đã lưu token và user info');

      return data;
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
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Kết nối đến server bị timeout');
      } else {
        throw new Error(error.response?.data?.error || 'Có lỗi xảy ra khi đăng nhập');
      }
    }
  },

  // Đăng xuất
  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Đăng xuất thành công');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      throw error;
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thông tin user:', error);
      throw new Error(error.response?.data?.error || 'Không thể lấy thông tin người dùng');
    }
  },

  // Kiểm tra xem user đã đăng nhập chưa
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Kiểm tra token có hợp lệ không
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Lỗi khi kiểm tra token:', error);
      return false;
    }
  },

  // Lấy token
  getToken() {
    return localStorage.getItem('token');
  }
};

export default authService; 