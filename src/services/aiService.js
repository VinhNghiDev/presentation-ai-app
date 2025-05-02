// Giả lập API AI cho tính năng tạo nội dung tự động
export const generatePresentation = async (options) => {
    const { topic, style, slides } = options;
    
    // Giả lập thời gian xử lý
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Tạo các slide mẫu dựa trên chủ đề
    const generatedSlides = [];
    
    // Slide giới thiệu
    generatedSlides.push({
      id: 1,
      title: topic,
      content: `Giới thiệu về ${topic}`,
      elements: [
        {
          id: 'element-1',
          type: 'text',
          content: `Giới thiệu về ${topic}`,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 80 }
        }
      ]
    });
    
    // Các slide nội dung
    for (let i = 2; i <= slides - 1; i++) {
      generatedSlides.push({
        id: i,
        title: `Phần ${i - 1}`,
        content: `Nội dung cho ${topic}`,
        elements: [
          {
            id: `element-title-${i}`,
            type: 'text',
            content: `Phần ${i - 1}`,
            position: { x: 100, y: 50 },
            size: { width: 600, height: 50 }
          },
          {
            id: `element-content-${i}`,
            type: 'text',
            content: generateDummyContent(topic, i),
            position: { x: 100, y: 120 },
            size: { width: 600, height: 200 }
          }
        ]
      });
    }
    
    // Slide kết luận
    generatedSlides.push({
      id: slides,
      title: 'Kết luận',
      content: `Tóm tắt về ${topic}`,
      elements: [
        {
          id: `element-conclusion`,
          type: 'text',
          content: 'Kết luận',
          position: { x: 100, y: 50 },
          size: { width: 600, height: 50 }
        },
        {
          id: `element-summary`,
          type: 'text',
          content: `Tóm tắt những điểm chính về ${topic}`,
          position: { x: 100, y: 120 },
          size: { width: 600, height: 200 }
        }
      ]
    });
    
    return generatedSlides;
  };
  
  // Hàm tạo nội dung giả
  function generateDummyContent(topic, index) {
    const contents = [
      `${topic} là một chủ đề quan trọng trong bối cảnh hiện nay. Có nhiều yếu tố cần cân nhắc khi nghiên cứu về chủ đề này.`,
      `Khi phân tích ${topic}, chúng ta cần xem xét các khía cạnh sau: yếu tố con người, yếu tố công nghệ và yếu tố thị trường.`,
      `Các nghiên cứu gần đây về ${topic} đã chỉ ra những xu hướng mới đang hình thành và có tác động lớn đến ngành.`,
      `Để thành công với ${topic}, các doanh nghiệp cần có chiến lược rõ ràng và thích ứng nhanh với sự thay đổi.`,
      `Tương lai của ${topic} sẽ phụ thuộc vào khả năng đổi mới và ứng dụng công nghệ mới.`
    ];
    
    return contents[index % contents.length];
  }