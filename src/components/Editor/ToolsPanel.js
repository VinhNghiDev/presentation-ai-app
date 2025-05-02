import React from 'react';

const ToolsPanel = ({ onAddElement }) => {
  const tools = [
    { id: 'text', name: 'Văn bản', icon: 'bi-type' },
    { id: 'image', name: 'Hình ảnh', icon: 'bi-image' },
    { id: 'shape', name: 'Hình dạng', icon: 'bi-square' },
    { id: 'chart', name: 'Biểu đồ', icon: 'bi-bar-chart' },
    { id: 'table', name: 'Bảng', icon: 'bi-table' },
  ];

  return (
    <div className="bg-light p-3" style={{ width: "250px" }}>
      <h6 className="mb-3">Công cụ</h6>
      {tools.map(tool => (
        <button
          key={tool.id}
          className="btn btn-outline-secondary tool-button d-flex align-items-center mb-2 w-100"
          onClick={() => onAddElement(tool.id)}
        >
          <i className={`bi ${tool.icon} me-2`}></i>
          {tool.name}
        </button>
      ))}
      
      <hr />
      
      <h6 className="mb-3">Gợi ý AI</h6>
      <button className="btn btn-primary w-100 mb-2">
        <i className="bi bi-magic me-2"></i>
        Tạo nội dung
      </button>
      <button className="btn btn-primary w-100">
        <i className="bi bi-stars me-2"></i>
        Cải thiện slide
      </button>
    </div>
  );
};

export default ToolsPanel;