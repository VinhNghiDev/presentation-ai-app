// src/services/collaborationService.js - Phiên bản đơn giản hóa

/**
 * Service giả lập quản lý chức năng cộng tác và bình luận
 * Phiên bản đơn giản hóa để tránh các vấn đề với Axios
 */

import axios from 'axios';
import { io } from 'socket.io-client';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class CollaborationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Kết nối socket
  connectToCollaboration(presentationId) {
    const token = authService.getToken();
    
    if (!this.socket) {
      this.socket = io(`${API_URL}/collaboration`, {
        query: { presentationId },
        auth: { token }
      });

      this.socket.on('connect', () => {
        console.log('Connected to collaboration server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from collaboration server');
      });

      // Lắng nghe các sự kiện
      this.socket.on('user_joined', (data) => this.notifyListeners('user_joined', data));
      this.socket.on('user_left', (data) => this.notifyListeners('user_left', data));
      this.socket.on('content_changed', (data) => this.notifyListeners('content_changed', data));
      this.socket.on('cursor_moved', (data) => this.notifyListeners('cursor_moved', data));
      this.socket.on('permissions_changed', (data) => this.notifyListeners('permissions_changed', data));
    }
    
    return this.socket;
  }

  // Ngắt kết nối socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Đăng ký lắng nghe sự kiện
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Hủy đăng ký lắng nghe sự kiện
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Thông báo cho các lắng nghe viên
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => callback(data));
    }
  }

  // Gửi thay đổi nội dung
  sendContentChange(changes) {
    if (this.socket) {
      this.socket.emit('content_change', changes);
    }
  }

  // Gửi vị trí con trỏ
  sendCursorPosition(position) {
    if (this.socket) {
      this.socket.emit('cursor_move', position);
    }
  }

  // Lấy danh sách người cộng tác
  async getCollaborators(presentationId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/presentations/${presentationId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch collaborators');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }
  }

  // Thêm người cộng tác
  async addCollaborator(presentationId, email, permission) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/presentations/${presentationId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, permission })
      });
      
      if (!response.ok) throw new Error('Failed to add collaborator');
      
      return await response.json();
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  // Cập nhật quyền người cộng tác
  async updateCollaboratorPermission(presentationId, collaboratorId, permission) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/presentations/${presentationId}/collaborators/${collaboratorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permission })
      });
      
      if (!response.ok) throw new Error('Failed to update collaborator permission');
      
      return await response.json();
    } catch (error) {
      console.error('Error updating collaborator permission:', error);
      throw error;
    }
  }

  // Xóa người cộng tác
  async removeCollaborator(presentationId, collaboratorId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/presentations/${presentationId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove collaborator');
      
      return true;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }

  // Lấy danh sách bài thuyết trình cộng tác
  async getCollaborativePresentations() {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/presentations/collaborative`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch collaborative presentations');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching collaborative presentations:', error);
      throw error;
    }
  }

  // Tạo liên kết chia sẻ
  async createShareLink(presentationId, permissions = {}) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/presentations/${presentationId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permissions })
      });
      
      if (!response.ok) throw new Error('Failed to create share link');
      
      return await response.json();
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    }
  }
}

const collaborationService = new CollaborationService();
export default collaborationService;

// Export các hàm cần thiết
export const getCollaborators = async (presentationId) => {
  try {
    const response = await axios.get(`${API_URL}/presentations/${presentationId}/collaborators`);
    return response.data;
  } catch (error) {
    console.error('Error getting collaborators:', error);
    throw error;
  }
};

export const getShareLinks = async (presentationId) => {
  try {
    const response = await axios.get(`${API_URL}/presentations/${presentationId}/share-links`);
    return response.data;
  } catch (error) {
    console.error('Error getting share links:', error);
    throw error;
  }
};

export const createShareLink = async (presentationId, options) => {
  try {
    const response = await axios.post(`${API_URL}/presentations/${presentationId}/share-links`, options);
    return response.data;
  } catch (error) {
    console.error('Error creating share link:', error);
    throw error;
  }
};

export const deleteShareLink = async (presentationId, linkId) => {
  try {
    await axios.delete(`${API_URL}/presentations/${presentationId}/share-links/${linkId}`);
  } catch (error) {
    console.error('Error deleting share link:', error);
    throw error;
  }
};