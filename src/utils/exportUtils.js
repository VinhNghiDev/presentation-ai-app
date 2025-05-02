// src/utils/exportUtils.js
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Xuất bài thuyết trình sang định dạng PDF
 * @param {Array} slides - Mảng các slide cần xuất
 * @param {string} title - Tiêu đề của bài thuyết trình
 */
export const exportToPDF = async (slides, title = 'Presentation') => {
  try {
    // Tạo một instance PDF mới, định dạng landscape (ngang) cho slide
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    let isFirstPage = true;
    
    // Vòng lặp qua từng slide để thêm vào PDF
    for (let i = 0; i < slides.length; i++) {
      const slideId = slides[i].id;
      const slideElement = document.getElementById(`slide-preview-${slideId}`);
      
      // Bỏ qua nếu không tìm thấy phần tử
      if (!slideElement) continue;
      
      // Chuyển đổi phần tử DOM thành canvas
      const canvas = await html2canvas(slideElement, {
        scale: 2, // Tỷ lệ cao hơn để lấy chất lượng tốt
        useCORS: true, // Cho phép tải hình ảnh từ domain khác
        logging: false, // Tắt log để tránh spam console
        allowTaint: true, // Cho phép render tất cả phần tử
        backgroundColor: '#ffffff' // Đặt màu nền trắng
      });
      
      // Chuyển canvas thành data URL
      const imgData = canvas.toDataURL('image/png');
      
      // Thêm trang mới nếu không phải trang đầu tiên
      if (!isFirstPage) {
        pdf.addPage();
      }
      
      // Tính toán kích thước để phù hợp với trang PDF
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Để lại lề 10mm mỗi bên
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      // Thêm hình ảnh vào PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Thêm số trang vào footer
      pdf.setFontSize(10);
      pdf.text(`Trang ${i + 1}/${slides.length}`, pdfWidth / 2, pdfHeight - 5, {
        align: 'center'
      });
      
      isFirstPage = false;
    }
    
    // Thêm metadata
    pdf.setProperties({
      title: title,
      subject: 'Presentation created with AI Presentation App',
      author: 'AI Presentation App',
      keywords: 'presentation, slides, AI',
      creator: 'AI Presentation App'
    });
    
    // Lưu file PDF
    pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Có lỗi khi xuất PDF. Vui lòng thử lại.');
    return false;
  }
};

/**
 * Xuất từng slide thành các file PNG riêng biệt
 * @param {Array} slides - Mảng các slide cần xuất
 */
