import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import FileSaver from 'file-saver';
import pptxgen from 'pptxgenjs';

/**
 * Service xử lý việc xuất bài thuyết trình sang nhiều định dạng
 */

/**
 * Xuất bài thuyết trình sang định dạng PDF
 * @param {Array} slideElements - Các phần tử DOM chứa slide
 * @param {string} title - Tiêu đề bài thuyết trình
 */
export const exportToPDF = async (slideElements, title = 'Presentation') => {
  try {
    if (!slideElements || slideElements.length === 0) {
      throw new Error('Không có slide để xuất');
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      
      // Chụp ảnh slide
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Chuyển canvas thành ảnh
      const imgData = canvas.toDataURL('image/png');
      
      // Thêm trang mới nếu không phải slide đầu tiên
      if (i > 0) {
        pdf.addPage();
      }
      
      // Tính toán kích thước và vị trí để đảm bảo slide vừa với trang PDF
      const imgWidth = pdfWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Thêm ảnh vào PDF
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        imgWidth,
        imgHeight < (pdfHeight - 2 * margin) ? imgHeight : (pdfHeight - 2 * margin)
      );
    }
    
    // Tạo tên file
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // Lưu file
    pdf.save(fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    throw error;
  }
};

/**
 * Xuất bài thuyết trình sang định dạng PNG
 * @param {Array} slideElements - Các phần tử DOM chứa slide
 * @param {string} title - Tiêu đề bài thuyết trình
 */
