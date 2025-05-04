// src/components/Editor/SlidePreview.js
import React, { useState, useEffect, useRef } from 'react';
import { getTemplateById } from '../../utils/enhancedTemplates';
import { getLayoutComponent } from './SlideLayouts';

/**
 * Component hiển thị chế độ xem trước slide
 * @param {Object} props
 * @param {Array} props.slides - Danh sách slide cần xem
 * @param {number} props.currentSlideIndex - Index slide hiện tại
 * @param {Function} props.onNavigate - Callback khi điều hướng (chuyển slide)
 */
const SlidePreview = ({ slides = [], currentSlideIndex = 0, onNavigate }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(currentSlideIndex);
  const [timerId, setTimerId] = useState(null);
  
  const containerRef = useRef(null);
  
  // Đảm bảo slideIndex luôn được cập nhật khi currentSlideIndex thay đổi
  useEffect(() => {
    setSlideIndex(currentSlideIndex);
  }, [currentSlideIndex]);
  
  // Xử lý khi component bị hủy
  useEffect(() => {
    return () => {
      // Xóa timer nếu đang chạy
      if (timerId) {
        clearInterval(timerId);
      }
      
      // Thoát chế độ toàn màn hình nếu đang bật
      if (isFullscreen) {
        exitFullscreen();
      }
    };
  }, [timerId, isFullscreen]);
  
  /**
   * Chuyển đến slide trước
   */
  const goToPrevSlide = () => {
    if (slideIndex > 0) {
      const newIndex = slideIndex - 1;
      setSlideIndex(newIndex);
      
      if (onNavigate) {
        onNavigate(newIndex);
      }
    }
  };
  
  /**
   * Chuyển đến slide tiếp theo
   */
  const goToNextSlide = () => {
    if (slideIndex < slides.length - 1) {
      const newIndex = slideIndex + 1;
      setSlideIndex(newIndex);
      
      if (onNavigate) {
        onNavigate(newIndex);
      }
    } else if (isPlaying) {
      // Nếu đang ở chế độ trình chiếu tự động và đã ở slide cuối cùng,
      // dừng trình chiếu và quay về slide đầu tiên
      stopSlideshow();
      setSlideIndex(0);
      
      if (onNavigate) {
        onNavigate(0);
      }
    }
  };
  
  /**
   * Bắt đầu trình chiếu tự động
   */
  const startSlideshow = () => {
    // Không làm gì nếu đã ở chế độ trình chiếu
    if (isPlaying) return;
    
    // Bật chế độ trình chiếu
    setIsPlaying(true);
    
    // Chuyển sang chế độ toàn màn hình nếu chưa bật
    if (!isFullscreen) {
      enterFullscreen();
    }
    
    // Thiết lập timer để tự động chuyển slide sau mỗi 5 giây
    const id = setInterval(() => {
      goToNextSlide();
    }, 5000);
    
    setTimerId(id);
  };
  
  /**
   * Dừng trình chiếu tự động
   */
  const stopSlideshow = () => {
    // Không làm gì nếu không ở chế độ trình chiếu
    if (!isPlaying) return;
    
    // Tắt chế độ trình chiếu
    setIsPlaying(false);
    
    // Xóa timer
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  };
  
  /**
   * Vào chế độ toàn màn hình
   */
  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      
      setIsFullscreen(true);
    }
  };
  
  /**
   * Thoát chế độ toàn màn hình
   */
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    setIsFullscreen(false);
    
    // Dừng trình chiếu nếu đang bật
    if (isPlaying) {
      stopSlideshow();
    }
  };
  
  // Xử lý phím tắt
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevSlide();
          break;
        case 'ArrowRight':
          goToNextSlide();
          break;
        case 'f':
        case 'F':
          if (!isFullscreen) {
            enterFullscreen();
          } else {
            exitFullscreen();
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
        case ' ':
        case 'Spacebar':
          if (isPlaying) {
            stopSlideshow();
          } else {
            startSlideshow();
          }
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [slideIndex, isFullscreen, isPlaying]);
  
  // Lấy slide hiện tại
  const currentSlide = slides[slideIndex] || {};
  
  // Lấy thông tin template
  const template = getTemplateById(currentSlide.template);
  
  // Lấy component layout dựa trên loại slide
  const SlideLayout = getLayoutComponent(currentSlide.type || 'content');
  
  return (
    <div 
      ref={containerRef}
      className={`slide-preview-container d-flex flex-column ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ 
        height: '100%', 
        backgroundColor: isFullscreen ? '#000' : '#f8f9fa',
        padding: isFullscreen ? 0 : '20px',
        position: 'relative'
      }}
    >
      {/* Thanh điều khiển */}
      {!isFullscreen && (
        <div className="preview-controls mb-3 d-flex justify-content-between align-items-center">
          <div>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={goToPrevSlide}
              disabled={slideIndex === 0}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={goToNextSlide}
              disabled={slideIndex === slides.length - 1}
            >
              <i className="bi bi-arrow-right"></i>
            </button>
            <span className="mx-2">
              Slide {slideIndex + 1} / {slides.length}
            </span>
          </div>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={startSlideshow}
            >
              <i className="bi bi-play-fill me-1"></i>
              Trình chiếu
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={enterFullscreen}
            >
              <i className="bi bi-fullscreen"></i>
            </button>
          </div>
        </div>
      )}
      
      {/* Nội dung slide */}
      <div 
        className="slide-preview-content flex-grow-1 d-flex align-items-center justify-content-center"
      >
        <div 
          className="slide-preview-slide"
          style={{
            width: '960px',
            height: '540px',
            maxWidth: '100%',
            maxHeight: isFullscreen ? '90vh' : '70vh',
            backgroundColor: template?.colors?.background || '#ffffff',
            color: template?.colors?.text || '#333333',
            fontFamily: template?.fontFamily || 'Arial, sans-serif',
            boxShadow: isFullscreen ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <SlideLayout
            template={template}
            slide={currentSlide}
            onChange={() => {}} // No-op trong chế độ xem trước
          />
        </div>
      </div>
      
      {/* Điều khiển trong chế độ toàn màn hình */}
      {isFullscreen && (
        <div 
          className="fullscreen-controls position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white'
          }}
        >
          <div>
            <button
              className="btn btn-outline-light me-2"
              onClick={goToPrevSlide}
              disabled={slideIndex === 0}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <button
              className="btn btn-outline-light me-2"
              onClick={goToNextSlide}
              disabled={slideIndex === slides.length - 1}
            >
              <i className="bi bi-arrow-right"></i>
            </button>
            <span className="mx-2">
              Slide {slideIndex + 1} / {slides.length}
            </span>
          </div>
          <div>
            <button
              className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'} me-2`}
              onClick={isPlaying ? stopSlideshow : startSlideshow}
            >
              <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} me-1`}></i>
              {isPlaying ? 'Dừng' : 'Tiếp tục'}
            </button>
            <button
              className="btn btn-outline-light"
              onClick={exitFullscreen}
            >
              <i className="bi bi-fullscreen-exit"></i>
            </button>
          </div>
        </div>
      )}
      
      {/* Hướng dẫn phím tắt */}
      {isFullscreen && (
        <div 
          className="keyboard-shortcuts position-absolute top-0 end-0 m-3 p-2 rounded"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            fontSize: '0.8rem',
            opacity: 0.7
          }}
        >
          <div><i className="bi bi-arrow-left me-2"></i>Slide trước</div>
          <div><i className="bi bi-arrow-right me-2"></i>Slide tiếp theo</div>
          <div><i className="bi bi-fullscreen-exit me-2"></i>Thoát (ESC)</div>
          <div><i className="bi bi-play-fill me-2"></i>Trình chiếu (Space)</div>
        </div>
      )}
    </div>
  );
};

export default SlidePreview;