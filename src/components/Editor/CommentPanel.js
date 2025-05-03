// src/components/Editor/CommentPanel.js
import React, { useState, useEffect } from 'react';
import { getComments, addComment, addReply } from '../../services/collaborationService';

/**
 * Component hiển thị và quản lý bình luận cho slide
 * @param {Object} props - Props component
 * @param {string} props.presentationId - ID bài thuyết trình
 * @param {string} props.slideId - ID slide
 * @param {boolean} props.isOpen - Trạng thái mở của panel
 * @param {function} props.onClose - Callback khi đóng panel
 */
const CommentPanel = ({ presentationId, slideId, isOpen, onClose }) => {
  // State
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingReply, setIsAddingReply] = useState({});
  
  // Tải bình luận khi component được tạo hoặc khi slideId thay đổi
  useEffect(() => {
    if (isOpen && slideId) {
      loadComments();
    }
  }, [isOpen, slideId]);
  
  /**
   * Tải danh sách bình luận
   */
  const loadComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const commentsData = await getComments(presentationId, slideId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Không thể tải bình luận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Xử lý khi thêm bình luận mới
   * @param {Object} e - Event
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsAddingComment(true);
    setError('');
    
    try {
      await addComment(presentationId, slideId, newComment);
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Không thể thêm bình luận.');
    } finally {
      setIsAddingComment(false);
    }
  };
  
  /**
   * Xử lý khi thêm phản hồi cho bình luận
   * @param {string} commentId - ID bình luận
   */
  const handleAddReply = async (commentId) => {
    const content = replyContent[commentId];
    if (!content || !content.trim()) {
      return;
    }
    
    setIsAddingReply({
      ...isAddingReply,
      [commentId]: true
    });
    setError('');
    
    try {
      await addReply(presentationId, slideId, commentId, content);
      setReplyContent({
        ...replyContent,
        [commentId]: ''
      });
      loadComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      setError(error.message || 'Không thể thêm phản hồi.');
    } finally {
      setIsAddingReply({
        ...isAddingReply,
        [commentId]: false
      });
    }
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
  
  // Nếu panel đóng, không hiển thị gì
  if (!isOpen) {
    return null;
  }
  
  return (
    <div 
      className="comment-panel card"
      style={{
        position: 'absolute',
        right: '20px',
        top: '80px',
        width: '300px',
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}
    >
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Bình luận</h6>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
        ></button>
      </div>
      
      <div 
        className="card-body"
        style={{
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 300px)'
        }}
      >
        {/* Thông báo lỗi */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 small">Đang tải bình luận...</p>
          </div>
        )}
        
        {/* Danh sách bình luận */}
        {!loading && comments.length === 0 && (
          <p className="text-center text-muted my-4">
            Chưa có bình luận nào.
          </p>
        )}
        
        {comments.map(comment => (
          <div key={comment.id} className="comment mb-3">
            <div className="d-flex mb-2">
              <img 
                src={comment.author.avatar} 
                alt={comment.author.name} 
                className="rounded-circle me-2"
                width="32"
                height="32"
              />
              <div className="comment-content p-2 rounded bg-light w-100">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="fw-bold small">{comment.author.name}</div>
                  <small className="text-muted">{formatTime(comment.createdAt)}</small>
                </div>
                <div>{comment.content}</div>
              </div>
            </div>
            
            {/* Phản hồi */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="replies ms-4">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="reply d-flex mb-2">
                    <img 
                      src={reply.author.avatar} 
                      alt={reply.author.name} 
                      className="rounded-circle me-2"
                      width="24"
                      height="24"
                    />
                    <div className="reply-content p-2 rounded bg-light w-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="fw-bold small">{reply.author.name}</div>
                        <small className="text-muted">{formatTime(reply.createdAt)}</small>
                      </div>
                      <div className="small">{reply.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Form phản hồi */}
            <div className="reply-form ms-4">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Thêm phản hồi..."
                  value={replyContent[comment.id] || ''}
                  onChange={(e) => setReplyContent({
                    ...replyContent,
                    [comment.id]: e.target.value
                  })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddReply(comment.id);
                    }
                  }}
                />
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={() => handleAddReply(comment.id)}
                  disabled={isAddingReply[comment.id]}
                >
                  {isAddingReply[comment.id] ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-send"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card-footer">
        <form onSubmit={handleAddComment}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Thêm bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isAddingComment}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isAddingComment || !newComment.trim()}
            >
              {isAddingComment ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-send"></i>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentPanel;