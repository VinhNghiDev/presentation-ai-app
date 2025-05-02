import React, { useState } from 'react';

const AIDialog = ({ show, onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('professional');
  const [slides, setSlides] = useState(5);

  const handleGenerate = () => {
    onGenerate({
      topic,
      style,
      slides
    });
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tạo bài thuyết trình với AI</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="aiTopic" className="form-label">Chủ đề bài thuyết trình</label>
              <input
                type="text"
                className="form-control"
                id="aiTopic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Chiến lược marketing 2025"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Phong cách</label>
              <select 
                className="form-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="professional">Chuyên nghiệp</option>
                <option value="creative">Sáng tạo</option>
                <option value="minimal">Tối giản</option>
                <option value="academic">Học thuật</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Số lượng slides</label>
              <input
                type="range"
                className="form-range"
                min="3"
                max="15"
                value={slides}
                onChange={(e) => setSlides(parseInt(e.target.value))}
              />
              <div className="text-center">{slides} slides</div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
            >
              Tạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDialog;