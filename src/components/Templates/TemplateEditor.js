import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import './TemplateEditor.css';
import TemplateThumbnail from './TemplateThumbnail';

const TemplateEditor = ({ template, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [currentTemplate, setCurrentTemplate] = useState(template || {});
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [slideContent, setSlideContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [imageLibrary, setImageLibrary] = useState([]);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState(null);
  const [slideHistory, setSlideHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Màu sắc có sẵn để tùy chỉnh template
  const availableColors = [
    { name: 'Indigo', value: '#4F46E5', textColor: 'white' },
    { name: 'Blue', value: '#0A66C2', textColor: 'white' },
    { name: 'Red', value: '#EF4444', textColor: 'white' },
    { name: 'Green', value: '#10B981', textColor: 'white' },
    { name: 'Purple', value: '#8B5CF6', textColor: 'white' },
    { name: 'Pink', value: '#EC4899', textColor: 'white' },
    { name: 'Yellow', value: '#F59E0B', textColor: 'black' },
    { name: 'Gray', value: '#4B5563', textColor: 'white' },
    { name: 'Black', value: '#111827', textColor: 'white' },
    { name: 'White', value: '#FFFFFF', textColor: 'black' },
    // Thêm màu sắc đa dạng hơn
    { name: 'Teal', value: '#0D9488', textColor: 'white' },
    { name: 'Orange', value: '#EA580C', textColor: 'white' },
    { name: 'Amber', value: '#D97706', textColor: 'black' },
    { name: 'Lime', value: '#65A30D', textColor: 'black' },
    { name: 'Emerald', value: '#059669', textColor: 'white' },
    { name: 'Cyan', value: '#0891B2', textColor: 'white' },
    { name: 'Sky', value: '#0284C7', textColor: 'white' },
    { name: 'Violet', value: '#7C3AED', textColor: 'white' },
    { name: 'Fuchsia', value: '#C026D3', textColor: 'white' },
    { name: 'Rose', value: '#E11D48', textColor: 'white' },
  ];

  // Các layout mẫu cho slide
  const slideLayouts = [
    { id: 'title', name: 'Trang bìa', icon: 'bi-type-h1' },
    { id: 'content', name: 'Nội dung', icon: 'bi-text-paragraph' },
    { id: 'image-text', name: 'Hình ảnh + Văn bản', icon: 'bi-image-text' },
    { id: 'quote', name: 'Trích dẫn', icon: 'bi-chat-quote' },
    { id: 'bullets', name: 'Danh sách', icon: 'bi-list-ul' },
    { id: 'two-column', name: 'Hai cột', icon: 'bi-layout-split' },
    { id: 'chart', name: 'Biểu đồ', icon: 'bi-bar-chart' },
    { id: 'comparison', name: 'So sánh', icon: 'bi-arrow-left-right' },
    { id: 'timeline', name: 'Timeline', icon: 'bi-arrow-right' },
    { id: 'image-gallery', name: 'Thư viện ảnh', icon: 'bi-images' },
    { id: 'stats', name: 'Thống kê', icon: 'bi-graph-up' },
  ];

  // Refs để sử dụng với các tính năng kéo thả
  const slideRefs = useRef([]);
  
  // Khởi tạo slides mặc định
  useEffect(() => {
    if (!template) {
      // Tạo mới slides mặc định
      const defaultSlides = [
        { id: 1, layout: 'title', title: 'Tiêu đề bài thuyết trình', subtitle: 'Phụ đề hoặc tên người thuyết trình' },
        { id: 2, layout: 'content', title: 'Giới thiệu', content: 'Nội dung giới thiệu về bài thuyết trình' },
        { id: 3, layout: 'bullets', title: 'Nội dung chính', bullets: ['Điểm chính 1', 'Điểm chính 2', 'Điểm chính 3'] },
        { id: 4, layout: 'image-text', title: 'Hình ảnh minh họa', content: 'Mô tả về hình ảnh', imageUrl: null },
        { id: 5, layout: 'quote', quote: 'Trích dẫn nổi bật', author: 'Tác giả' },
      ];
      setSlides(defaultSlides);
      // Khởi tạo lịch sử
      setSlideHistory([defaultSlides]);
      setHistoryIndex(0);
    } else {
      // Sử dụng slides từ template đã có
      setSlides(template.slides || []);
      // Khởi tạo lịch sử
      setSlideHistory([template.slides || []]);
      setHistoryIndex(0);
    }
    
    // Khởi tạo thư viện hình ảnh mẫu
    const sampleImageLibrary = [
      { id: 1, url: 'https://source.unsplash.com/random/800x600?business', thumbnail: 'https://source.unsplash.com/random/200x150?business', name: 'Business Image 1' },
      { id: 2, url: 'https://source.unsplash.com/random/800x600?nature', thumbnail: 'https://source.unsplash.com/random/200x150?nature', name: 'Nature Image 1' },
      { id: 3, url: 'https://source.unsplash.com/random/800x600?technology', thumbnail: 'https://source.unsplash.com/random/200x150?technology', name: 'Technology Image 1' },
      { id: 4, url: 'https://source.unsplash.com/random/800x600?people', thumbnail: 'https://source.unsplash.com/random/200x150?people', name: 'People Image 1' },
    ];
    
    setImageLibrary(sampleImageLibrary);
  }, [template]);

  // Theo dõi thay đổi slides để lưu vào lịch sử
  useEffect(() => {
    // Chỉ lưu lịch sử khi slides đã được khởi tạo
    if (slides.length > 0 && historyIndex >= 0) {
      // Nếu người dùng đã thực hiện một số thao tác hủy bỏ, cắt bỏ lịch sử từ vị trí hiện tại
      const newHistory = slideHistory.slice(0, historyIndex + 1);
      
      // Kiểm tra xem trạng thái hiện tại đã thay đổi so với phần tử cuối cùng trong lịch sử
      const lastHistoryState = newHistory[newHistory.length - 1];
      const isChanged = JSON.stringify(lastHistoryState) !== JSON.stringify(slides);
      
      if (isChanged) {
        // Chỉ thêm vào lịch sử nếu có thay đổi
        setSlideHistory([...newHistory, [...slides]]);
        setHistoryIndex(newHistory.length);
      }
    }
  }, [slides]);

  // Xử lý khi thay đổi màu sắc template
  const handleColorChange = (color) => {
    setCurrentTemplate({
      ...currentTemplate,
      color: color.value,
      textColor: color.textColor
    });
  };
  
  // Xử lý chức năng hoàn tác/làm lại
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSlides([...slideHistory[newIndex]]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < slideHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSlides([...slideHistory[newIndex]]);
    }
  };
  
  // Xử lý khi thêm slide mới
  const handleAddSlide = (layout) => {
    const newSlide = {
      id: Date.now(), // Sử dụng timestamp để tạo ID duy nhất
      layout: layout.id,
      title: 'Slide mới',
      content: '',
    };
    
    // Thêm thuộc tính đặc biệt dựa trên loại layout
    if (layout.id === 'bullets') {
      newSlide.bullets = ['Điểm 1', 'Điểm 2', 'Điểm 3'];
    } else if (layout.id === 'quote') {
      newSlide.quote = 'Trích dẫn';
      newSlide.author = 'Tác giả';
    } else if (layout.id === 'image-text' || layout.id === 'image-gallery') {
      newSlide.imageUrl = null;
      if (layout.id === 'image-gallery') {
        newSlide.gallery = [];
      }
    } else if (layout.id === 'two-column') {
      newSlide.leftContent = 'Nội dung cột trái';
      newSlide.rightContent = 'Nội dung cột phải';
    } else if (layout.id === 'chart') {
      newSlide.chartType = 'bar';
      newSlide.chartData = {
        labels: ['Mục 1', 'Mục 2', 'Mục 3'],
        datasets: [{
          data: [65, 59, 80],
          backgroundColor: ['#4F46E5', '#10B981', '#F59E0B']
        }]
      };
    } else if (layout.id === 'timeline') {
      newSlide.events = [
        { year: '2020', title: 'Sự kiện 1', description: 'Mô tả sự kiện 1' },
        { year: '2021', title: 'Sự kiện 2', description: 'Mô tả sự kiện 2' },
        { year: '2022', title: 'Sự kiện 3', description: 'Mô tả sự kiện 3' },
      ];
    } else if (layout.id === 'stats') {
      newSlide.stats = [
        { value: '75%', label: 'Thống kê 1' },
        { value: '2M+', label: 'Thống kê 2' },
        { value: '500K', label: 'Thống kê 3' },
      ];
    }
    
    // Thêm slide mới vào sau slide hiện tại
    const newIndex = currentSlide + 1;
    const newSlides = [
      ...slides.slice(0, newIndex),
      newSlide,
      ...slides.slice(newIndex)
    ];
    
    setSlides(newSlides);
    setCurrentSlide(newIndex);
  };

  // Xử lý khi xóa slide
  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) return; // Luôn giữ ít nhất 1 slide
    
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    
    // Điều chỉnh vị trí slide hiện tại sau khi xóa
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    } else if (currentSlide === index) {
      // Nếu xóa đúng slide đang xem, chuyển đến slide trước đó
      setCurrentSlide(Math.max(0, currentSlide - 1));
    }
  };

  // Xử lý khi di chuyển slide lên/xuống
  const handleMoveSlide = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }
    
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Hoán đổi vị trí
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    
    setSlides(newSlides);
    setCurrentSlide(targetIndex);
  };
  
  // Hàm xử lý kéo thả slide
  const handleDragSlide = (dragIndex, hoverIndex) => {
    // Tạo bản sao của mảng slides
    const draggedSlides = [...slides];
    
    // Lưu slide đang được kéo
    const draggedSlide = draggedSlides[dragIndex];
    
    // Xóa slide khỏi vị trí cũ
    draggedSlides.splice(dragIndex, 1);
    
    // Chèn slide vào vị trí mới
    draggedSlides.splice(hoverIndex, 0, draggedSlide);
    
    // Cập nhật state
    setSlides(draggedSlides);
    setCurrentSlide(hoverIndex);
  };

  // Xử lý khi cập nhật nội dung slide
  const handleUpdateSlide = (field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide] = {
      ...updatedSlides[currentSlide],
      [field]: value
    };
    setSlides(updatedSlides);
  };
  
  // Xử lý khi người dùng tải lên hình ảnh mới
  const handleImageUpload = (event, fieldName = 'imageUrl') => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        
        // Cập nhật slide hiện tại với hình ảnh mới
        handleUpdateSlide(fieldName, imageUrl);
        
        // Thêm hình ảnh vào thư viện
        const newImage = {
          id: Date.now(),
          url: imageUrl,
          thumbnail: imageUrl,
          name: file.name
        };
        
        setImageLibrary([newImage, ...imageLibrary]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Xử lý khi chọn hình ảnh từ thư viện
  const handleSelectImage = (image, fieldName = 'imageUrl') => {
    handleUpdateSlide(fieldName, image.url);
    setShowImageLibrary(false);
  };
  
  // Xử lý khi thêm hình ảnh vào gallery
  const handleAddToGallery = (image) => {
    const currentSlideData = slides[currentSlide];
    const updatedGallery = [...(currentSlideData.gallery || []), image.url];
    handleUpdateSlide('gallery', updatedGallery);
  };
  
  // Xử lý khi xóa hình ảnh khỏi gallery
  const handleRemoveFromGallery = (index) => {
    const currentSlideData = slides[currentSlide];
    const updatedGallery = currentSlideData.gallery.filter((_, i) => i !== index);
    handleUpdateSlide('gallery', updatedGallery);
  };

  // Xử lý khi lưu template
  const handleSave = () => {
    const savedTemplate = {
      ...currentTemplate,
      slides,
      lastModified: Date.now()
    };
    
    onSave(savedTemplate);
  };

  // Xử lý chuyển chế độ xem trước
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  // Xử lý khi đóng/mở sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Xử lý duplicate slide
  const handleDuplicateSlide = (index) => {
    const slideToClone = { ...slides[index] };
    // Tạo một ID mới cho bản sao
    slideToClone.id = Date.now();
    
    const newSlides = [
      ...slides.slice(0, index + 1),
      slideToClone,
      ...slides.slice(index + 1)
    ];
    
    setSlides(newSlides);
    setCurrentSlide(index + 1);
  };

  // Component cho từng slide có thể kéo thả
  const DraggableSlide = ({ slide, index, currentSlide, onSelect, onMoveUp, onMoveDown, onDelete, onDuplicate }) => {
    const ref = useRef(null);
    
    const [{ isDragging }, drag] = useDrag({
      type: 'SLIDE',
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    
    const [, drop] = useDrop({
      accept: 'SLIDE',
      hover(item, monitor) {
        if (!ref.current) return;
        
        const dragIndex = item.index;
        const hoverIndex = index;
        
        // Không thay thế các item vào chính nó
        if (dragIndex === hoverIndex) return;
        
        // Xác định vị trí trên màn hình của phần tử hover
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        
        // Lấy vị trí giữa theo chiều dọc
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        
        // Lấy vị trí con trỏ
        const clientOffset = monitor.getClientOffset();
        
        // Lấy vị trí của con trỏ so với đỉnh của phần tử
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        
        // Chỉ thực hiện di chuyển khi con trỏ đã đi qua nửa đối tượng mục tiêu
        // Khi kéo xuống, chỉ di chuyển khi con trỏ đã vượt qua 50% chiều cao của phần tử
        // Khi kéo lên, chỉ di chuyển khi con trỏ đã ở dưới 50% chiều cao của phần tử
        
        // Kéo xuống
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        
        // Kéo lên
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
        
        // Thời điểm này, thực hiện hành động di chuyển
        handleDragSlide(dragIndex, hoverIndex);
        
        // Lưu ý: chúng ta thay đổi item.index ở đây!
        // Điều này cần thiết để tránh nhảy lộn xộn nếu bạn kéo qua nhiều item
        item.index = hoverIndex;
      },
    });
    
    drag(drop(ref));
    
    const isActive = index === currentSlide;
    const slideStyle = {
      backgroundColor: isActive ? currentTemplate.color || '#4F46E5' : '#f3f4f6',
      color: isActive ? currentTemplate.textColor || 'white' : '#111827',
      opacity: isDragging ? 0.5 : 1,
    };
    
    return (
      <div 
        ref={ref}
        className={`slide-preview-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
        onClick={() => onSelect(index)}
      >
        <div className="slide-number">{index + 1}</div>
        <div className="slide-preview-content" style={slideStyle}>
          {slide.layout === 'title' && (
            <div className="slide-title">{slide.title || 'Tiêu đề chính'}</div>
          )}
          
          {slide.layout === 'bullets' && (
            <>
              <div className="slide-mini-title">{slide.title || 'Tiêu đề'}</div>
              <div className="slide-mini-bullets">
                {slide.bullets && slide.bullets.length > 0 ? (
                  <span>• {slide.bullets[0]}</span>
                ) : (
                  <span>• Điểm chính</span>
                )}
              </div>
            </>
          )}
          
          {slide.layout === 'quote' && (
            <div className="slide-mini-quote">"{slide.quote || 'Trích dẫn'}"</div>
          )}
          
          {slide.layout === 'image-text' && (
            <div className="slide-mini-image">
              <i className="bi bi-image"></i>
            </div>
          )}
          
          {(slide.layout === 'content' || !slide.layout) && (
            <>
              <div className="slide-mini-title">{slide.title || 'Tiêu đề'}</div>
              <div className="slide-mini-content">Nội dung</div>
            </>
          )}
          
          {slide.layout === 'two-column' && (
            <div className="slide-mini-columns">
              <div className="mini-column"></div>
              <div className="mini-column"></div>
            </div>
          )}
          
          {slide.layout === 'chart' && (
            <div className="slide-mini-chart">
              <i className="bi bi-bar-chart"></i>
            </div>
          )}
          
          {slide.layout === 'image-gallery' && (
            <div className="slide-mini-gallery">
              <i className="bi bi-images"></i>
            </div>
          )}
        </div>
        <div className="slide-actions">
          <button 
            className="btn-icon" 
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            disabled={index === 0}
            title="Di chuyển lên"
          >
            <i className="bi bi-arrow-up"></i>
          </button>
          <button 
            className="btn-icon" 
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            disabled={index === slides.length - 1}
            title="Di chuyển xuống"
          >
            <i className="bi bi-arrow-down"></i>
          </button>
          <button 
            className="btn-icon" 
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(index);
            }}
            title="Nhân bản"
          >
            <i className="bi bi-files"></i>
          </button>
          <button 
            className="btn-icon delete-slide" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            title="Xóa"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    );
  };

  // Render slide preview
  const renderSlidePreview = (slide, index) => {
    if (!slide) return null;
    
    return (
      <DraggableSlide
        slide={slide}
        index={index}
        currentSlide={currentSlide}
        onSelect={setCurrentSlide}
        onMoveUp={(idx) => handleMoveSlide(idx, 'up')}
        onMoveDown={(idx) => handleMoveSlide(idx, 'down')}
        onDelete={handleDeleteSlide}
        onDuplicate={handleDuplicateSlide}
      />
    );
  };
  
  // Render Image Library Panel
  const renderImageLibrary = () => {
    return (
      <div className={`image-library-panel ${showImageLibrary ? 'active' : ''}`}>
        <div className="panel-header">
          <h3>Thư viện ảnh</h3>
          <button className="btn-icon" onClick={() => setShowImageLibrary(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="panel-content">
          <div className="image-upload-section">
            <label className="custom-file-upload">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} />
              <i className="bi bi-cloud-upload"></i> Tải ảnh lên
            </label>
          </div>
          <div className="image-grid">
            {imageLibrary.map((image) => (
              <div key={image.id} className="image-item">
                <img src={image.thumbnail} alt={image.name} />
                <div className="image-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleSelectImage(image)}
                    title="Chọn ảnh"
                  >
                    <i className="bi bi-check-circle"></i>
                  </button>
                  {slides[currentSlide].layout === 'image-gallery' && (
                    <button 
                      className="btn-icon" 
                      onClick={() => handleAddToGallery(image)}
                      title="Thêm vào gallery"
                    >
                      <i className="bi bi-plus-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render full slide trong chế độ xem trước
  const renderFullSlidePreview = () => {
    const slide = slides[currentSlide];
    if (!slide) return null;
    
    const slideStyle = {
      backgroundColor: currentTemplate.color || '#4F46E5',
      color: currentTemplate.textColor || 'white'
    };
    
    switch (slide.layout) {
      case 'title':
        return (
          <div className="full-slide title-slide" style={slideStyle}>
            <h1>{slide.title || 'Tiêu đề bài thuyết trình'}</h1>
            <h3>{slide.subtitle || 'Phụ đề hoặc tên người thuyết trình'}</h3>
          </div>
        );
        
      case 'content':
        return (
          <div className="full-slide content-slide" style={slideStyle}>
            <h2>{slide.title || 'Tiêu đề slide'}</h2>
            <div className="slide-content">{slide.content || 'Nội dung slide'}</div>
          </div>
        );
        
      case 'bullets':
        return (
          <div className="full-slide bullets-slide" style={slideStyle}>
            <h2>{slide.title || 'Tiêu đề slide'}</h2>
            <ul className="bullet-list">
              {slide.bullets && slide.bullets.map((bullet, idx) => (
                <li key={idx}>{bullet || `Điểm ${idx + 1}`}</li>
              ))}
            </ul>
          </div>
        );
        
      case 'quote':
        return (
          <div className="full-slide quote-slide" style={slideStyle}>
            <div className="quote-content">"{slide.quote || 'Trích dẫn'}"</div>
            <div className="quote-author">— {slide.author || 'Tác giả'}</div>
          </div>
        );
        
      case 'image-text':
        return (
          <div className="full-slide image-text-slide" style={slideStyle}>
            <h2>{slide.title || 'Tiêu đề slide'}</h2>
            <div className="image-text-container">
              <div className="slide-image">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.title} />
                ) : (
                  <div className="image-placeholder">
                    <i className="bi bi-image"></i>
                  </div>
                )}
              </div>
              <div className="slide-text">
                {slide.content || 'Nội dung mô tả về hình ảnh'}
              </div>
            </div>
          </div>
        );
        
      case 'two-column':
        return (
          <div className="full-slide two-column-slide" style={slideStyle}>
            <h2>{slide.title || 'Tiêu đề slide'}</h2>
            <div className="columns-container">
              <div className="column left-column">
                {slide.leftContent || 'Nội dung cột trái'}
              </div>
              <div className="column right-column">
                {slide.rightContent || 'Nội dung cột phải'}
              </div>
            </div>
          </div>
        );
        
      case 'chart':
        return (
          <div className="full-slide chart-slide" style={slideStyle}>
            <h2>{slide.title || 'Tiêu đề slide'}</h2>
            <div className="chart-container">
              <div className="chart-placeholder">
                <i className="bi bi-bar-chart"></i>
                <span>Biểu đồ {slide.chartType || 'bar'}</span>
              </div>
            </div>
          </div>
        );
        
      case 'image-gallery':
        return (
          <div className="full-slide gallery-slide" style={slideStyle}>
            <h2>{slide.title || 'Thư viện ảnh'}</h2>
            <div className="gallery-container">
              {slide.gallery && slide.gallery.length > 0 ? (
                <div className="image-grid">
                  {slide.gallery.map((imageUrl, idx) => (
                    <div key={idx} className="gallery-item">
                      <img src={imageUrl} alt={`Ảnh ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-gallery">
                  <i className="bi bi-images"></i>
                  <p>Chưa có hình ảnh nào trong thư viện</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="full-slide timeline-slide" style={slideStyle}>
            <h2>{slide.title || 'Timeline'}</h2>
            <div className="timeline-container">
              {slide.events && slide.events.map((event, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-year">{event.year}</div>
                  <div className="timeline-content">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'stats':
        return (
          <div className="full-slide stats-slide" style={slideStyle}>
            <h2>{slide.title || 'Thống kê'}</h2>
            <div className="stats-container">
              {slide.stats && slide.stats.map((stat, idx) => (
                <div key={idx} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="full-slide default-slide" style={slideStyle}>
            <h2>{slide.title || 'Tiêu đề slide'}</h2>
            <div className="slide-content">{slide.content || 'Nội dung slide'}</div>
          </div>
        );
    }
  };

  // Render nội dung slide dựa trên layout
  const renderSlideEditor = () => {
    const slide = slides[currentSlide];
    if (!slide) return null;
    
    switch (slide.layout) {
      case 'title':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề chính"
              />
            </div>
            <div className="form-group">
              <label>Phụ đề</label>
              <input 
                type="text" 
                value={slide.subtitle || ''} 
                onChange={(e) => handleUpdateSlide('subtitle', e.target.value)} 
                className="form-control"
                placeholder="Nhập phụ đề hoặc tên người thuyết trình"
              />
            </div>
          </div>
        );
        
      case 'content':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề slide"
              />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea 
                value={slide.content || ''} 
                onChange={(e) => handleUpdateSlide('content', e.target.value)} 
                className="form-control"
                rows="6"
                placeholder="Nhập nội dung chính của slide"
              />
            </div>
          </div>
        );
        
      case 'bullets':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề slide"
              />
            </div>
            <div className="form-group">
              <label>Danh sách điểm chính</label>
              {slide.bullets && slide.bullets.map((bullet, idx) => (
                <div className="bullet-item" key={idx}>
                  <input 
                    type="text" 
                    value={bullet} 
                    onChange={(e) => {
                      const newBullets = [...slide.bullets];
                      newBullets[idx] = e.target.value;
                      handleUpdateSlide('bullets', newBullets);
                    }} 
                    className="form-control"
                    placeholder={`Điểm ${idx + 1}`}
                  />
                  <button 
                    className="btn-icon delete-bullet" 
                    onClick={() => {
                      const newBullets = slide.bullets.filter((_, i) => i !== idx);
                      handleUpdateSlide('bullets', newBullets);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  const newBullets = [...(slide.bullets || []), ''];
                  handleUpdateSlide('bullets', newBullets);
                }}
              >
                <i className="bi bi-plus"></i> Thêm điểm
              </button>
            </div>
          </div>
        );
        
      case 'quote':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Trích dẫn</label>
              <textarea 
                value={slide.quote || ''} 
                onChange={(e) => handleUpdateSlide('quote', e.target.value)} 
                className="form-control"
                rows="4"
                placeholder="Nhập nội dung trích dẫn"
              />
            </div>
            <div className="form-group">
              <label>Tác giả</label>
              <input 
                type="text" 
                value={slide.author || ''} 
                onChange={(e) => handleUpdateSlide('author', e.target.value)} 
                className="form-control"
                placeholder="Tên tác giả hoặc nguồn trích dẫn"
              />
            </div>
          </div>
        );
        
      case 'image-text':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề slide"
              />
            </div>
            <div className="form-group">
              <label>Hình ảnh</label>
              <div className="image-upload-container">
                {slide.imageUrl ? (
                  <div className="image-preview">
                    <img src={slide.imageUrl} alt="Preview" />
                    <button 
                      className="btn-icon remove-image" 
                      onClick={() => handleUpdateSlide('imageUrl', null)}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <i className="bi bi-image"></i>
                    <span>Chọn hình ảnh</span>
                    <div className="image-actions">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e)} 
                        id="image-upload-input"
                        className="file-input"
                      />
                      <label htmlFor="image-upload-input" className="btn btn-sm">
                        <i className="bi bi-upload"></i> Tải lên
                      </label>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => setShowImageLibrary(true)}
                      >
                        <i className="bi bi-images"></i> Thư viện
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea 
                value={slide.content || ''} 
                onChange={(e) => handleUpdateSlide('content', e.target.value)} 
                className="form-control"
                rows="4"
                placeholder="Nhập mô tả hoặc nội dung bổ sung"
              />
            </div>
          </div>
        );
        
      case 'two-column':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề slide"
              />
            </div>
            <div className="two-columns-editor">
              <div className="column-group">
                <label>Cột trái</label>
                <textarea 
                  value={slide.leftContent || ''} 
                  onChange={(e) => handleUpdateSlide('leftContent', e.target.value)} 
                  className="form-control"
                  rows="5"
                  placeholder="Nội dung cột trái"
                />
              </div>
              <div className="column-group">
                <label>Cột phải</label>
                <textarea 
                  value={slide.rightContent || ''} 
                  onChange={(e) => handleUpdateSlide('rightContent', e.target.value)} 
                  className="form-control"
                  rows="5"
                  placeholder="Nội dung cột phải"
                />
              </div>
            </div>
          </div>
        );
        
      case 'chart':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề slide"
              />
            </div>
            <div className="form-group">
              <label>Loại biểu đồ</label>
              <select 
                value={slide.chartType || 'bar'} 
                onChange={(e) => handleUpdateSlide('chartType', e.target.value)} 
                className="form-control"
              >
                <option value="bar">Cột (Bar)</option>
                <option value="line">Đường (Line)</option>
                <option value="pie">Tròn (Pie)</option>
                <option value="doughnut">Vòng (Doughnut)</option>
                <option value="area">Vùng (Area)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dữ liệu biểu đồ</label>
              <div className="chart-data-editor">
                {slide.chartData && slide.chartData.labels && slide.chartData.labels.map((label, idx) => (
                  <div className="chart-data-row" key={idx}>
                    <input 
                      type="text" 
                      value={label} 
                      onChange={(e) => {
                        const newChartData = {...slide.chartData};
                        newChartData.labels[idx] = e.target.value;
                        handleUpdateSlide('chartData', newChartData);
                      }} 
                      className="form-control"
                      placeholder={`Nhãn ${idx + 1}`}
                    />
                    <input 
                      type="number" 
                      value={slide.chartData.datasets[0].data[idx]} 
                      onChange={(e) => {
                        const newChartData = {...slide.chartData};
                        newChartData.datasets[0].data[idx] = parseInt(e.target.value || 0, 10);
                        handleUpdateSlide('chartData', newChartData);
                      }} 
                      className="form-control"
                      placeholder="Giá trị"
                    />
                    <button 
                      className="btn-icon" 
                      onClick={() => {
                        const newChartData = {...slide.chartData};
                        newChartData.labels = newChartData.labels.filter((_, i) => i !== idx);
                        newChartData.datasets[0].data = newChartData.datasets[0].data.filter((_, i) => i !== idx);
                        handleUpdateSlide('chartData', newChartData);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    const newChartData = {...(slide.chartData || {
                      labels: [],
                      datasets: [{
                        data: [],
                        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B']
                      }]
                    })};
                    newChartData.labels.push(`Mục ${newChartData.labels.length + 1}`);
                    newChartData.datasets[0].data.push(0);
                    handleUpdateSlide('chartData', newChartData);
                  }}
                >
                  <i className="bi bi-plus"></i> Thêm dữ liệu
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'image-gallery':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề gallery"
              />
            </div>
            <div className="form-group">
              <label>Thư viện hình ảnh</label>
              <button 
                className="btn btn-primary gallery-button" 
                onClick={() => setShowImageLibrary(true)}
              >
                <i className="bi bi-images"></i> Thêm hình ảnh
              </button>
              
              {slide.gallery && slide.gallery.length > 0 ? (
                <div className="gallery-grid">
                  {slide.gallery.map((imageUrl, idx) => (
                    <div className="gallery-item" key={idx}>
                      <img src={imageUrl} alt={`Ảnh ${idx + 1}`} />
                      <button 
                        className="btn-icon remove-image" 
                        onClick={() => handleRemoveFromGallery(idx)}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-gallery-message">
                  <i className="bi bi-images"></i>
                  <p>Chưa có hình ảnh nào trong gallery</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề timeline"
              />
            </div>
            <div className="form-group">
              <label>Sự kiện</label>
              {slide.events && slide.events.map((event, idx) => (
                <div className="timeline-event-item" key={idx}>
                  <div className="event-header">
                    <h4>Sự kiện {idx + 1}</h4>
                    <button 
                      className="btn-icon" 
                      onClick={() => {
                        const newEvents = slide.events.filter((_, i) => i !== idx);
                        handleUpdateSlide('events', newEvents);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  <div className="event-fields">
                    <div className="form-group">
                      <label>Năm/thời gian</label>
                      <input 
                        type="text" 
                        value={event.year || ''} 
                        onChange={(e) => {
                          const newEvents = [...slide.events];
                          newEvents[idx] = {...newEvents[idx], year: e.target.value};
                          handleUpdateSlide('events', newEvents);
                        }} 
                        className="form-control"
                        placeholder="Năm hoặc thời gian"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tiêu đề</label>
                      <input 
                        type="text" 
                        value={event.title || ''} 
                        onChange={(e) => {
                          const newEvents = [...slide.events];
                          newEvents[idx] = {...newEvents[idx], title: e.target.value};
                          handleUpdateSlide('events', newEvents);
                        }} 
                        className="form-control"
                        placeholder="Tiêu đề sự kiện"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mô tả</label>
                      <textarea 
                        value={event.description || ''} 
                        onChange={(e) => {
                          const newEvents = [...slide.events];
                          newEvents[idx] = {...newEvents[idx], description: e.target.value};
                          handleUpdateSlide('events', newEvents);
                        }} 
                        className="form-control"
                        rows="2"
                        placeholder="Mô tả sự kiện"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  const newEvents = [...(slide.events || []), {
                    year: '',
                    title: '',
                    description: ''
                  }];
                  handleUpdateSlide('events', newEvents);
                }}
              >
                <i className="bi bi-plus"></i> Thêm sự kiện
              </button>
            </div>
          </div>
        );
        
      case 'stats':
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
                placeholder="Nhập tiêu đề slide"
              />
            </div>
            <div className="form-group">
              <label>Số liệu thống kê</label>
              <div className="stats-container">
                {slide.stats && slide.stats.map((stat, idx) => (
                  <div className="stat-item-editor" key={idx}>
                    <div className="stat-fields">
                      <input 
                        type="text" 
                        value={stat.value || ''} 
                        onChange={(e) => {
                          const newStats = [...slide.stats];
                          newStats[idx] = {...newStats[idx], value: e.target.value};
                          handleUpdateSlide('stats', newStats);
                        }} 
                        className="form-control"
                        placeholder="Giá trị (ví dụ: 75%)"
                      />
                      <input 
                        type="text" 
                        value={stat.label || ''} 
                        onChange={(e) => {
                          const newStats = [...slide.stats];
                          newStats[idx] = {...newStats[idx], label: e.target.value};
                          handleUpdateSlide('stats', newStats);
                        }} 
                        className="form-control"
                        placeholder="Mô tả"
                      />
                      <button 
                        className="btn-icon" 
                        onClick={() => {
                          const newStats = slide.stats.filter((_, i) => i !== idx);
                          handleUpdateSlide('stats', newStats);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    const newStats = [...(slide.stats || []), {
                      value: '',
                      label: ''
                    }];
                    handleUpdateSlide('stats', newStats);
                  }}
                >
                  <i className="bi bi-plus"></i> Thêm thống kê
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="slide-editor-content">
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={slide.title || ''} 
                onChange={(e) => handleUpdateSlide('title', e.target.value)} 
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea 
                value={slide.content || ''} 
                onChange={(e) => handleUpdateSlide('content', e.target.value)} 
                className="form-control"
                rows="6"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`template-editor ${showSidebar ? '' : 'sidebar-collapsed'}`}>
        {/* Sidebar */}
        <div className={`editor-sidebar ${showSidebar ? 'expanded' : 'collapsed'}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`bi ${showSidebar ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </div>
          
          <div className="template-preview">
            <h3>Template</h3>
            <div className="template-thumbnail-container">
              {currentTemplate.id && (
                <TemplateThumbnail 
                  template={{
                    ...currentTemplate,
                    color: currentTemplate.color || '#4F46E5',
                    textColor: currentTemplate.textColor || 'white'
                  }} 
                  size="medium" 
                />
              )}
            </div>
            <div className="color-selector">
              <h4>Màu chủ đạo</h4>
              <div className="color-palette">
                {availableColors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`color-option ${currentTemplate.color === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="slides-manager">
            <h3>Slides</h3>
            <div className="slides-list">
              {slides.map((slide, index) => renderSlidePreview(slide, index))}
            </div>
            <div className="slide-layouts">
              <h4>Thêm slide mới</h4>
              <div className="layouts-grid">
                {slideLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className="layout-option"
                    onClick={() => handleAddSlide(layout)}
                    title={layout.name}
                  >
                    <i className={`bi ${layout.icon}`}></i>
                    <span>{layout.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="editor-main">
          <div className="editor-toolbar">
            <div className="toolbar-section">
              <button className="btn btn-primary" onClick={handleSave}>
                <i className="bi bi-save"></i> Lưu
              </button>
              <button className="btn btn-outline" onClick={onCancel}>
                <i className="bi bi-x"></i> Hủy
              </button>
            </div>
            <div className="toolbar-section">
              <div className="toolbar-buttons">
                <button 
                  className="btn btn-icon" 
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Hoàn tác"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
                <button 
                  className="btn btn-icon" 
                  onClick={handleRedo}
                  disabled={historyIndex >= slideHistory.length - 1}
                  title="Làm lại"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <button 
                  className={`btn ${previewMode ? 'btn-primary' : 'btn-outline'}`} 
                  onClick={togglePreview}
                >
                  <i className={`bi ${previewMode ? 'bi-pencil' : 'bi-eye'}`}></i>
                  {previewMode ? ' Chỉnh sửa' : ' Xem trước'}
                </button>
              </div>
            </div>
            <div className="toolbar-section">
              <div className="slide-navigation">
                <button 
                  className="btn-icon" 
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span>{currentSlide + 1} / {slides.length}</span>
                <button 
                  className="btn-icon" 
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="editor-content">
            {previewMode ? (
              <div className="preview-container">
                {renderFullSlidePreview()}
                <div className="preview-controls">
                  <button 
                    className="btn btn-outline preview-btn"
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                  >
                    <i className="bi bi-chevron-left"></i> Trước
                  </button>
                  <span className="slide-counter">{currentSlide + 1} / {slides.length}</span>
                  <button 
                    className="btn btn-outline preview-btn"
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                  >
                    Tiếp <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="slide-editor">
                <div className="slide-editor-header">
                  <h3>
                    <span className="slide-number">{currentSlide + 1}</span>
                    <span className="slide-type">{slides[currentSlide]?.layout || 'Content'}</span>
                  </h3>
                  <div className="slide-actions-menu">
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => handleDuplicateSlide(currentSlide)}
                    >
                      <i className="bi bi-files"></i> Nhân bản
                    </button>
                  </div>
                </div>
                {renderSlideEditor()}
              </div>
            )}
          </div>
        </div>
        
        {/* Thư viện hình ảnh */}
        {showImageLibrary && renderImageLibrary()}
      </div>
    </DndProvider>
  );
};

export default TemplateEditor; 