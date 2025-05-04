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
      const slide = slides[i];
      const slideElement = slide.ref || document.getElementById(`slide-preview-${slide.id}`);
      
      // Bỏ qua nếu không tìm thấy phần tử
      if (!slideElement) {
        console.warn(`Không tìm thấy phần tử cho slide ${slide.id}`);
        continue;
      }
      
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
      const slide = slides[i];
      const slideElement = slide.ref || document.getElementById(`slide-preview-${slide.id}`);
      
      // Bỏ qua nếu không tìm thấy phần tử
      if (!slideElement) {
        console.warn(`Không tìm thấy phần tử cho slide ${slide.id}`);
        continue;
      }
      
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
 * Xuất bài thuyết trình sang PPTX (sử dụng thư viện pptxgenjs)
 * @param {Array} slides - Mảng các slide cần xuất
 * @param {string} title - Tiêu đề của bài thuyết trình
 */
export const exportToPPTX = async (slides, title) => {
  try {
    // Kiểm tra nếu thư viện pptxgenjs đã được tải
    if (typeof window.pptxgen === 'undefined') {
      console.warn('Thư viện pptxgenjs chưa được tải.');
      alert('Đang tải thư viện cần thiết...');
      
      // Tải thư viện pptxgenjs từ CDN
      await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.11.0/dist/pptxgen.bundle.js');
      
      // Kiểm tra lại sau khi tải
      if (typeof window.pptxgen === 'undefined') {
        throw new Error('Không thể tải thư viện pptxgenjs');
      }
    }
    
    // Tạo bài thuyết trình mới
    const pptx = new window.pptxgen();
    
    // Thiết lập thuộc tính cho bài thuyết trình
    pptx.author = 'AI Presentation App';
    pptx.company = 'AI Presentation App';
    pptx.revision = '1';
    pptx.subject = 'Presentation';
    pptx.title = title;
    
    // Vòng lặp qua từng slide để thêm vào PPTX
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideElement = slide.ref || document.getElementById(`slide-preview-${slide.id}`);
      
      // Bỏ qua nếu không tìm thấy phần tử
      if (!slideElement) {
        console.warn(`Không tìm thấy phần tử cho slide ${slide.id}`);
        continue;
      }
      
      // Tạo slide mới
      const pptxSlide = pptx.addSlide();
      
      // Chuyển đổi phần tử DOM thành canvas
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null
      });
      
      // Chuyển canvas thành data URL
      const imgData = canvas.toDataURL('image/png');
      
      // Thêm hình ảnh vào slide
      pptxSlide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
    }
    
    // Xuất file PPTX
    pptx.writeFile({ fileName: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
    
    return true;
  } catch (error) {
    console.error('Error exporting to PPTX:', error);
    alert(`Có lỗi khi xuất PPTX: ${error.message}. Vui lòng thử lại hoặc sử dụng định dạng khác.`);
    return false;
  }
};

/**
 * Tải script từ URL
 * @param {string} url - URL của script
 * @returns {Promise} - Promise sẽ resolve khi script được tải xong
 */
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Tạo và chia sẻ link trực tuyến
 * @param {string} presentationId - ID bài thuyết trình
 * @param {string} accessType - Loại quyền truy cập ('view' hoặc 'edit')
 * @returns {Promise<Object>} - Thông tin liên kết
 */
export const createShareableLink = async (presentationId, accessType = 'view') => {
  // Giả lập tạo link chia sẻ
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const token = Math.random().toString(36).substring(2, 15);
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // Hết hạn sau 7 ngày
  
  // Tạo URL chia sẻ
  const shareUrl = `${window.location.origin}/shared/${presentationId}?token=${token}&type=${accessType}`;
  
  // Lưu thông tin vào localStorage
  try {
    const shareLinks = JSON.parse(localStorage.getItem(`share_links_${presentationId}`) || '[]');
    shareLinks.push({
      url: shareUrl,
      token,
      accessType,
      expiresAt,
      createdAt: Date.now()
    });
    localStorage.setItem(`share_links_${presentationId}`, JSON.stringify(shareLinks));
  } catch (error) {
    console.error('Error saving share link:', error);
  }
  
  return {
    url: shareUrl,
    expiresAt,
    accessType
  };
};

/**
 * Chia sẻ bài thuyết trình qua email
 * @param {string} email - Địa chỉ email
 * @param {string} presentationId - ID bài thuyết trình
 * @param {string} title - Tiêu đề bài thuyết trình
 * @returns {Promise<boolean>} - Kết quả chia sẻ
 */
export const shareViaEmail = async (email, presentationId, title) => {
  try {
    // Tạo link chia sẻ
    const shareLink = await createShareableLink(presentationId, 'view');
    
    // Giả lập gửi email
    console.log(`Chia sẻ bài thuyết trình "${title}" tới ${email} với link: ${shareLink.url}`);
    
    // Giả lập độ trễ gửi email
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return true;
  } catch (error) {
    console.error('Error sharing via email:', error);
    return false;
  }
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
 * Xuất tất cả slide và chuẩn bị DOM
 * @param {Array} slides - Mảng các slide cần xuất
 * @param {Array} templates - Mảng các template
 * @param {string} title - Tiêu đề bài thuyết trình
 * @param {string} format - Định dạng xuất (pdf, png, pptx)
 */
export const exportPresentation = async (slides, templates, title, format) => {
  try {
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
        result = await exportToPPTX(slides, title);
        break;
      default:
        result = await exportToPDF(slides, title);
    }
    
    return result;
  } catch (error) {
    console.error('Error during export:', error);
    alert('Có lỗi khi xuất bài thuyết trình. Vui lòng thử lại.');
    return false;
  }
};