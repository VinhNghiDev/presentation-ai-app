/**
 * Tạo prompt cho việc tạo bài thuyết trình
 * @param {Object} options - Các tùy chọn cho bài thuyết trình
 * @returns {string} - Prompt hoàn chỉnh
 */
function createPresentationPrompt(options) {
  const { 
    topic, 
    style = 'professional', 
    slides = 5, 
    language = 'vi', 
    purpose = 'business', 
    audience = 'general',
    includeCharts = true,
    includeImages = true
  } = options;

  // Xác định phong cách và yêu cầu dựa trên các tùy chọn
  let styleDescription = '';
  switch (style) {
    case 'professional':
      styleDescription = 'chuyên nghiệp, súc tích, phù hợp với môi trường doanh nghiệp';
      break;
    case 'academic':
      styleDescription = 'học thuật, chi tiết, có tính phân tích cao';
      break;
    case 'creative':
      styleDescription = 'sáng tạo, hấp dẫn, sinh động với ngôn ngữ và bố cục độc đáo';
      break;
    case 'minimal':
      styleDescription = 'tối giản, rõ ràng, tập trung vào thông điệp chính';
      break;
    default:
      styleDescription = 'chuyên nghiệp, súc tích';
  }

  // Xác định mục đích
  let purposeDescription = '';
  switch (purpose) {
    case 'business':
      purposeDescription = 'doanh nghiệp, thuyết phục và cung cấp thông tin cho đối tác/khách hàng';
      break;
    case 'education':
      purposeDescription = 'giáo dục, truyền đạt kiến thức một cách hiệu quả';
      break;
    case 'marketing':
      purposeDescription = 'marketing, thuyết phục khán giả về giá trị của sản phẩm/dịch vụ';
      break;
    case 'informative':
      purposeDescription = 'cung cấp thông tin, tập trung vào trình bày dữ liệu và sự kiện';
      break;
    default:
      purposeDescription = 'cung cấp thông tin và thuyết phục';
  }

  // Xác định đối tượng
  let audienceDescription = '';
  switch (audience) {
    case 'general':
      audienceDescription = 'đối tượng đa dạng với kiến thức nền tảng khác nhau';
      break;
    case 'executives':
      audienceDescription = 'lãnh đạo cấp cao, tập trung vào giá trị và kết quả';
      break;
    case 'technical':
      audienceDescription = 'đối tượng kỹ thuật, có thể sử dụng thuật ngữ chuyên ngành';
      break;
    case 'students':
      audienceDescription = 'học sinh/sinh viên, cân bằng giữa thông tin và sự hấp dẫn';
      break;
    default:
      audienceDescription = 'đối tượng đa dạng';
  }

  // Tạo yêu cầu định dạng JSON trả về
  const jsonFormat = `
{
  "title": "Tiêu đề bài thuyết trình",
  "description": "Mô tả ngắn gọn về nội dung",
  "slides": [
    {
      "id": "slide-1",
      "title": "Tiêu đề slide",
      "content": "Nội dung chính của slide",
      "type": "cover | table-of-contents | content | conclusion | data | quote | image | market-analysis | case-study | trends",
      "notes": "Ghi chú cho người thuyết trình"
    }
  ]
}`;

  // Tạo prompt hoàn chỉnh
  return `Tạo bài thuyết trình hoàn chỉnh về chủ đề "${topic}" bằng tiếng ${language === 'en' ? 'Anh' : 'Việt'}.

Phong cách: ${styleDescription}
Mục đích: ${purposeDescription}
Đối tượng: ${audienceDescription}
Số lượng slide: ${slides} (bao gồm trang bìa và kết luận)
${includeCharts ? 'Tạo nội dung thích hợp cho biểu đồ khi cần thiết.' : 'Không cần tạo biểu đồ.'}
${includeImages ? 'Đề xuất các slide nên có hình ảnh minh họa.' : 'Không cần đề xuất hình ảnh.'}

Yêu cầu nội dung:
1. Bao gồm trang bìa hấp dẫn với tiêu đề và phụ đề.
2. Cung cấp mục lục hoặc tổng quan về nội dung sẽ trình bày.
3. Xây dựng nội dung chi tiết với dữ liệu, ví dụ, và phân tích.
4. Thêm các slide phân tích thị trường, case study, hoặc xu hướng nếu phù hợp.
5. Đảm bảo mỗi slide có tiêu đề rõ ràng và nội dung súc tích.
6. Kết thúc với slide tóm tắt các điểm chính.

Hãy trả về dữ liệu dưới dạng JSON theo định dạng sau:
${jsonFormat}

Định dạng nội dung slide:
- Sử dụng dấu xuống dòng (\\n) để tách đoạn
- Sử dụng dấu gạch đầu dòng (-) cho danh sách không có thứ tự
- Sử dụng số (1., 2., ...) cho danh sách có thứ tự

Hãy trả về CHUỖI JSON HỢP LỆ mà không có bất kỳ giải thích hay nhận xét nào trước hoặc sau JSON.`;
}

/**
 * Tạo prompt cho việc nâng cao nội dung slide
 * @param {string} content - Nội dung slide cần nâng cao
 * @param {string} type - Loại nâng cao (improve, concise, elaborate, professional, creative)
 * @returns {string} - Prompt hoàn chỉnh
 */
function createEnhancementPrompt(content, type = 'improve') {
  let prompt = '';
  
  switch (type) {
    case 'concise':
      prompt = `Hãy tóm tắt và làm súc tích nội dung sau đây, đảm bảo giữ lại những điểm quan trọng nhất và ý tưởng chính:\n\n${content}`;
      break;
    case 'elaborate':
      prompt = `Hãy mở rộng và bổ sung chi tiết cho nội dung sau đây, làm cho nó phong phú và đầy đủ hơn với dữ liệu, ví dụ và thông tin bổ sung:\n\n${content}`;
      break;
    case 'professional':
      prompt = `Hãy viết lại nội dung sau đây theo phong cách chuyên nghiệp và trang trọng hơn, phù hợp với môi trường doanh nghiệp hoặc học thuật:\n\n${content}`;
      break;
    case 'creative':
      prompt = `Hãy viết lại nội dung sau đây theo phong cách sáng tạo và hấp dẫn hơn, sử dụng ngôn ngữ sinh động và thu hút người đọc:\n\n${content}`;
      break;
    default:
      prompt = `Hãy cải thiện nội dung sau đây, làm cho nó rõ ràng, dễ hiểu và có tính thuyết phục hơn mà không thay đổi ý nghĩa chính:\n\n${content}`;
  }
  
  return prompt;
}

/**
 * Chiết xuất từ khóa từ nội dung văn bản
 * @param {string} text - Văn bản cần chiết xuất từ khóa
 * @returns {string[]} - Mảng từ khóa
 */
function extractKeywordsFromText(text) {
  // Loại bỏ các ký tự đặc biệt và chuyển về chữ thường
  const cleanText = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');
  
  // Tách thành các từ
  const words = cleanText.split(/\s+/);
  
  // Loại bỏ các từ stop words
  const stopWords = ['và', 'hoặc', 'nhưng', 'vì', 'bởi', 'nếu', 'khi', 'là', 'có', 'được', 'để', 'trong', 'ngoài', 'với', 'của', 'từ', 'về'];
  const filteredWords = words.filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Tính tần suất xuất hiện
  const wordFrequency = {};
  filteredWords.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sắp xếp theo tần suất và lấy top từ khóa
  const sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
  return sortedWords.slice(0, 5);
}

module.exports = {
  createPresentationPrompt,
  createEnhancementPrompt,
  extractKeywordsFromText
}; 