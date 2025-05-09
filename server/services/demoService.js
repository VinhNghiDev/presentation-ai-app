/**
 * Tạo bài thuyết trình mẫu cho chế độ demo
 * @param {string} topic - Chủ đề bài thuyết trình
 * @param {number} slideCount - Số lượng slide
 * @param {string} style - Phong cách bài thuyết trình
 * @returns {Object} - Dữ liệu bài thuyết trình mẫu
 */
function generateDemoPresentation(topic, slideCount = 5, style = 'professional') {
  console.log(`Đang tạo bài thuyết trình mẫu cho chủ đề: ${topic}`);
  
  // Tiêu đề bài thuyết trình dựa trên chủ đề
  const title = `Bài thuyết trình về ${topic}`;
  
  // Tạo mảng slides
  const slides = [];
  
  // Slide đầu tiên là trang bìa
  slides.push({
    id: 'slide-1',
    title: title,
    content: '',
    type: 'cover',
    notes: `Giới thiệu về ${topic}`
  });
  
  // Slide thứ hai là mục lục
  slides.push({
    id: 'slide-2',
    title: 'Nội dung chính',
    content: '1. Giới thiệu\n2. Hiện trạng\n3. Giải pháp\n4. Các bước triển khai\n5. Kết luận',
    type: 'table-of-contents',
    notes: 'Trình bày tổng quan nội dung sẽ được đề cập'
  });
  
  // Tạo các slide nội dung
  for (let i = 3; i <= slideCount; i++) {
    let type = 'content';
    let title = '';
    let content = '';
    let notes = '';
    
    // Xác định nội dung dựa trên vị trí slide
    if (i === 3) {
      title = 'Giới thiệu';
      content = `${topic} là một chủ đề quan trọng trong thời đại ngày nay. Chúng ta cần hiểu rõ các khía cạnh của vấn đề này để có thể ứng dụng hiệu quả.`;
      notes = `Giới thiệu tổng quan về ${topic} và tầm quan trọng`;
    } else if (i === slideCount) {
      title = 'Kết luận';
      type = 'conclusion';
      content = `Tóm lại, ${topic} mang lại nhiều lợi ích và cơ hội. Việc áp dụng đúng cách sẽ giúp tổ chức/cá nhân đạt được mục tiêu đề ra.`;
      notes = 'Nhấn mạnh lại các điểm chính và đề xuất hướng đi tiếp theo';
    } else if (i === 4) {
      title = 'Hiện trạng';
      content = `Hiện nay, ${topic} đang đối mặt với nhiều thách thức:\n- Thiếu hiểu biết chuyên sâu\n- Khó khăn trong việc triển khai\n- Chi phí đầu tư cao\n- Thiếu nhân lực có kỹ năng`;
      notes = `Phân tích tình hình hiện tại của ${topic}`;
    } else if (i === 5) {
      title = 'Giải pháp';
      content = `Để giải quyết các thách thức, chúng ta cần:\n- Tăng cường đào tạo và nâng cao nhận thức\n- Áp dụng phương pháp triển khai theo từng giai đoạn\n- Tối ưu hóa chi phí qua việc sử dụng công nghệ\n- Hợp tác với các chuyên gia trong lĩnh vực`;
      type = 'solution';
      notes = `Đề xuất các giải pháp cho vấn đề liên quan đến ${topic}`;
    } else {
      title = 'Các bước triển khai';
      content = `Quy trình triển khai bao gồm:\n1. Phân tích nhu cầu\n2. Lập kế hoạch chi tiết\n3. Thực hiện thí điểm\n4. Đánh giá và điều chỉnh\n5. Triển khai toàn diện`;
      type = 'steps';
      notes = `Hướng dẫn các bước triển khai ${topic} một cách hiệu quả`;
    }
    
    slides.push({
      id: `slide-${i}`,
      title,
      content,
      type,
      notes
    });
  }
  
  return {
    title,
    description: `Bài thuyết trình mẫu về ${topic}`,
    slides,
    metadata: {
      created: new Date().toISOString(),
      provider: 'DEMO',
      model: 'demo-model',
      topic,
      slides: slideCount,
      style
    }
  };
}

/**
 * Tạo nội dung AI mẫu cho các loại yêu cầu khác
 * @param {Object} options - Tùy chọn cho phản hồi
 * @returns {string} - Nội dung phản hồi mẫu
 */
function generateDemoAIResponse(options) {
  // Kiểm tra xem request yêu cầu loại phản hồi nào
  if (options.messages && Array.isArray(options.messages)) {
    const lastMessage = options.messages[options.messages.length - 1];
    const prompt = lastMessage.content || '';
    
    if (prompt.toLowerCase().includes('cải thiện') || prompt.toLowerCase().includes('nâng cao')) {
      return `Đây là nội dung đã được cải thiện ở chế độ demo. Nội dung này sẽ rõ ràng, súc tích và chuyên nghiệp hơn so với nội dung gốc. Sử dụng dữ liệu thực tế và ví dụ cụ thể để minh họa các điểm chính.`;
    } else if (prompt.toLowerCase().includes('tóm tắt') || prompt.toLowerCase().includes('súc tích')) {
      return `Đây là phiên bản tóm tắt súc tích, trình bày các điểm chính một cách rõ ràng và ngắn gọn. Nội dung này loại bỏ các chi tiết không cần thiết và tập trung vào thông điệp cốt lõi.`;
    } else if (prompt.toLowerCase().includes('mở rộng') || prompt.toLowerCase().includes('chi tiết')) {
      return `Đây là nội dung được mở rộng với nhiều chi tiết hơn. Phần này bổ sung thêm dữ liệu, ví dụ cụ thể, và giải thích sâu rộng hơn về các khái niệm chính. Nội dung đã được làm phong phú với các thông tin bổ sung có liên quan.`;
    }
  }
  
  // Phản hồi mặc định
  return `Đây là phản hồi mẫu từ chế độ demo. Trong trường hợp thực tế, nội dung này sẽ được tạo bởi AI thông qua OpenAI API. Để kích hoạt tính năng đầy đủ, vui lòng cung cấp API key hợp lệ trong file .env.`;
}

module.exports = {
  generateDemoPresentation,
  generateDemoAIResponse
}; 