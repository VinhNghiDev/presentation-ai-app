import React, { useState } from 'react';
import { imageCategories, images } from '../../utils/imageLibrary';

const ImageLibrary = ({ onSelectImage, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);
    
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Thư viện hình ảnh</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <div className="btn-group w-100">
                <button 
                  className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Tất cả
                </button>
                {imageCategories.map(category => (
                  <button 
                    key={category.id}
                    className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="row g-3">
              {filteredImages.map(image => (
                <div className="col-md-3" key={image.id}>
                  <div 
                    className="border rounded p-1 text-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectImage(image)}
                  >
                    <img src={image.url} alt="" className="img-fluid" />
                  </div>
                </div>
              ))}
            </div>
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

export default ImageLibrary;