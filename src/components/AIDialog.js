import React, { useState, useRef } from 'react';
import { enhanceSlideContent } from '../services/openaiService';
import '../styles/AIDialog.css';

const AIDialog = ({ isOpen, onClose, content = '', onEnhance, type = 'content' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementType, setEnhancementType] = useState(type);
  const [contentToEnhance, setContentToEnhance] = useState(content);
  const [error, setError] = useState('');
  const [processStatus, setProcessStatus] = useState('');
  const textareaRef = useRef(null);

  // Xử lý khi dialog mở
  React.useEffect(() => {
    if (isOpen) {
      setContentToEnhance(content);
      setEnhancementType(type);
      setError('');
      setProcessStatus('');
      
      // Focus vào textarea khi dialog mở
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, content, type]);

  // Xử lý nâng cao nội dung
  const handleEnhance = async () => {
    if (!contentToEnhance.trim()) {
      setError('Vui lòng nhập nội dung cần nâng cao');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      setProcessStatus('Đang xử lý...');

      // Gọi API để nâng cao nội dung
      const enhancedContent = await enhanceSlideContent(contentToEnhance);
      
      if (enhancedContent) {
        // Gọi callback để trả về nội dung đã được nâng cao
        onEnhance(enhancedContent);
        onClose();
      } else {
        throw new Error('Không nhận được nội dung nâng cao hợp lệ');
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      setError(error.message || 'Có lỗi xảy ra khi nâng cao nội dung');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Nếu dialog không mở, không render gì cả
  if (!isOpen) return null;

  return (
    <div className="ai-dialog-overlay">
      <div className="ai-dialog">
        <div className="ai-dialog-header">
          <h2>Nâng cao nội dung bằng AI</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ai-dialog-content">
          <div className="form-group">
            <label htmlFor="enhancement-type">Chọn kiểu nâng cao</label>
            <select 
              id="enhancement-type" 
              value={enhancementType}
              onChange={(e) => setEnhancementType(e.target.value)}
              disabled={isProcessing}
            >
              <option value="improve">Cải thiện tổng thể</option>
              <option value="concise">Làm súc tích</option>
              <option value="elaborate">Bổ sung chi tiết</option>
              <option value="professional">Phong cách chuyên nghiệp</option>
              <option value="creative">Phong cách sáng tạo</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="content-to-enhance">Nội dung cần nâng cao</label>
            <textarea 
              id="content-to-enhance" 
              ref={textareaRef}
              value={contentToEnhance}
              onChange={(e) => setContentToEnhance(e.target.value)}
              disabled={isProcessing}
              rows={8}
              placeholder="Nhập nội dung cần nâng cao..."
            ></textarea>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {processStatus && <div className="status-message">{processStatus}</div>}
          
          <div className="ai-dialog-actions">
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Hủy
            </button>
            <button 
              className="enhance-button" 
              onClick={handleEnhance}
              disabled={isProcessing || !contentToEnhance.trim()}
            >
              {isProcessing ? 'Đang xử lý...' : 'Nâng cao nội dung'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDialog;