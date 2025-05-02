// src/components/Editor/TemplateSelector.js
import React from 'react';
import { slideTemplates } from '../../utils/templates';

const TemplateSelector = ({ onSelectTemplate }) => {
  return (
    <div className="mt-4">
      <h6 className="mb-3">Mẫu thiết kế</h6>
      <div className="row g-2">
        {slideTemplates.map(template => (
          <div className="col-6" key={template.id}>
            <div 
              className="p-2 border rounded text-center"
              style={{ 
                backgroundColor: template.background, 
                color: template.textColor,
                cursor: 'pointer'
              }}
              onClick={() => onSelectTemplate(template)}
            >
              <div 
                className="py-1 mb-1 rounded" 
                style={{ backgroundColor: template.headerColor, color: '#fff' }}
              >
                Header
              </div>
              <small style={{ fontFamily: template.fontFamily }}>
                {template.name}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;