export const exportToPNG = async (slideElements, title = 'Presentation') => {
  try {
    if (!slideElements || slideElements.length === 0) {
      throw new Error('Không có slide để xuất');
    }

    const zip = new JSZip();
    const folder = zip.folder(title.replace(/\s+/g, '_'));
    
    // Chụp ảnh từng slide và thêm vào zip
    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      
      // Chụp ảnh slide
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Chuyển canvas thành blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/png');
      });
      
      // Thêm vào zip
      folder.file(`slide_${i + 1}.png`, blob);
    }
    
    // Tạo file zip
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Tạo tên file
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.zip`;
    
    // Lưu file
    FileSaver.saveAs(content, fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Lỗi khi xuất PNG:', error);
    throw error;
  }
};

/**
 * Xuất bài thuyết trình sang định dạng PPTX
 * @param {Object} presentation - Dữ liệu bài thuyết trình
 * @param {Array} slideElements - Các phần tử DOM chứa slide (tùy chọn, dùng để chụp ảnh)
 */
export const exportToPPTX = async (presentation, slideElements = []) => {
  try {
    if (!presentation || !presentation.slides || presentation.slides.length === 0) {
      throw new Error('Không có dữ liệu bài thuyết trình để xuất');
    }

    // Tạo đối tượng PPTX
    const pptx = new pptxgen();
    
    // Thiết lập thông tin bài thuyết trình
    pptx.author = 'Presentation AI App';
    pptx.company = 'Presentation AI';
    pptx.subject = presentation.description || 'Created with Presentation AI';
    pptx.title = presentation.title || 'Presentation';
    
    // Thiết lập kích thước slide
    pptx.layout = 'LAYOUT_16x9';
    
    // Xác định màu chủ đạo
    const mainColor = '#1976d2';
    const accentColor = '#f44336';
    const textColor = '#333333';
    
    // Chuyển đổi từng slide
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];
      const pptxSlide = pptx.addSlide();
      
      // Thiết lập nền slide
      pptxSlide.background = { color: '#ffffff' };
      
      // Xử lý tiêu đề
      pptxSlide.addText(slide.title || '', {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fontSize: slide.type === 'cover' ? 44 : 36,
        fontFace: 'Arial',
        color: slide.type === 'cover' ? mainColor : textColor,
        bold: true,
        align: slide.type === 'cover' ? 'center' : 'left'
      });
      
      // Xử lý nội dung
      if (slide.content) {
        // Phân tích nội dung
        const contentLines = slide.content.split('\n');
        
        // Tính toán vị trí và kích thước
        const contentY = slide.type === 'cover' ? 3 : 1.7;
        const contentH = slide.type === 'cover' ? 3 : 4.5;
        
        // Thêm nội dung vào slide
        pptxSlide.addText(contentLines, {
          x: 0.5,
          y: contentY,
          w: '90%',
          h: contentH,
          fontSize: slide.type === 'cover' ? 24 : 18,
          fontFace: 'Arial',
          color: textColor,
          bullet: contentLines.length > 1 && slide.type !== 'cover',
          align: slide.type === 'cover' ? 'center' : 'left'
        });
      }
      
      // Thêm hình ảnh slide nếu có slideElements
      if (slideElements.length > i) {
        try {
          const canvas = await html2canvas(slideElements[i], {
            scale: 1,
            useCORS: true,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          // Thêm hình ảnh vào cuối slide
          pptxSlide.addImage({
            data: imgData,
            x: 6.5,
            y: 3.5,
            w: 3,
            h: 2.25,
            rounding: true
          });
        } catch (error) {
          console.warn('Không thể chụp slide:', error);
        }
      }
      
      // Thêm ghi chú nếu có
      if (slide.notes) {
        pptxSlide.addNotes(slide.notes);
      }
      
      // Thêm số trang nếu không phải slide đầu
      if (i > 0) {
        pptxSlide.addText(`${i + 1}/${presentation.slides.length}`, {
          x: 9,
          y: 6.5,
          w: 1,
          h: 0.3,
          fontSize: 10,
          fontFace: 'Arial',
          color: '#999999',
          align: 'right'
        });
      }
    }
    
    // Tạo tên file
    const fileName = `${presentation.title?.replace(/\s+/g, '_') || 'Presentation'}_${new Date().toISOString().slice(0, 10)}.pptx`;
    
    // Lưu file
    pptx.writeFile({ fileName });
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Lỗi khi xuất PPTX:', error);
    throw error;
  }
};

/**
 * Xuất bài thuyết trình sang định dạng HTML
 * @param {Object} presentation - Dữ liệu bài thuyết trình
 */
export const exportToHTML = async (presentation) => {
  try {
    if (!presentation || !presentation.slides || presentation.slides.length === 0) {
      throw new Error('Không có dữ liệu bài thuyết trình để xuất');
    }

    // Tạo HTML
    let html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title || 'Presentation'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .slide { page-break-after: always; padding: 20px; height: 90vh; position: relative; }
    .slide-cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .slide-title { font-size: 32px; margin-bottom: 20px; color: #1976d2; }
    .slide-content { font-size: 18px; line-height: 1.5; }
    .slide-content ul { text-align: left; }
    .slide-number { position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: #999; }
    @media print {
      .slide { page-break-after: always; height: 100vh; }
    }
  </style>
</head>
<body>
`;

    // Thêm từng slide
    presentation.slides.forEach((slide, index) => {
      const slideClass = slide.type === 'cover' ? 'slide slide-cover' : 'slide';
      
      html += `
  <div class="${slideClass}">
    <h1 class="slide-title">${slide.title || ''}</h1>
    <div class="slide-content">
      ${formatContentToHTML(slide.content || '')}
    </div>
    ${index > 0 ? `<div class="slide-number">${index + 1}/${presentation.slides.length}</div>` : ''}
  </div>
`;
    });

    html += `
</body>
</html>
`;

    // Tạo Blob
    const blob = new Blob([html], { type: 'text/html' });
    
    // Tạo tên file
    const fileName = `${presentation.title?.replace(/\s+/g, '_') || 'Presentation'}_${new Date().toISOString().slice(0, 10)}.html`;
    
    // Lưu file
    FileSaver.saveAs(blob, fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Lỗi khi xuất HTML:', error);
    throw error;
  }
};

/**
 * Hàm hỗ trợ: Chuyển đổi nội dung text thành HTML
 * @param {string} content - Nội dung text
 * @returns {string} - Nội dung HTML
 */
function formatContentToHTML(content) {
  if (!content) return '';
  
  // Chuyển đổi xuống dòng thành thẻ <p>
  let html = content.replace(/\n\n+/g, '</p><p>');
  
  // Xử lý danh sách có dấu gạch đầu dòng
  if (html.includes('\n- ')) {
    const parts = html.split('\n- ');
    html = parts[0];
    if (parts.length > 1) {
      html += '<ul>';
      for (let i = 1; i < parts.length; i++) {
        html += `<li>${parts[i]}</li>`;
      }
      html += '</ul>';
    }
  }
  // Xử lý danh sách có số thứ tự
  else if (/\n\d+\.\s/.test(html)) {
    const parts = html.split(/\n\d+\.\s/);
    html = parts[0];
    if (parts.length > 1) {
      html += '<ol>';
      for (let i = 1; i < parts.length; i++) {
        html += `<li>${parts[i]}</li>`;
      }
      html += '</ol>';
    }
  }
  
  // Bao bọc trong thẻ <p> nếu chưa có
  if (!html.startsWith('<p>')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}

export default {
  exportToPDF,
  exportToPNG,
  exportToPPTX,
  exportToHTML
}; 