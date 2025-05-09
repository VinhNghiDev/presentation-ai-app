import axios from 'axios';
import config from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Mock data cho testing
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: '2024-03-15T10:30:00.000Z'
  },
  {
    id: 2,
    name: 'Test User',
    email: 'user@example.com',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    lastLogin: '2024-03-14T15:45:00.000Z'
  }
];

const userService = {
  // Lấy danh sách người dùng
  getUsers: async (page = 1, limit = 10, search = '') => {
    try {
      // Sử dụng mock data cho testing
      const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );

      return {
        users: filteredUsers,
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      };

      // Uncomment khi có API thật
      // const response = await axios.get(`${config.API_URL}/users`, {
      //   params: { page, limit, search },
      //   headers: getAuthHeader()
      // });
      // return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy thông tin chi tiết người dùng
  getUserById: async (userId) => {
    try {
      // Sử dụng mock data cho testing
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;

      // Uncomment khi có API thật
      // const response = await axios.get(`${config.API_URL}/users/${userId}`, {
      //   headers: getAuthHeader()
      // });
      // return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userId, userData) => {
    try {
      // Sử dụng mock data cho testing
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...userData
      };
      
      return mockUsers[userIndex];

      // Uncomment khi có API thật
      // const response = await axios.put(`${config.API_URL}/users/${userId}`, userData, {
      //   headers: getAuthHeader()
      // });
      // return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa người dùng
  deleteUser: async (userId) => {
    try {
      // Sử dụng mock data cho testing
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      const deletedUser = mockUsers[userIndex];
      mockUsers.splice(userIndex, 1);
      
      return deletedUser;

      // Uncomment khi có API thật
      // const response = await axios.delete(`${config.API_URL}/users/${userId}`, {
      //   headers: getAuthHeader()
      // });
      // return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thay đổi trạng thái người dùng (active/inactive)
  toggleUserStatus: async (userId) => {
    try {
      // Sử dụng mock data cho testing
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockUsers[userIndex].isActive = !mockUsers[userIndex].isActive;
      return mockUsers[userIndex];

      // Uncomment khi có API thật
      // const response = await axios.patch(`${config.API_URL}/users/${userId}/toggle-status`, {}, {
      //   headers: getAuthHeader()
      // });
      // return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thay đổi vai trò người dùng
  changeUserRole: async (userId, role) => {
    try {
      // Sử dụng mock data cho testing
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      mockUsers[userIndex].role = role;
      return mockUsers[userIndex];

      // Uncomment khi có API thật
      // const response = await axios.patch(`${config.API_URL}/users/${userId}/role`, { role }, {
      //   headers: getAuthHeader()
      // });
      // return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService; 