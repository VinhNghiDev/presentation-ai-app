// src/services/collaborationService.js - Phiên bản đơn giản hóa

/**
 * Service giả lập quản lý chức năng cộng tác và bình luận
 * Phiên bản đơn giản hóa để tránh các vấn đề với Axios
 */

// Mô phỏng dữ liệu người dùng
const mockCurrentUser = {
    id: 'current-user',
    name: 'Người dùng hiện tại',
    email: 'user@example.com',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
  };
  
  // Các quyền truy cập có sẵn
  export const availablePermissions = [
    { label: 'Chủ sở hữu', value: 'owner', description: 'Có thể chỉnh sửa, chia sẻ và xóa' },
    { label: 'Biên tập viên', value: 'editor', description: 'Có thể chỉnh sửa nhưng không thể chia sẻ hoặc xóa' },
    { label: 'Người xem', value: 'viewer', description: 'Chỉ có thể xem' }
  ];
  
  /**
   * Kiểm tra quyền truy cập của người dùng
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Object>} - Thông tin quyền truy cập
   */
  export const checkUserPermission = async (presentationId) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Trả về giả định người dùng hiện tại là chủ sở hữu
    return {
      hasAccess: true,
      permissionLevel: 'owner',
      permissionDetails: {
        canEdit: true,
        canShare: true,
        canDelete: true
      },
      userInfo: {
        userId: mockCurrentUser.id,
        email: mockCurrentUser.email,
        name: mockCurrentUser.name,
        avatar: mockCurrentUser.avatar
      }
    };
  };
  
  /**
   * Lấy danh sách người dùng cho một bài thuyết trình
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách người dùng
   */
  export const getCollaborators = async (presentationId) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Kiểm tra trong localStorage
    try {
      const collaboratorsData = localStorage.getItem(`collaborators_${presentationId}`);
      if (collaboratorsData) {
        return JSON.parse(collaboratorsData);
      }
    } catch (error) {
      console.error('Error reading collaborators from localStorage:', error);
    }
    
    // Trong trường hợp không có dữ liệu, trả về người dùng hiện tại là chủ sở hữu
    const defaultCollaborators = [
      {
        userId: mockCurrentUser.id,
        email: mockCurrentUser.email,
        name: mockCurrentUser.name,
        permission: 'owner',
        avatar: mockCurrentUser.avatar
      }
    ];
    
    // Lưu vào localStorage
    try {
      localStorage.setItem(`collaborators_${presentationId}`, JSON.stringify(defaultCollaborators));
    } catch (error) {
      console.error('Error saving collaborators to localStorage:', error);
    }
    
    return defaultCollaborators;
  };
  
  /**
   * Thêm người cộng tác mới
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} email - Email người dùng
   * @param {string} permission - Quyền truy cập
   * @returns {Promise<boolean>} - Kết quả thêm
   */
  export const addCollaborator = async (presentationId, email, permission) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Lấy danh sách người cộng tác hiện tại
      const collaborators = await getCollaborators(presentationId);
      
      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingIndex = collaborators.findIndex(c => c.email === email);
      if (existingIndex >= 0) {
        // Cập nhật quyền nếu đã tồn tại
        collaborators[existingIndex].permission = permission;
      } else {
        // Tạo người dùng mới
        collaborators.push({
          userId: `user-${Date.now()}`,
          email: email,
          name: email.split('@')[0],
          permission: permission,
          avatar: `https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 8) + 1}.jpg`
        });
      }
      
      // Lưu vào localStorage
      localStorage.setItem(`collaborators_${presentationId}`, JSON.stringify(collaborators));
      
      return true;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      return false;
    }
  };
  
  /**
   * Cập nhật quyền cho người cộng tác
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} userId - ID người dùng
   * @param {string} permission - Quyền mới
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  export const updateCollaboratorPermission = async (presentationId, userId, permission) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Lấy danh sách người cộng tác hiện tại
      const collaborators = await getCollaborators(presentationId);
      
      // Tìm người cộng tác cần cập nhật
      const collaborator = collaborators.find(c => c.userId === userId);
      if (!collaborator) {
        return false;
      }
      
      // Không cho phép thay đổi quyền của chủ sở hữu
      if (collaborator.permission === 'owner') {
        return false;
      }
      
      // Cập nhật quyền
      collaborator.permission = permission;
      
      // Lưu vào localStorage
      localStorage.setItem(`collaborators_${presentationId}`, JSON.stringify(collaborators));
      
      return true;
    } catch (error) {
      console.error('Error updating collaborator permission:', error);
      return false;
    }
  };
  
  /**
   * Xóa người cộng tác
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} userId - ID người dùng
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  export const removeCollaborator = async (presentationId, userId) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Lấy danh sách người cộng tác hiện tại
      const collaborators = await getCollaborators(presentationId);
      
      // Tìm người cộng tác cần xóa
      const collaborator = collaborators.find(c => c.userId === userId);
      if (!collaborator) {
        return false;
      }
      
      // Không cho phép xóa chủ sở hữu
      if (collaborator.permission === 'owner') {
        return false;
      }
      
      // Xóa người cộng tác
      const updatedCollaborators = collaborators.filter(c => c.userId !== userId);
      
      // Lưu vào localStorage
      localStorage.setItem(`collaborators_${presentationId}`, JSON.stringify(updatedCollaborators));
      
      return true;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      return false;
    }
  };
  
  /**
   * Tạo liên kết chia sẻ
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} permission - Quyền truy cập mặc định
   * @param {number} expiresIn - Thời gian hết hạn (giây), 0 = không hết hạn
   * @returns {Promise<Object>} - Thông tin liên kết
   */
  export const createShareLink = async (presentationId, permission = 'viewer', expiresIn = 0) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Tạo token ngẫu nhiên
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Tính thời gian hết hạn
      const expiresAt = expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0;
      
      // Tạo thông tin liên kết
      const shareLink = {
        token,
        presentationId,
        permission,
        expiresAt,
        createdAt: Date.now(),
        url: `${window.location.origin}/shared/${presentationId}?token=${token}`
      };
      
      // Lưu vào localStorage
      const shareLinks = JSON.parse(localStorage.getItem(`share_links_${presentationId}`) || '[]');
      shareLinks.push(shareLink);
      localStorage.setItem(`share_links_${presentationId}`, JSON.stringify(shareLinks));
      
      return shareLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw new Error('Không thể tạo liên kết chia sẻ');
    }
  };
  
  /**
   * Lấy danh sách liên kết chia sẻ
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách liên kết
   */
  export const getShareLinks = async (presentationId) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Lấy từ localStorage
      const shareLinks = JSON.parse(localStorage.getItem(`share_links_${presentationId}`) || '[]');
      
      // Lọc các liên kết đã hết hạn
      const now = Date.now();
      const validLinks = shareLinks.filter(link => link.expiresAt === 0 || link.expiresAt > now);
      
      // Cập nhật lại localStorage nếu có liên kết hết hạn
      if (validLinks.length !== shareLinks.length) {
        localStorage.setItem(`share_links_${presentationId}`, JSON.stringify(validLinks));
      }
      
      return validLinks;
    } catch (error) {
      console.error('Error getting share links:', error);
      return [];
    }
  };
  
  /**
   * Xóa liên kết chia sẻ
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} token - Token liên kết
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  export const deleteShareLink = async (presentationId, token) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Lấy danh sách liên kết hiện tại
      const shareLinks = JSON.parse(localStorage.getItem(`share_links_${presentationId}`) || '[]');
      
      // Lọc liên kết cần xóa
      const updatedLinks = shareLinks.filter(link => link.token !== token);
      
      // Kiểm tra xem có sự thay đổi không
      if (updatedLinks.length === shareLinks.length) {
        return false;
      }
      
      // Lưu vào localStorage
      localStorage.setItem(`share_links_${presentationId}`, JSON.stringify(updatedLinks));
      
      return true;
    } catch (error) {
      console.error('Error deleting share link:', error);
      return false;
    }
  };
  
  /**
   * Lấy danh sách bình luận cho một slide
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} slideId - ID slide
   * @returns {Promise<Array>} - Danh sách bình luận
   */
  export const getComments = async (presentationId, slideId) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Lấy từ localStorage
      const comments = JSON.parse(localStorage.getItem(`comments_${presentationId}_${slideId}`) || '[]');
      return comments;
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  };
  
  /**
   * Thêm bình luận mới
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} slideId - ID slide
   * @param {string} content - Nội dung bình luận
   * @param {Object} position - Vị trí bình luận (tùy chọn)
   * @returns {Promise<Object>} - Bình luận mới
   */
  export const addComment = async (presentationId, slideId, content, position = null) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Tạo bình luận mới
      const newComment = {
        id: `comment-${Date.now()}`,
        content,
        position,
        createdAt: Date.now(),
        author: {
          email: mockCurrentUser.email,
          name: mockCurrentUser.name,
          avatar: mockCurrentUser.avatar
        },
        replies: []
      };
      
      // Lấy danh sách bình luận hiện tại
      const comments = JSON.parse(localStorage.getItem(`comments_${presentationId}_${slideId}`) || '[]');
      
      // Thêm bình luận mới
      comments.push(newComment);
      
      // Lưu vào localStorage
      localStorage.setItem(`comments_${presentationId}_${slideId}`, JSON.stringify(comments));
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Không thể thêm bình luận');
    }
  };
  
  /**
   * Thêm phản hồi cho một bình luận
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} slideId - ID slide
   * @param {string} commentId - ID bình luận
   * @param {string} content - Nội dung phản hồi
   * @returns {Promise<Object>} - Phản hồi mới
   */
  export const addReply = async (presentationId, slideId, commentId, content) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Tạo phản hồi mới
      const newReply = {
        id: `reply-${Date.now()}`,
        content,
        createdAt: Date.now(),
        author: {
          email: mockCurrentUser.email,
          name: mockCurrentUser.name,
          avatar: mockCurrentUser.avatar
        }
      };
      
      // Lấy danh sách bình luận hiện tại
      const comments = JSON.parse(localStorage.getItem(`comments_${presentationId}_${slideId}`) || '[]');
      
      // Tìm bình luận cần phản hồi
      const comment = comments.find(c => c.id === commentId);
      if (!comment) {
        throw new Error('Không tìm thấy bình luận');
      }
      
      // Thêm phản hồi
      comment.replies = comment.replies || [];
      comment.replies.push(newReply);
      
      // Lưu vào localStorage
      localStorage.setItem(`comments_${presentationId}_${slideId}`, JSON.stringify(comments));
      
      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw new Error('Không thể thêm phản hồi');
    }
  };
  
  /**
   * Lưu phiên bản bài thuyết trình
   * @param {string} presentationId - ID bài thuyết trình
   * @param {Object} presentationData - Dữ liệu bài thuyết trình
   * @param {string} comment - Ghi chú về phiên bản
   * @returns {Promise<Object>} - Thông tin phiên bản mới
   */
  export const saveVersion = async (presentationId, presentationData, comment = '') => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Tạo phiên bản mới
      const newVersion = {
        id: `version-${Date.now()}`,
        createdAt: Date.now(),
        comment: comment || `Phiên bản ${new Date().toLocaleString()}`,
        author: {
          email: mockCurrentUser.email,
          name: mockCurrentUser.name
        }
      };
      
      // Lấy danh sách phiên bản hiện tại
      const versions = JSON.parse(localStorage.getItem(`versions_${presentationId}`) || '[]');
      
      // Thêm phiên bản mới
      versions.push(newVersion);
      
      // Lưu vào localStorage
      localStorage.setItem(`versions_${presentationId}`, JSON.stringify(versions));
      
      // Lưu dữ liệu của phiên bản (chỉ lưu metadata, không lưu nội dung đầy đủ để tiết kiệm dung lượng)
      const versionMetadata = {
        id: presentationData.id,
        title: presentationData.title,
        lastModified: presentationData.lastModified,
        slideCount: presentationData.slides?.length || 0
      };
      localStorage.setItem(`version_data_${presentationId}_${newVersion.id}`, JSON.stringify(versionMetadata));
      
      return newVersion;
    } catch (error) {
      console.error('Error saving version:', error);
      throw new Error('Không thể lưu phiên bản');
    }
  };
  
  /**
   * Lấy danh sách các phiên bản của bài thuyết trình
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách phiên bản
   */
  export const getVersionHistory = async (presentationId) => {
    // Giả lập độ trễ
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Lấy từ localStorage
      const versions = JSON.parse(localStorage.getItem(`versions_${presentationId}`) || '[]');
      return versions;
    } catch (error) {
      console.error('Error getting version history:', error);
      return [];
    }
  };