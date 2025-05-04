import React, { useState, useEffect } from 'react';
import { createShareableLink, shareViaEmail } from '../../utils/exportUtils';

/**
 * Component bảng quản lý chia sẻ bài thuyết trình
 * @param {Object} props - Props component
 * @param {string} props.presentationId - ID bài thuyết trình
 * @param {string} props.presentationTitle - Tiêu đề bài thuyết trình
 * @param {function} props.onClose - Callback khi đóng bảng
 */
const SharingPanel = ({ presentationId, presentationTitle, onClose }) => {
  // State
  const [activeTab, setActiveTab] = useState('link');
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [accessType, setAccessType] = useState('view');
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [newLink, setNewLink] = useState(null);
  
  // Tải danh sách link chia sẻ khi component được tạo
  useEffect(() => {
    loadShareLinks();
  }, [presentationId]);
  
  /**
   * Tải danh sách link chia sẻ từ localStorage
   */
  const loadShareLinks = () => {
    setLoading(true);
    setError('');
    
    try {
      // Lấy danh sách link từ localStorage
      const storedLinks = localStorage.getItem(`share_links_${presentationId}`);
      if (storedLinks) {
        const links = JSON.parse(storedLinks);
        
        // Lọc bỏ các link đã hết hạn
        const validLinks = links.filter(link => {
          return link.expiresAt === 0 || link.expiresAt > Date.now();
        });
        
        setShareLinks(validLinks);
      } else {
        setShareLinks([]);
      }
    } catch (error) {
      console.error('Error loading share links:', error);
      setError('Không thể tải danh sách link chia sẻ.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Xử lý khi tạo link chia sẻ mới
   */
  const handleCreateLink = async () => {
    setIsCreatingLink(true);
    setError('');
    setNewLink(null);
    
    try {
      const link = await createShareableLink(presentationId, accessType);
      setNewLink(link);
      loadShareLinks();
    } catch (error) {
      console.error('Error creating share link:', error);
      setError('Không thể tạo link chia sẻ. Vui lòng thử lại.');
    } finally {
      setIsCreatingLink(false);
    }
  };
  
  /**
   * Xử lý khi xóa link chia sẻ
   * @param {string} token - Token của link cần xóa
   */
  const handleDeleteLink = (token) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa link chia sẻ này?')) {
      return;
    }
    
    try {
      // Lọc bỏ link cần xóa
      const updatedLinks = shareLinks.filter(link => link.token !== token);
      
      // Lưu lại vào localStorage
      localStorage.setItem(`share_links_${presentationId}`, JSON.stringify(updatedLinks));
      
      // Cập nhật state
      setShareLinks(updatedLinks);
    } catch (error) {
      console.error('Error deleting share link:', error);
      setError('Không thể xóa link chia sẻ.');
    }
  };
  
  /**
   * Xử lý khi chia sẻ qua email
   * @param {Object} e - Event
   */
  const handleShareViaEmail = async (e) => {
    e.preventDefault();
    
    if (!emailAddress.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    
    setIsSendingEmail(true);
    setError('');
    
    try {
      const success = await shareViaEmail(emailAddress, presentationId, presentationTitle);
      
      if (success) {
        alert(`Đã gửi link chia sẻ tới ${emailAddress}`);
        setEmailAddress('');
        loadShareLinks();
      } else {
        setError('Không thể gửi email. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error sharing via email:', error);
      setError(error.message || 'Không thể gửi email.');
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  /**
   * Xử lý khi sao chép link vào clipboard
   * @param {string} url - URL cần sao chép
   */
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      })
      .catch(err => {
        console.error('Error copying link:', err);
        setError('Không thể sao chép link.');
      });
  };
  
  /**
   * Định dạng thời gian
   * @param {number} timestamp - Dấu thời gian
   * @returns {string} - Chuỗi thời gian định dạng
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Không hết hạn';
    
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };
  
  /**
   * Lấy loại quyền truy cập
   * @param {string} type - Loại quyền
   * @returns {string} - Tên quyền hiển thị
   */
  const getAccessTypeName = (type) => {
    switch (type) {
      case 'view':
        return 'Chỉ xem';
      case 'edit':
        return 'Chỉnh sửa';
      default:
        return type;
    }
  };
  
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chia sẻ bài thuyết trình</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Tab navigation */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'link' ? 'active' : ''}`}
                  onClick={() => setActiveTab('link')}
                >
                  <i className="bi bi-link-45deg me-1"></i> Link chia sẻ
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                  onClick={() => setActiveTab('email')}
                >
                  <i className="bi bi-envelope me-1"></i> Chia sẻ qua email
                </button>
              </li>
            </ul>
            
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {/* Hiển thị thông báo sao chép thành công */}
            {showCopiedMessage && (
              <div className="alert alert-success" role="alert">
                <i className="bi bi-clipboard-check me-2"></i>
                Đã sao chép link vào clipboard
              </div>
            )}
            
            {/* Tab link chia sẻ */}
            {activeTab === 'link' && (
              <div className="tab-pane active">
                {/* Tạo link mới */}
                <div className="card mb-3">
                  <div className="card-header">Tạo link chia sẻ mới</div>
                  <div className="card-body">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-6">
                        <label className="form-label">Quyền truy cập</label>
                        <select
                          className="form-select"
                          value={accessType}
                          onChange={(e) => setAccessType(e.target.value)}
                          disabled={isCreatingLink}
                        >
                          <option value="view">Chỉ xem</option>
                          <option value="edit">Chỉnh sửa</option>
                        </select>
                      </div>
                      <div className="col-md-6 d-flex align-items-end">
                        <button
                          className="btn btn-primary w-100"
                          onClick={handleCreateLink}
                          disabled={isCreatingLink}
                        >
                          {isCreatingLink ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-link-45deg me-1"></i>
                              Tạo link chia sẻ
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Hiển thị link mới tạo */}
                    {newLink && (
                      <div className="mt-3">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={newLink.url}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => handleCopyLink(newLink.url)}
                          >
                            <i className="bi bi-clipboard me-1"></i>
                            Sao chép
                          </button>
                        </div>
                        <small className="text-muted">
                          Hết hạn: {formatTime(newLink.expiresAt)} | 
                          Quyền: {getAccessTypeName(newLink.accessType)}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Danh sách link chia sẻ */}
                <div className="card">
                  <div className="card-header">Link chia sẻ hiện tại</div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải danh sách link...</p>
                      </div>
                    ) : shareLinks.length > 0 ? (
                      <div className="list-group">
                        {shareLinks.map((link, index) => (
                          <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <div>
                              <div className="d-flex align-items-center mb-1">
                                <i className="bi bi-link-45deg me-2 text-primary"></i>
                                <span className="text-truncate" style={{ maxWidth: '400px' }}>
                                  {link.url}
                                </span>
                              </div>
                              <small className="text-muted">
                                Hết hạn: {formatTime(link.expiresAt)} | 
                                Quyền: {getAccessTypeName(link.accessType)}
                              </small>
                            </div>
                            <div>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleCopyLink(link.url)}
                              >
                                <i className="bi bi-clipboard"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteLink(link.token)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Chưa có link chia sẻ nào. Hãy tạo link chia sẻ mới.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab chia sẻ qua email */}
            {activeTab === 'email' && (
              <div className="tab-pane active">
                <div className="card">
                  <div className="card-header">Chia sẻ qua email</div>
                  <div className="card-body">
                    <form onSubmit={handleShareViaEmail}>
                      <div className="mb-3">
                        <label htmlFor="emailAddress" className="form-label">Địa chỉ email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="emailAddress"
                          placeholder="example@domain.com"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Quyền truy cập</label>
                        <select
                          className="form-select"
                          value={accessType}
                          onChange={(e) => setAccessType(e.target.value)}
                          disabled={isSendingEmail}
                        >
                          <option value="view">Chỉ xem</option>
                          <option value="edit">Chỉnh sửa</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSendingEmail}
                      >
                        {isSendingEmail ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope me-1"></i>
                            Gửi email
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingPanel; 