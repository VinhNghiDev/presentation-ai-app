// src/components/Editor/SlideLayouts/index.js
import React from 'react';

// Import các component layout
const TitleSlide = React.lazy(() => import('./TitleSlide'));
const ContentSlide = React.lazy(() => import('./ContentSlide'));
const ImageContentSlide = React.lazy(() => import('./ImageContentSlide'));
const QuoteSlide = React.lazy(() => import('./QuoteSlide'));
const ComparisonSlide = React.lazy(() => import('./ComparisonSlide'));
const DataSlide = React.lazy(() => import('./DataSlide'));
const ThankYouSlide = React.lazy(() => import('./ThankYouSlide'));

// Fallback component khi đang tải
const LoadingComponent = () => (
  <div className="p-4 text-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Đang tải...</span>
    </div>
    <p className="mt-2">Đang tải layout...</p>
  </div>
);

// Export các component riêng lẻ
export {
  TitleSlide,
  ContentSlide,
  ImageContentSlide,
  QuoteSlide,
  ComparisonSlide,
  DataSlide,
  ThankYouSlide
};

// Map các loại slide với component tương ứng
export const LAYOUTS = {
  'title': TitleSlide,
  'content': ContentSlide,
  'image-content': ImageContentSlide,
  'quote': QuoteSlide,
  'comparison': ComparisonSlide,
  'data': DataSlide,
  'thank-you': ThankYouSlide
};

/**
 * Lấy component layout dựa theo loại
 * @param {string} type - Loại layout
 * @returns {React.ComponentType} - Component tương ứng
 */
export const getLayoutComponent = (type) => {
  const Layout = LAYOUTS[type] || ContentSlide;
  
  return (props) => (
    <React.Suspense fallback={<LoadingComponent />}>
      <Layout {...props} />
    </React.Suspense>
  );
};

/**
 * Lấy danh sách các loại slide có sẵn
 * @returns {Array} Danh sách các loại slide
 */
export const getAvailableLayouts = () => [
  { id: 'title', name: 'Trang tiêu đề', description: 'Slide giới thiệu bài thuyết trình' },
  { id: 'content', name: 'Nội dung', description: 'Slide chứa nội dung chính' },
  { id: 'image-content', name: 'Hình ảnh & Nội dung', description: 'Slide kết hợp hình ảnh và nội dung' },
  { id: 'quote', name: 'Trích dẫn', description: 'Slide hiển thị trích dẫn nổi bật' },
  { id: 'comparison', name: 'So sánh', description: 'Slide để so sánh hai hoặc nhiều mục' },
  { id: 'data', name: 'Dữ liệu', description: 'Slide cho biểu đồ và số liệu' },
  { id: 'thank-you', name: 'Cảm ơn', description: 'Slide kết thúc bài thuyết trình' }
];

// Component mặc định (để hỗ trợ import bình thường)
const SlideLayouts = {
  TitleSlide,
  ContentSlide,
  ImageContentSlide,
  QuoteSlide,
  ComparisonSlide,
  DataSlide,
  ThankYouSlide,
  getLayoutComponent,
  getAvailableLayouts
};

export default SlideLayouts;