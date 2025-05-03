// src/components/Collaboration/CollaborationPanel.js
import React, { useState, useEffect } from 'react';
import { 
  getCollaborators, 
  addCollaborator, 
  updateCollaboratorPermission, 
  removeCollaborator, 
  createShareLink,
  getShareLinks,
  deleteShareLink,
  availablePermissions
} from '../../services/collaborationService';

/**
 * Component bảng quản lý cộng tác và chia sẻ
 * @param {Object} props - Props component
 * @param {string} props.presentationId - ID bài thuyết trình
 * @param {function} props.onClose - Callback khi đóng bảng
 */
const CollaborationPanel = ({ presentationId, onClose }) => {
  // State
  const [activeTab, setActiveTab] = useState('collaborators');
  const [collaborators, setCollaborators] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorPermission, setNewCollaboratorPermission] = useState('editor');
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [shareLinkPermission, setShareLinkPermission] = useState('viewer');
  const [shareLinkExpiration, setShareLinkExpiration] = useState('never');
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  // Tải dữ liệu khi component được tạo
  useEffect(() => {
    loadData();
  }, [presentationId]);
  
  // Tải lại dữ liệu khi chuyển tab
  useEffect(() => {
    if (activeTab === 'collaborators') {
      loadCollaborators();
    } else if (activeTab === 'share') {
      loadShareLinks();
    }
  }, [activeTab]);
  
  /**
   * Tải dữ liệu cho cả hai tab
   */
  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Tải danh sách người cộng tác
      const collaboratorsData = await getCollaborators(presentationId);
      setCollaborators(collaboratorsData);
      
      // Tải danh sách link chia sẻ
      const shareLinksData = await getShareLinks(presentationId);
      setShareLinks(shareLinksData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Tải danh sách người cộng tác
   */
  const loadCollaborators = async () => {
    setLoading(true);
    setError('');
    
    try {
      const collaboratorsData = await getCollaborators(presentationId);
      setCollaborators(collaboratorsData);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setError('Không thể tải danh sách người cộng tác.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Tải danh sách link chia sẻ
   */
  const loadShareLinks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const shareLinksData = await getShareLinks(presentationId);
      setShareLinks(shareLinksData);
    } catch (error) {
      console.error('Error loading share links:', error);
      setError('Không thể tải danh sách link chia sẻ.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Xử lý khi thêm người cộng tác
   * @param {Object} e - Event
   */
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    
    if (!newCollaboratorEmail.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    
    setIsAddingCollaborator(true);
    setError('');
    
    try {
      // Thêm người cộng tác mới
      const success = await addCollaborator(presentationId, newCollaboratorEmail, newCollaboratorPermission);
      
      if (success) {
        // Xóa form và tải lại danh sách
        setNewCollaboratorEmail('');
        loadCollaborators();
      } else {
        setError('Không thể thêm người cộng tác. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      setError(error.message || 'Không thể thêm người cộng tác.');
    } finally {
      setIsAddingCollaborator(false);
    }
  };
  
  /**
   * Xử lý khi thay đổi quyền của người cộng tác
   * @param {string} userId - ID người dùng
   * @param {string} permission - Quyền mới
   */
  const handleUpdatePermission = async (userId, permission) => {
    setLoading(true);
    setError('');
    
    try {
      const success = await updateCollaboratorPermission(presentationId, userId, permission);
      
      if (success) {
        loadCollaborators();
      } else {
        setError('Không thể cập nhật quyền. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      setError(error.message || 'Không thể cập nhật quyền.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Xử lý khi xóa người cộng tác
   * @param {string} userId - ID người dùng
   */
  const handleRemoveCollaborator = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người cộng tác này?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await removeCollaborator(presentationId, userId);
      
      if (success) {
        loadCollaborators();
      } else {
        setError('Không thể xóa người cộng tác. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError(error.message || 'Không thể xóa người cộng tác.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Xử lý khi tạo link chia sẻ mới
   */
  const handleCreateShareLink = async () => {
    setIsCreatingShareLink(true);
    setError('');
    
    try {
      // Tính số giây cho thời gian hết hạn
      let expiresIn = 0; // Không hết hạn
      
      if (shareLinkExpiration === '1day') {
        expiresIn = 86400; // 1 ngày
      } else if (shareLinkExpiration === '7days') {
        expiresIn = 604800; // 7 ngày
      } else if (shareLinkExpiration === '30days') {
        expiresIn = 2592000; // 30 ngày
      }
      
      // Tạo link chia sẻ
      await createShareLink(presentationId, shareLinkPermission, expiresIn);
      
      // Tải lại danh sách
      loadShareLinks();
    } catch (error) {
      console.error('Error creating share link:', error);
      setError(error.message || 'Không thể tạo link chia sẻ.');
    } finally {
      setIsCreatingShareLink(false);
    }
  };
  
  /**
   * Xử lý khi xóa link chia sẻ
   * @param {string} token - Token của link
   */
  const handleDeleteShareLink = async (token) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa link chia sẻ này?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await deleteShareLink(presentationId, token);
      
      if (success) {
        loadShareLinks();
      } else {
        setError('Không thể xóa link chia sẻ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error deleting share link:', error);
      setError(error.message || 'Không thể xóa link chia sẻ.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Xử lý khi sao chép link chia sẻ
   * @param {string} url - URL cần sao chép
   */
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      })
      .catch(err => {
        console.error('Không thể sao chép link:', err);
      });
  };
  
  /**
   * Format thời gian cho dễ đọc
   * @param {number} timestamp - Thời gian dạng timestamp
   * @returns {string} - Chuỗi thời gian đã định dạng
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  /**
   * Format thời gian hết hạn cho dễ đọc
   * @param {number} timestamp - Thời gian dạng timestamp
   * @returns {string} - Chuỗi thời gian đã định dạng
   */
  const formatExpiration = (timestamp) => {
    if (!timestamp) {
      return 'Không hết hạn';
    }
    
    const now = Date.now();
    if (timestamp < now) {
      return 'Đã hết hạn';
    }
    
    const date = new Date(timestamp);
    return `Hết hạn vào ${date.toLocaleString()}`;
  };
  
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Quản lý cộng tác & chia sẻ</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'collaborators' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('collaborators')}
                >
                  <i className="bi bi-people me-1"></i>
                  Người cộng tác
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'share' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('share')}
                >
                  <i className="bi bi-share me-1"></i>
                  Chia sẻ
                </button>
              </li>
            </ul>
            
            {/* Thông báo lỗi */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {/* Thông báo đã sao chép */}
            {showCopiedMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                Đã sao chép link vào bộ nhớ tạm!
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCopiedMessage(false)}
                ></button>
              </div>
            )}
            
            {/* Tab người cộng tác */}
            {activeTab === 'collaborators' && (
              <div>
                <form 
                  className="mb-4 p-3 border rounded bg-light" 
                  onSubmit={handleAddCollaborator}
                >
                  <div className="row g-2">
                    <div className="col-md-5">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Nhập email"
                        value={newCollaboratorEmail}
                        onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={newCollaboratorPermission}
                        onChange={(e) => setNewCollaboratorPermission(e.target.value)}
                      >
                        {availablePermissions.filter(p => p.value !== 'owner').map(permission => (
                          <option key={permission.value} value={permission.value}>
                            {permission.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={isAddingCollaborator}
                      >
                        {isAddingCollaborator ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang thêm...
                          </span>
                        ) : (
                          <span>
                            <i className="bi bi-plus-lg me-1"></i>
                            Thêm
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                
                {loading && collaborators.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải danh sách người cộng tác...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}></th>
                          <th>Người dùng</th>
                          <th>Quyền truy cập</th>
                          <th style={{ width: '100px' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collaborators.map(collaborator => (
                          <tr key={collaborator.userId}>
                            <td>
                              <img 
                                src={collaborator.avatar} 
                                alt={collaborator.name} 
                                className="rounded-circle"
                                width="40"
                                height="40"
                              />
                            </td>
                            <td>
                              <div className="fw-bold">{collaborator.name}</div>
                              <div className="text-muted small">{collaborator.email}</div>
                            </td>
                            <td>
                              {collaborator.permission === 'owner' ? (
                                <span className="badge bg-primary">Chủ sở hữu</span>
                              ) : (
                                <select
                                  className="form-select form-select-sm"
                                  value={collaborator.permission}
                                  onChange={(e) => handleUpdatePermission(collaborator.userId, e.target.value)}
                                  disabled={loading}
                                >
                                  {availablePermissions.filter(p => p.value !== 'owner').map(permission => (
                                    <option key={permission.value} value={permission.value}>
                                      {permission.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td>
                              {collaborator.permission !== 'owner' && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveCollaborator(collaborator.userId)}
                                  disabled={loading}
                                  title="Xóa người cộng tác"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        {collaborators.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              Chưa có người cộng tác nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Tab chia sẻ */}
            {activeTab === 'share' && (
              <div>
                <div className="mb-4 p-3 border rounded bg-light">
                  <div className="row g-2">
                    <div className="col-md-5">
                      <select
                        className="form-select"
                        value={shareLinkPermission}
                        onChange={(e) => setShareLinkPermission(e.target.value)}
                        disabled={isCreatingShareLink}
                      >
                        <option value="viewer">Chỉ xem</option>
                        <option value="editor">Chỉnh sửa</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={shareLinkExpiration}
                        onChange={(e) => setShareLinkExpiration(e.target.value)}
                        disabled={isCreatingShareLink}
                      >
                        <option value="never">Không hết hạn</option>
                        <option value="1day">1 ngày</option>
                        <option value="7days">7 ngày</option>
                        <option value="30days">30 ngày</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button 
                        className="btn btn-primary w-100"
                        onClick={handleCreateShareLink}
                        disabled={isCreatingShareLink}
                      >
                        {isCreatingShareLink ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang tạo...
                          </span>
                        ) : (
                          <span>
                            <i className="bi bi-link-45deg me-1"></i>
                            Tạo link chia sẻ
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {loading && shareLinks.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải danh sách link chia sẻ...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Link chia sẻ</th>
                          <th>Quyền truy cập</th>
                          <th>Hết hạn</th>
                          <th style={{ width: '150px' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shareLinks.map(link => (
                          <tr key={link.token}>
                            <td className="text-truncate" style={{ maxWidth: '300px' }}>
                              <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                            </td>
                            <td>
                              {link.permission === 'editor' ? (
                                <span className="badge bg-success">Chỉnh sửa</span>
                              ) : (
                                <span className="badge bg-info">Chỉ xem</span>
                              )}
                            </td>
                            <td>
                              {formatExpiration(link.expiresAt)}
                            </td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleCopyLink(link.url)}
                                  title="Sao chép link"
                                >
                                  <i className="bi bi-clipboard"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteShareLink(link.token)}
                                  disabled={loading}
                                  title="Xóa link chia sẻ"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        
                        {shareLinks.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              Chưa có link chia sẻ nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;