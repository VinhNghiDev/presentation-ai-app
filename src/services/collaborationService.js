// Mô phỏng dữ liệu người dùng
const fakeUsers = [
    { id: 'user1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 'user2', name: 'Trần Thị B', email: 'tranthib@example.com', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 'user3', name: 'Lê Văn C', email: 'levanc@example.com', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 'user4', name: 'Phạm Thị D', email: 'phamthid@example.com', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' }
  ];
  
  // Mô phỏng dữ liệu quyền truy cập
  const fakePermissions = {
    owner: { label: 'Chủ sở hữu', value: 'owner', canEdit: true, canShare: true, canDelete: true },
    editor: { label: 'Biên tập viên', value: 'editor', canEdit: true, canShare: false, canDelete: false },
    viewer: { label: 'Người xem', value: 'viewer', canEdit: false, canShare: false, canDelete: false }
  };
  
  /**
   * Lấy danh sách người dùng cho một bài thuyết trình
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách người dùng
   */
  export const getCollaborators = async (presentationId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Kiểm tra trong localStorage
    const collaboratorsData = localStorage.getItem(`collaborators_${presentationId}`);
    if (collaboratorsData) {
      return JSON.parse(collaboratorsData);
    }
    
    // Trong trường hợp không có dữ liệu, trả về người dùng hiện tại là chủ sở hữu
    const currentUserEmail = localStorage.getItem('user_email') || 'user@example.com';
    
    const defaultCollaborators = [
      {
        userId: 'current-user',
        email: currentUserEmail,
        name: 'Tôi',
        permission: 'owner',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
      }
    ];
    
    // Lưu vào localStorage
    localStorage.setItem(`collaborators_${presentationId}`, JSON.stringify(defaultCollaborators));
    
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
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy danh sách người cộng tác hiện tại
    const collaborators = await getCollaborators(presentationId);
    
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingIndex = collaborators.findIndex(c => c.email === email);
    if (existingIndex >= 0) {
      // Cập nhật quyền nếu đã tồn tại
      collaborators[existingIndex].permission = permission;
    } else {
      // Giả lập tìm kiếm người dùng dựa trên email
      // Trong thực tế sẽ tìm trong database
      const fakeUser = fakeUsers.find(u => u.email === email) || {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: `https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 8) + 1}.jpg`
      };
      
      // Thêm người cộng tác mới
      collaborators.push({
        userId: fakeUser.id,
        email: fakeUser.email,
        name: fakeUser.name,
        permission,
        avatar: fakeUser.avatar
      });
    }
    
    // Lưu vào localStorage
    localStorage.setItem(`collaborators_${presentationId}`, JSON.stringify(collaborators));
    
    return true;
  };
  
  /**
   * Cập nhật quyền cho người cộng tác
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} userId - ID người dùng
   * @param {string} permission - Quyền mới
   * @returns {Promise<boolean>} - Kết quả cập nhật
   */
  export const updateCollaboratorPermission = async (presentationId, userId, permission) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  };
  
  /**
   * Xóa người cộng tác
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} userId - ID người dùng
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  export const removeCollaborator = async (presentationId, userId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  };
  
  /**
   * Tạo liên kết chia sẻ
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} permission - Quyền truy cập mặc định
   * @param {boolean} expiresIn - Thời gian hết hạn (giây), 0 = không hết hạn
   * @returns {Promise<Object>} - Thông tin liên kết
   */
  export const createShareLink = async (presentationId, permission = 'viewer', expiresIn = 0) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  };
  
  /**
   * Lấy danh sách liên kết chia sẻ
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách liên kết
   */
  export const getShareLinks = async (presentationId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  };
  
  /**
   * Xóa liên kết chia sẻ
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} token - Token liên kết
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  export const deleteShareLink = async (presentationId, token) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  };
  
  /**
   * Kiểm tra quyền truy cập của người dùng
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Object>} - Thông tin quyền truy cập
   */
  export const checkUserPermission = async (presentationId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy danh sách người cộng tác
    const collaborators = await getCollaborators(presentationId);
    
    // Lấy thông tin người dùng hiện tại
    const currentUserEmail = localStorage.getItem('user_email') || '';
    
    // Tìm người dùng trong danh sách
    const currentCollaborator = collaborators.find(c => c.email === currentUserEmail);
    
    if (!currentCollaborator) {
      // Người dùng không có quyền truy cập
      return {
        hasAccess: false,
        permission: null
      };
    }
    
    // Lấy thông tin quyền
    const permission = fakePermissions[currentCollaborator.permission] || fakePermissions.viewer;
    
    return {
      hasAccess: true,
      permissionLevel: currentCollaborator.permission,
      permissionDetails: permission,
      userInfo: {
        userId: currentCollaborator.userId,
        email: currentCollaborator.email,
        name: currentCollaborator.name,
        avatar: currentCollaborator.avatar
      }
    };
  };
  
  /**
   * Lấy danh sách bình luận cho một slide
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} slideId - ID slide
   * @returns {Promise<Array>} - Danh sách bình luận
   */
  export const getComments = async (presentationId, slideId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy từ localStorage
    const comments = JSON.parse(localStorage.getItem(`comments_${presentationId}_${slideId}`) || '[]');
    
    return comments;
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
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy thông tin người dùng hiện tại
    const currentUserEmail = localStorage.getItem('user_email') || 'user@example.com';
    const currentUserName = localStorage.getItem('user_name') || 'Người dùng';
    
    // Tạo bình luận mới
    const newComment = {
      id: `comment-${Date.now()}`,
      content,
      position,
      createdAt: Date.now(),
      author: {
        email: currentUserEmail,
        name: currentUserName,
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
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
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy thông tin người dùng hiện tại
    const currentUserEmail = localStorage.getItem('user_email') || 'user@example.com';
    const currentUserName = localStorage.getItem('user_name') || 'Người dùng';
    
    // Tạo phản hồi mới
    const newReply = {
      id: `reply-${Date.now()}`,
      content,
      createdAt: Date.now(),
      author: {
        email: currentUserEmail,
        name: currentUserName,
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
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
    comment.replies.push(newReply);
    
    // Lưu vào localStorage
    localStorage.setItem(`comments_${presentationId}_${slideId}`, JSON.stringify(comments));
    
    return newReply;
  };
  
  /**
   * Lấy danh sách các phiên bản của bài thuyết trình
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách phiên bản
   */
  export const getVersionHistory = async (presentationId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy từ localStorage
    const versions = JSON.parse(localStorage.getItem(`versions_${presentationId}`) || '[]');
    
    return versions;
  };
  
  /**
   * Thêm phiên bản mới vào lịch sử
   * @param {string} presentationId - ID bài thuyết trình
   * @param {Object} presentationData - Dữ liệu bài thuyết trình
   * @param {string} comment - Ghi chú về phiên bản
   * @returns {Promise<Object>} - Thông tin phiên bản mới
   */
  export const saveVersion = async (presentationId, presentationData, comment = '') => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy thông tin người dùng hiện tại
    const currentUserEmail = localStorage.getItem('user_email') || 'user@example.com';
    const currentUserName = localStorage.getItem('user_name') || 'Người dùng';
    
    // Tạo phiên bản mới
    const newVersion = {
      id: `version-${Date.now()}`,
      createdAt: Date.now(),
      comment: comment || `Phiên bản ${new Date().toLocaleString()}`,
      author: {
        email: currentUserEmail,
        name: currentUserName
      }
    };
    
    // Lấy danh sách phiên bản hiện tại
    const versions = JSON.parse(localStorage.getItem(`versions_${presentationId}`) || '[]');
    
    // Thêm phiên bản mới
    versions.push(newVersion);
    
    // Lưu vào localStorage
    localStorage.setItem(`versions_${presentationId}`, JSON.stringify(versions));
    
    // Lưu dữ liệu của phiên bản
    localStorage.setItem(`version_data_${presentationId}_${newVersion.id}`, JSON.stringify(presentationData));
    
    return newVersion;
  };
  
  /**
   * Khôi phục bài thuyết trình về một phiên bản cụ thể
   * @param {string} presentationId - ID bài thuyết trình
   * @param {string} versionId - ID phiên bản
   * @returns {Promise<Object>} - Dữ liệu bài thuyết trình của phiên bản
   */
  export const restoreVersion = async (presentationId, versionId) => {
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lấy dữ liệu của phiên bản
    const versionData = localStorage.getItem(`version_data_${presentationId}_${versionId}`);
    if (!versionData) {
      throw new Error('Không tìm thấy dữ liệu phiên bản');
    }
    
    return JSON.parse(versionData);
  };
  
  /**
   * Lấy thông tin người dùng đang trực tuyến
   * @param {string} presentationId - ID bài thuyết trình
   * @returns {Promise<Array>} - Danh sách người dùng đang trực tuyến
   */
  export const getOnlineUsers = async (presentationId) => {
    // Trong môi trường thực tế, đây sẽ là một kết nối WebSocket
    // Giả lập độ trễ API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Lấy danh sách người cộng tác
    const collaborators = await getCollaborators(presentationId);
    
    // Giả lập ngẫu nhiên một số người đang online
    return collaborators.map(user => ({
      ...user,
      isOnline: Math.random() > 0.5,
      lastActive: Date.now() - Math.floor(Math.random() * 3600000)
    }));
  };
  
  /**
   * Các quyền truy cập có sẵn
   */
  export const availablePermissions = [
    { label: 'Chủ sở hữu', value: 'owner', description: 'Có thể chỉnh sửa, chia sẻ và xóa' },
    { label: 'Biên tập viên', value: 'editor', description: 'Có thể chỉnh sửa nhưng không thể chia sẻ hoặc xóa' },
    { label: 'Người xem', value: 'viewer', description: 'Chỉ có thể xem' }
  ];