export const exportToPNG = async (slides) => {
  try {
    // Vòng lặp qua từng slide để xuất ra PNG
    for (let i = 0; i < slides.length; i++) {
      const slideId = slides[i].id;
      const slideElement = document.getElementById(`slide-preview-${slideId}`);
      
      // Bỏ qua nếu không tìm thấy phần tử
      if (!slideElement) continue;
      
      // Chuyển đổi phần tử DOM thành canvas với chất lượng cao
      const canvas = await html2canvas(slideElement, {
        scale: 3, // Tỷ lệ cao hơn cho chất lượng hình ảnh tốt
        useCORS: true, // Cho phép tải hình ảnh từ domain khác
        allowTaint: true, // Cho phép render tất cả phần tử
        backgroundColor: null // Giữ nguyên màu nền
      });
      
      // Chuyển canvas thành data URL
      const image = canvas.toDataURL('image/png');
      
      // Tạo link tải xuống
      const link = document.createElement('a');
      link.href = image;
      link.download = `slide-${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Thêm độ trễ nhỏ giữa các lần tải để tránh trình duyệt bị quá tải
      if (i < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    alert('Có lỗi khi xuất PNG. Vui lòng thử lại.');
    return false;
  }
};

/**
 * Xuất bài thuyết trình sang PPTX (placeholder - cần thư viện bổ sung)
 * @param {Array} slides - Mảng các slide cần xuất
 * @param {string} title - Tiêu đề của bài thuyết trình
 */
export const exportToPPTX = (slides, title) => {
  // Note: Để xuất PPTX, bạn cần thư viện như pptxgenjs
  // Đây là phiên bản giả lập
  console.log(`Đang xuất ${slides.length} slide sang PPTX với tiêu đề: ${title}`);
  alert(`Chức năng xuất PPTX đang được phát triển. Vui lòng sử dụng PDF hoặc PNG.`);
};

/**
 * Tạo bản xem trước của slide để xuất
 * @param {Object} slide - Slide cần tạo bản xem trước
 * @param {Object} template - Template được áp dụng
 * @returns {HTMLElement} - Phần tử HTML chứa bản xem trước
 */
export const createSlidePreview = (slide, template) => {
  // Tạo một div mới để chứa bản xem trước
  const previewContainer = document.createElement('div');
  previewContainer.id = `slide-preview-${slide.id}`;
  previewContainer.style.width = '1280px'; // Kích thước chuẩn cho slide
  previewContainer.style.height = '720px';
  previewContainer.style.position = 'absolute';
  previewContainer.style.left = '-9999px'; // Đặt ngoài màn hình
  previewContainer.style.backgroundColor = template.background;
  previewContainer.style.color = template.textColor;
  previewContainer.style.fontFamily = template.fontFamily;
  previewContainer.style.padding = '40px';
  previewContainer.style.boxSizing = 'border-box';
  
  // Tạo tiêu đề
  const title = document.createElement('h1');
  title.textContent = slide.title;
  title.style.color = template.headerColor;
  title.style.fontSize = '48px';
  title.style.marginBottom = '30px';
  previewContainer.appendChild(title);
  
  // Tạo nội dung
  const content = document.createElement('div');
  content.innerHTML = slide.content.replace(/\n/g, '<br>');
  content.style.fontSize = '24px';
  content.style.lineHeight = '1.5';
  previewContainer.appendChild(content);
  
  // Thêm các phần tử khác (nếu có)
  if (slide.elements && slide.elements.length > 0) {
    slide.elements.forEach(element => {
      if (element.type === 'image') {
        const img = document.createElement('img');
        img.src = element.content;
        img.style.position = 'absolute';
        img.style.left = `${element.position.x}px`;
        img.style.top = `${element.position.y}px`;
        img.style.width = `${element.size.width}px`;
        img.style.height = `${element.size.height}px`;
        img.style.objectFit = 'contain';
        previewContainer.appendChild(img);
      }
    });
  }
  
  // Thêm vào body tạm thời để render
  document.body.appendChild(previewContainer);
  
  return previewContainer;
};

/**
 * Xóa bản xem trước sau khi đã xuất xong
 * @param {HTMLElement} previewElement - Phần tử HTML chứa bản xem trước
 */
export const removeSlidePreview = (previewElement) => {
  if (previewElement && previewElement.parentNode) {
    previewElement.parentNode.removeChild(previewElement);
  }
};

/**
 * Tạo bản xem trước và xuất theo định dạng yêu cầu
 * @param {Array} slides - Mảng các slide cần xuất
 * @param {Array} templates - Mảng các template
 * @param {string} title - Tiêu đề bài thuyết trình
 * @param {string} format - Định dạng xuất (pdf, png, pptx)
 */
export const exportPresentation = async (slides, templates, title, format) => {
  // Tạo bản xem trước cho mỗi slide
  const previewElements = [];
  
  try {
    // Tạo bản xem trước cho mỗi slide
    for (const slide of slides) {
      const template = templates.find(t => t.id === slide.template) || templates[0];
      const previewElement = createSlidePreview(slide, template);
      previewElements.push(previewElement);
    }
    
    // Xuất theo định dạng yêu cầu
    let result = false;
    switch (format) {
      case 'pdf':
        result = await exportToPDF(slides, title);
        break;
      case 'png':
        result = await exportToPNG(slides);
        break;
      case 'pptx':
        result = exportToPPTX(slides, title);
        break;
      default:
        result = await exportToPDF(slides, title);
    }
    
    return result;
  } catch (error) {
    console.error('Error during export:', error);
    alert('Có lỗi khi xuất bài thuyết trình. Vui lòng thử lại.');
    return false;
  } finally {
    // Xóa tất cả các bản xem trước đã tạo
    previewElements.forEach(element => removeSlidePreview(element));
  }
};