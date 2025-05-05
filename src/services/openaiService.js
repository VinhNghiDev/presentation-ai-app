// Creating openaiService.js file

// src/services/openaiService.js - Sử dụng Fetch API thay vì Axios

// Cấu hình OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o'; // Nâng cấp lên model mạnh mẽ hơn
const FALLBACK_MODEL = 'gpt-3.5-turbo'; // Model dự phòng nếu gặp lỗi hoặc tối ưu chi phí

// Xóa API key, chuyển sang cơ chế lấy từ biến môi trường hoặc cấu hình
const SYSTEM_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// Fallback model nếu không có API key
const USE_FALLBACK = !SYSTEM_API_KEY || SYSTEM_API_KEY === 'sk-' || SYSTEM_API_KEY === '';

/**
 * Tạo request options cho Fetch API
 * @param {string} apiKey - API key của OpenAI
 * @param {Object} body - Body của request
 * @returns {Object} - Options cho fetch
 */
const createRequestOptions = (apiKey, body) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  };
};

/**
 * Tạo prompt cho bài thuyết trình
 * @param {Object} options - Các tùy chọn cho bài thuyết trình
 * @returns {string} - Prompt hoàn chỉnh
 */
const createPresentationPrompt = (options) => {
  const { 
    topic, 
    style, 
    slides, 
    language = 'vi',
    purpose = 'business',
    audience = 'general',
    includeCharts = true,
    includeImages = true,
    knowledge = null // Dữ liệu bổ sung từ knowledgeService
  } = options;
  
  let styleDescription = '';
  switch (style) {
    case 'professional':
      styleDescription = 'Chuyên nghiệp, súc tích, rõ ràng, phù hợp trong môi trường doanh nghiệp';
      break;
    case 'creative':
      styleDescription = 'Sáng tạo, hấp dẫn, với ngôn ngữ sinh động và ý tưởng độc đáo';
      break;
    case 'minimal':
      styleDescription = 'Tối giản, chỉ những thông tin thiết yếu, trình bày đơn giản';
      break;
    case 'academic':
      styleDescription = 'Học thuật, chính xác, có trích dẫn và thuật ngữ chuyên ngành';
      break;
    case 'nature':
      styleDescription = 'Lấy cảm hứng từ thiên nhiên, thân thiện với môi trường, nhẹ nhàng';
      break;
    case 'tech':
      styleDescription = 'Định hướng công nghệ, hiện đại, đổi mới, tập trung vào xu hướng mới';
      break;
    default:
      styleDescription = 'Chuyên nghiệp và dễ hiểu';
  }
  
  let audienceDescription = '';
  switch (audience) {
    case 'executive':
      audienceDescription = 'Lãnh đạo và quản lý cấp cao, tập trung vào chiến lược và kết quả. Họ quan tâm đến tác động kinh doanh, ROI và định hướng dài hạn.';
      break;
    case 'technical':
      audienceDescription = 'Chuyên gia kỹ thuật, có kiến thức chuyên môn trong lĩnh vực. Họ đánh giá cao chi tiết kỹ thuật, dữ liệu cụ thể và phân tích sâu.';
      break;
    case 'student':
      audienceDescription = 'Học sinh và sinh viên, nội dung giáo dục và dễ tiếp cận. Họ cần các khái niệm được giải thích rõ ràng với ví dụ thực tế.';
      break;
    case 'client':
      audienceDescription = 'Khách hàng và đối tác, tập trung vào giá trị và lợi ích. Họ quan tâm đến giải pháp cho vấn đề của họ và ROI.';
      break;
    default:
      audienceDescription = 'Đối tượng đại chúng với nhiều cấp độ hiểu biết khác nhau, cần thông tin cân bằng giữa chuyên môn và khả năng tiếp cận.';
  }
  
  let purposeDescription = '';
  switch (purpose) {
    case 'education':
      purposeDescription = 'Giáo dục và đào tạo, truyền đạt kiến thức. Mục tiêu là làm cho người nghe hiểu rõ chủ đề và có thể áp dụng kiến thức.';
      break;
    case 'marketing':
      purposeDescription = 'Marketing và truyền thông, thuyết phục và thu hút. Mục tiêu là tạo ấn tượng và khuyến khích hành động cụ thể.';
      break;
    case 'academic':
      purposeDescription = 'Nghiên cứu học thuật, báo cáo khoa học. Mục tiêu là trình bày phát hiện, phương pháp nghiên cứu và đóng góp cho lĩnh vực.';
      break;
    case 'personal':
      purposeDescription = 'Sử dụng cá nhân, chia sẻ thông tin hoặc kỹ năng. Mục tiêu là kết nối với người nghe và truyền cảm hứng.';
      break;
    default:
      purposeDescription = 'Sử dụng trong môi trường doanh nghiệp và công việc. Mục tiêu là cung cấp thông tin, hỗ trợ quyết định và thúc đẩy kết quả kinh doanh.';
  }
  
  // Bổ sung thông tin về biểu đồ và hình ảnh
  const mediaGuidance = `
Hướng dẫn về phương tiện trực quan:
- ${includeCharts ? 'Đề xuất dữ liệu biểu đồ thống kê cụ thể cho các slide có nội dung phù hợp, đặc biệt cho các slide về so sánh, thị trường, xu hướng, kết quả nghiên cứu, bao gồm cả số liệu thực tế.' : 'Không đề xuất biểu đồ.'}
- ${includeImages ? 'Đề xuất từ khóa hình ảnh phù hợp cho mỗi slide, tập trung vào hình ảnh có tính biểu tượng và minh họa cao.' : 'Không đề xuất hình ảnh.'}
`;

  // Bổ sung yêu cầu về cấu trúc slide đặc biệt
  const specialSlideRequests = `
Yêu cầu về cấu trúc bài thuyết trình:
1. Slide đầu tiên: Trang bìa với tiêu đề thu hút, tên người trình bày, và statement ngắn về giá trị của bài thuyết trình.
2. Slide thứ hai: Outline/Mục lục rõ ràng với các phần chính của bài thuyết trình.
3. Slide giới thiệu: Đặt vấn đề, tạo sự quan tâm, và thiết lập bối cảnh.
4. Slide nội dung chính: Phân tích sâu với dữ liệu cụ thể, ví dụ thực tế, và so sánh.
5. Slide case study: Ít nhất một nghiên cứu trường hợp điển hình liên quan đến chủ đề.
6. Slide xu hướng: Phân tích xu hướng hiện tại và tương lai của lĩnh vực.
7. Slide thách thức & giải pháp: Thảo luận về thách thức và đề xuất giải pháp cụ thể.
8. Slide kết luận: Tóm tắt các điểm chính, tái khẳng định thông điệp chính.
9. Slide Call-to-Action: Các bước tiếp theo cụ thể mà người nghe nên thực hiện.
10. Slide Q&A: Chuẩn bị câu hỏi gợi ý để thảo luận.
11. Slide tài liệu tham khảo: Liệt kê nguồn thông tin đáng tin cậy đã sử dụng.
`;

  // Nếu có dữ liệu từ knowledgeService, thêm nó vào prompt
  let knowledgePrompt = '';
  if (knowledge) {
    knowledgePrompt = `
Thông tin bổ sung cho bài thuyết trình:

Thống kê thị trường:
${knowledge.statistics.map(stat => `- ${stat.metric}: ${stat.value} (Nguồn: ${stat.source})`).join('\n')}

Nghiên cứu trường hợp điển hình:
${knowledge.caseStudies.map(cs => `- ${cs.company} (${cs.industry}): ${cs.challenge} -> ${cs.solution} -> ${cs.results}`).join('\n')}

Xu hướng ngành hiện tại:
${knowledge.trends.map(trend => `- ${trend}`).join('\n')}

Nguồn tham khảo đáng tin cậy:
${knowledge.sources.map(source => `- ${source.name}: ${source.url}`).join('\n')}
`;
  }

  return `
Tạo một bài thuyết trình chuyên nghiệp, chi tiết và có chiều sâu về chủ đề "${topic}" với ${slides} slides.

Thông tin cơ bản:
- Phong cách: ${styleDescription}
- Đối tượng: ${audienceDescription}
- Mục đích: ${purposeDescription}
- Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'Tiếng Anh' : `${language}`}
${mediaGuidance}

${specialSlideRequests}

${knowledgePrompt}

Yêu cầu về chất lượng nội dung:
1. Độ sâu: Phân tích chuyên sâu từng khía cạnh của chủ đề, không chỉ dừng ở thông tin bề mặt.
2. Dữ liệu cụ thể: Sử dụng số liệu, thống kê và dữ liệu thực tế từ các nguồn đáng tin cậy.
3. Case studies: Cung cấp ít nhất 1-2 ví dụ thực tế điển hình liên quan đến chủ đề.
4. Phân tích xu hướng: Nêu bật các xu hướng hiện tại và dự đoán trong tương lai.
5. Thực tiễn: Tập trung vào ứng dụng thực tế và giá trị của chủ đề.
6. Ngắn gọn nhưng đầy đủ: Mỗi slide phải súc tích nhưng vẫn đủ thông tin.
7. Cấu trúc rõ ràng: Sắp xếp thông tin theo trình tự logic với liên kết giữa các phần.

Format JSON trả về như sau:
{
  "title": "Tiêu đề bài thuyết trình",
  "description": "Mô tả ngắn về bài thuyết trình",
  "slides": [
    {
      "title": "Tiêu đề slide",
      "content": "Nội dung slide với định dạng súc tích và dễ hiểu",
      "notes": "Ghi chú cho người thuyết trình (không hiển thị trong slide)",
      "keywords": ["từ_khóa_1", "từ_khóa_2"], // Từ khóa hình ảnh gợi ý nếu cần
      "slideType": "introduction|content|caseStudy|statistics|trends|conclusion|references" // Loại slide
    }
  ]
}

Hãy đảm bảo rằng bạn trả về CHÍNH XÁC định dạng JSON này, không thêm bất kỳ tiền tố hoặc hậu tố nào.
`;
};

/**
 * Tạo bài thuyết trình bằng OpenAI API
 * @param {Object} options - Tùy chọn bài thuyết trình
 * @param {string} [apiKey] - API key của OpenAI (tùy chọn, sẽ sử dụng key hệ thống nếu không cung cấp)
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình
 */
export const generatePresentation = async (options, apiKey) => {
  try {
    console.log("openaiService.js: Bắt đầu tạo bài thuyết trình với OpenAI");
    
    // Sử dụng API key được cung cấp hoặc API key hệ thống
    const effectiveApiKey = apiKey || SYSTEM_API_KEY;
    
    // Nếu không có API key hợp lệ hoặc đã cấu hình dùng fallback, chuyển sang tạo dữ liệu mẫu
    if (USE_FALLBACK || !effectiveApiKey || effectiveApiKey === 'sk-' || effectiveApiKey === '') {
      console.log('openaiService.js: Sử dụng dữ liệu mẫu thay thế');
      
      // Tạo dữ liệu mẫu có cấu trúc đầy đủ
      const fallbackData = createFallbackPresentation(options);
      
      // Giả lập độ trễ mạng để giao diện người dùng hiển thị tiến trình
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return fallbackData;
    }

    console.log("openaiService.js: Tạo prompt cho API");
    const prompt = createPresentationPrompt(options);
    
    const requestBody = {
      model: options.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp, chất lượng cao. Bạn có kiến thức sâu rộng về nhiều lĩnh vực và hiểu rõ nguyên tắc thiết kế bài thuyết trình hiệu quả. Bạn tạo nội dung phân tích sâu, sử dụng dữ liệu thực tế, case studies, và xu hướng hiện tại. Luôn trả về JSON theo định dạng yêu cầu, không thêm bất kỳ văn bản giải thích nào trước hoặc sau JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000 // Tăng max_tokens để đảm bảo đủ chỗ cho nội dung chất lượng cao
    };

    try {
      // Sử dụng model mạnh hơn cho chất lượng nội dung tốt hơn
      console.log(`openaiService.js: Đang gọi model ${requestBody.model}...`);
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(effectiveApiKey, requestBody));
      
      if (!response.ok) {
        console.error("openaiService.js: Lỗi từ API, status:", response.status);
        
        // Thử lại với model nhẹ hơn nếu gặp lỗi
        if (requestBody.model !== FALLBACK_MODEL) {
          console.log(`openaiService.js: Thử lại với model ${FALLBACK_MODEL}...`);
          requestBody.model = FALLBACK_MODEL;
          requestBody.max_tokens = 3000; // Giảm token để tương thích với model nhẹ hơn
          
          const fallbackResponse = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(effectiveApiKey, requestBody));
          
          if (!fallbackResponse.ok) {
            console.error("openaiService.js: Lỗi từ API khi dùng model dự phòng, status:", fallbackResponse.status);
            return createFallbackPresentation(options);
          }
          
          const fallbackData = await fallbackResponse.json();
          return processAPIResponse(fallbackData, options);
        }
        
        // Nếu API trả về lỗi và không thể thử lại, sử dụng dữ liệu mẫu thay thế
        return createFallbackPresentation(options);
      }
      
      const data = await response.json();
      return processAPIResponse(data, options);
    } catch (fetchError) {
      console.error("openaiService.js: Lỗi fetch:", fetchError);
      return createFallbackPresentation(options);
    }
  } catch (error) {
    console.error("openaiService.js: Lỗi tổng thể:", error);
    return createFallbackPresentation(options);
  }
};

/**
 * Xử lý phản hồi từ API OpenAI
 * @param {Object} data - Dữ liệu phản hồi từ API
 * @param {Object} options - Tùy chọn ban đầu để tạo fallback nếu cần
 * @returns {Object} - Dữ liệu bài thuyết trình đã xử lý
 */
function processAPIResponse(data, options) {
  if (data.choices && data.choices.length > 0) {
    const content = data.choices[0].message.content;
    
    try {
      // Phân tích cú pháp JSON từ phản hồi
      // Tìm từ dấu { đầu tiên đến dấu } cuối cùng
      const jsonStartIndex = content.indexOf('{');
      const jsonEndIndex = content.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
        let presentationData;
        
        try {
          presentationData = JSON.parse(jsonContent);
          
          // Đảm bảo dữ liệu có cấu trúc đúng
          if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
            throw new Error('Dữ liệu thiếu trường slides hoặc không đúng định dạng');
          }
          
          // Đảm bảo mỗi slide có đủ các trường cần thiết
          presentationData.slides = presentationData.slides.map((slide, index) => {
            return {
              title: slide.title || `Slide ${index + 1}`,
              content: slide.content || '',
              notes: slide.notes || '',
              keywords: Array.isArray(slide.keywords) ? slide.keywords : [],
              slideType: slide.slideType || 'content'
            };
          });
          
          return presentationData;
        } catch (parseError) {
          console.error('openaiService.js: Lỗi phân tích JSON:', parseError);
          return createFallbackPresentation(options);
        }
      } else {
        console.error('openaiService.js: Không tìm thấy JSON hợp lệ trong phản hồi');
        return createFallbackPresentation(options);
      }
    } catch (error) {
      console.error('openaiService.js: Lỗi xử lý phản hồi:', error);
      return createFallbackPresentation(options);
    }
  } else {
    console.error('openaiService.js: Không có choices trong phản hồi');
    return createFallbackPresentation(options);
  }
}

/**
 * Cải thiện nội dung slide hiện có
 * @param {string} content - Nội dung cần cải thiện
 * @param {string} [apiKey] - API key của OpenAI (tùy chọn, sẽ sử dụng key hệ thống nếu không cung cấp)
 * @returns {Promise<string>} - Nội dung được cải thiện
 */
export const enhanceSlideContent = async (content, apiKey) => {
  try {
    // Sử dụng API key được cung cấp hoặc API key hệ thống
    const effectiveApiKey = apiKey || SYSTEM_API_KEY;
    
    // Nếu không có API key hợp lệ, trả về nội dung ban đầu
    if (!effectiveApiKey || effectiveApiKey === 'sk-') {
      console.log('Không có API key hợp lệ để cải thiện nội dung');
      return content;
    }
    
    if (!content || content.trim().length < 10) {
      console.log('Nội dung quá ngắn để cải thiện');
      return content;
    }
    
    const requestBody = {
      model: 'gpt-3.5-turbo', // Sử dụng model rẻ hơn cho tác vụ đơn giản
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia về tạo nội dung bài thuyết trình. Nhiệm vụ của bạn là cải thiện nội dung slide để nó trở nên súc tích, rõ ràng, và hiệu quả hơn. Giữ nguyên thông tin quan trọng, loại bỏ những gì thừa, và làm cho nội dung dễ đọc và ghi nhớ hơn. Chỉ trả về nội dung đã được cải thiện, không thêm giải thích hay bình luận.'
        },
        {
          role: 'user',
          content: `Hãy cải thiện nội dung slide sau đây để nó ngắn gọn, súc tích, dễ hiểu và thu hút hơn, phù hợp với bài thuyết trình chuyên nghiệp:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    // Sử dụng Fetch API với timeout để tránh chờ quá lâu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout sau 10 giây
    
    try {
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        ...createRequestOptions(effectiveApiKey, requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Lỗi từ API khi cải thiện nội dung:', response.status);
        return content; // Trả về nội dung ban đầu nếu có lỗi
      }
      
      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const enhancedContent = data.choices[0].message.content;
        
        // Đảm bảo nội dung cải thiện không quá ngắn
        if (enhancedContent && enhancedContent.length > content.length / 2) {
          return enhancedContent;
        }
        
        console.log('Nội dung cải thiện quá ngắn, giữ nguyên nội dung ban đầu');
        return content;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Lỗi khi gọi API cải thiện nội dung:', fetchError);
      // Tiếp tục với nội dung ban đầu
    }
    
    return content; // Trả về nội dung ban đầu nếu không thành công
  } catch (error) {
    console.error('Error enhancing slide content:', error);
    return content; // Trả về nội dung ban đầu khi có lỗi
  }
};

/**
 * Đề xuất hình ảnh dựa trên nội dung slide
 * @param {string} slideContent - Nội dung slide
 * @param {string} apiKey - API key của OpenAI
 * @returns {Promise<Array>} - Mảng các từ khóa tìm kiếm hình ảnh
 */
export const suggestImageKeywords = async (slideContent, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API Key không được cung cấp');
    }
    
    // Nếu nội dung quá ngắn, sử dụng từ khóa mặc định
    if (!slideContent || slideContent.trim().length < 10) {
      return ['presentation', 'slides', 'business'];
    }
    
    const requestBody = {
      model: 'gpt-3.5-turbo', // Sử dụng model rẻ hơn cho tác vụ đơn giản
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia về tìm kiếm và gợi ý hình ảnh phù hợp cho bài thuyết trình. Nhiệm vụ của bạn là phân tích nội dung và đề xuất từ khóa tìm kiếm hình ảnh phù hợp, có tính thẩm mỹ và chuyên nghiệp. Chỉ trả về một mảng JSON với các từ khóa, không có giải thích hoặc văn bản khác.'
        },
        {
          role: 'user',
          content: `Dựa trên nội dung slide sau, hãy đề xuất 3 từ khóa tìm kiếm hình ảnh phù hợp. Trả về dưới dạng mảng JSON, mỗi từ khóa nên ngắn gọn (1-3 từ) và có tính minh họa cao.\n\n${slideContent}`
        }
      ],
      temperature: 0.6,
      max_tokens: 150
    };

    // Sử dụng Fetch API
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(apiKey, requestBody));
    
    if (!response.ok) {
      console.error('Lỗi từ API:', response.status);
      return getDefaultImageKeywords(slideContent); // Trả về từ khóa mặc định
    }
    
    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      
      try {
        // Cố gắng phân tích JSON từ phản hồi
        const jsonMatch = content.match(/\[.*\]/s);
        if (jsonMatch) {
          const parsedArray = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedArray) && parsedArray.length > 0) {
            return parsedArray.filter(item => typeof item === 'string' && item.length > 0);
          }
        }
        
        const parsedResponse = JSON.parse(content);
        if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
          return parsedResponse.filter(item => typeof item === 'string' && item.length > 0);
        }
        
        if (parsedResponse.keywords && Array.isArray(parsedResponse.keywords)) {
          return parsedResponse.keywords.filter(item => typeof item === 'string' && item.length > 0);
        }
        
        // Nếu không có kết quả hợp lệ, sử dụng phương pháp trích xuất từ văn bản
        return extractKeywordsFromText(content);
      } catch (e) {
        console.error('Lỗi phân tích JSON trong suggestImageKeywords:', e);
        return extractKeywordsFromText(content);
      }
    }
    
    return getDefaultImageKeywords(slideContent);
  } catch (error) {
    console.error('Error suggesting image keywords:', error);
    return getDefaultImageKeywords(slideContent);
  }
};

/**
 * Trích xuất từ khóa từ văn bản
 * @param {string} text - Văn bản để trích xuất
 * @returns {Array} - Mảng các từ khóa
 */
function extractKeywordsFromText(text) {
  if (!text) return ['presentation', 'business', 'professional'];
  
  // Tìm các từ khóa trong dấu ngoặc kép hoặc đơn
  const keywordMatches = text.match(/"([^"]+)"|'([^']+)'/g);
  if (keywordMatches && keywordMatches.length > 0) {
    return keywordMatches.map(match => match.replace(/["']/g, '')).filter(keyword => keyword.length > 0);
  }
  
  // Trích xuất thủ công dựa trên dòng
  const extractedKeywords = text.split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0 && line.length < 30)
    .slice(0, 3);
  
  if (extractedKeywords.length > 0) {
    return extractedKeywords;
  }
  
  return ['presentation', 'business', 'professional'];
}

/**
 * Tạo từ khóa mặc định dựa trên nội dung
 * @param {string} content - Nội dung slide
 * @returns {Array} - Mảng các từ khóa mặc định
 */
function getDefaultImageKeywords(content) {
  if (!content || typeof content !== 'string') {
    return ['presentation', 'business', 'professional'];
  }
  
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('marketing') || lowerContent.includes('tiếp thị')) {
    return ['marketing', 'digital marketing', 'social media'];
  }
  
  if (lowerContent.includes('technology') || lowerContent.includes('công nghệ')) {
    return ['technology', 'innovation', 'digital'];
  }
  
  if (lowerContent.includes('education') || lowerContent.includes('giáo dục')) {
    return ['education', 'learning', 'teaching'];
  }
  
  if (lowerContent.includes('finance') || lowerContent.includes('tài chính')) {
    return ['finance', 'business chart', 'economy'];
  }
  
  if (lowerContent.includes('nature') || lowerContent.includes('thiên nhiên')) {
    return ['nature', 'landscape', 'environment'];
  }
  
  // Mặc định
  return ['presentation', 'business', 'professional'];
}

/**
 * Dịch thuật nội dung sang ngôn ngữ khác
 * @param {string} content - Nội dung cần dịch
 * @param {string} targetLanguage - Mã ngôn ngữ đích (vd: 'en', 'vi', 'fr')
 * @param {string} apiKey - API key của OpenAI
 * @returns {Promise<string>} - Nội dung đã được dịch
 */
export const translateContent = async (content, targetLanguage, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API Key không được cung cấp');
    }
    
    let languageName = '';
    switch (targetLanguage) {
      case 'en': languageName = 'Tiếng Anh'; break;
      case 'vi': languageName = 'Tiếng Việt'; break;
      case 'fr': languageName = 'Tiếng Pháp'; break;
      case 'ja': languageName = 'Tiếng Nhật'; break;
      case 'ko': languageName = 'Tiếng Hàn'; break;
      case 'zh': languageName = 'Tiếng Trung'; break;
      default: languageName = targetLanguage;
    }
    
    const requestBody = {
      model: 'gpt-3.5-turbo', // Sử dụng model rẻ hơn cho tác vụ dịch thuật
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia dịch thuật. Nhiệm vụ của bạn là dịch nội dung sang ${languageName} một cách chính xác, tự nhiên và phù hợp với ngữ cảnh. Giữ nguyên định dạng và cấu trúc của nội dung gốc.`
        },
        {
          role: 'user',
          content: `Hãy dịch nội dung sau sang ${languageName}:\n\n${content}`
        }
      ],
      temperature: 0.3, // Nhiệt độ thấp cho kết quả nhất quán
      max_tokens: 1500
    };

    // Sử dụng Fetch API
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(apiKey, requestBody));
    
    if (!response.ok) {
      return content; // Trả về nội dung gốc nếu có lỗi
    }
    
    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    
    return content; // Trả về nội dung gốc nếu không thành công
  } catch (error) {
    console.error('Error translating content:', error);
    return content; // Trả về nội dung gốc khi có lỗi
  }
};

/**
 * Tạo bài thuyết trình mẫu khi không có API key hoặc API lỗi
 * @param {Object} options - Tùy chọn bài thuyết trình
 * @returns {Object} - Dữ liệu bài thuyết trình mẫu
 */
function createFallbackPresentation(options) {
  const { topic } = options;
  const slides = options.slides || 5;
  
  // Tạo tiêu đề bài thuyết trình
  const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  
  // Tạo mảng slide
  const presentationSlides = [];
  
  // Slide đầu tiên (trang bìa)
  presentationSlides.push({
    title: title,
    content: `Bài thuyết trình về ${topic}`,
    notes: `Giới thiệu bản thân và mục tiêu của bài thuyết trình về ${topic}`,
    keywords: [topic, 'presentation', 'intro']
  });
  
  // Slide thứ hai (giới thiệu)
  presentationSlides.push({
    title: "Giới thiệu",
    content: `- Tổng quan về ${topic}\n- Tầm quan trọng\n- Mục tiêu của bài thuyết trình`,
    notes: "Giải thích ngắn gọn về chủ đề và lý do tại sao nó quan trọng",
    keywords: ["overview", topic, "introduction"]
  });
  
  // Các slide nội dung chính
  for (let i = 3; i <= slides - 1; i++) {
    const slideTitle = `Phần ${i-2}: ${getContentTitle(topic, i-2)}`;
    const slideContent = getContentForSlide(topic, i-2);
    
    presentationSlides.push({
      title: slideTitle,
      content: slideContent,
      notes: `Trình bày về ${slideTitle}. Nhấn mạnh các điểm chính.`,
      keywords: getKeywordsForSlide(topic, i-2)
    });
  }
  
  // Slide cuối cùng (kết luận)
  presentationSlides.push({
    title: "Kết luận",
    content: `- Tóm tắt các điểm chính\n- Lợi ích của ${topic}\n- Cảm ơn và Q&A`,
    notes: "Tóm tắt những gì đã trình bày và mở phần hỏi đáp",
    keywords: ["conclusion", "summary", topic]
  });
  
  // Trả về dữ liệu bài thuyết trình hoàn chỉnh
  return {
    title: title,
    description: `Bài thuyết trình về ${topic}`,
    slides: presentationSlides
  };
}

/**
 * Tạo tiêu đề nội dung dựa trên chủ đề và số thứ tự
 * @param {string} topic - Chủ đề
 * @param {number} index - Số thứ tự
 * @returns {string} - Tiêu đề nội dung
 */
function getContentTitle(topic, index) {
  const titles = [
    "Tổng quan",
    "Lợi ích chính",
    "Các yếu tố cần thiết",
    "Phương pháp tiếp cận",
    "Ứng dụng thực tế",
    "Xu hướng mới nhất",
    "Thách thức và giải pháp",
    "Nghiên cứu trường hợp",
    "So sánh và đánh giá",
    "Triển vọng tương lai"
  ];
  
  return titles[index % titles.length];
}

/**
 * Tạo nội dung cho slide dựa trên chủ đề và số thứ tự
 * @param {string} topic - Chủ đề
 * @param {number} index - Số thứ tự
 * @returns {string} - Nội dung slide
 */
function getContentForSlide(topic, index) {
  switch (index % 5) {
    case 0:
      return `- Định nghĩa về ${topic}\n- Lịch sử phát triển\n- Tầm quan trọng trong bối cảnh hiện tại\n- Các khái niệm cơ bản`;
    case 1:
      return `- Lợi ích chính của ${topic}\n- Tác động tích cực\n- Tiềm năng ứng dụng\n- Nghiên cứu và số liệu`;
    case 2:
      return `- Các thành phần chính của ${topic}\n- Yếu tố then chốt\n- Mối quan hệ giữa các yếu tố\n- Tiêu chuẩn đánh giá`;
    case 3:
      return `- Phương pháp triển khai ${topic}\n- Các bước thực hiện\n- Công cụ và kỹ thuật\n- Quy trình tối ưu`;
    case 4:
      return `- Ví dụ thực tế về ${topic}\n- Kết quả đạt được\n- Bài học kinh nghiệm\n- Hướng phát triển`;
    default:
      return `- Thông tin quan trọng về ${topic}\n- Điểm cần lưu ý\n- Đề xuất và khuyến nghị`;
  }
}

/**
 * Tạo từ khóa cho slide dựa trên chủ đề và số thứ tự
 * @param {string} topic - Chủ đề
 * @param {number} index - Số thứ tự
 * @returns {Array} - Mảng từ khóa
 */
function getKeywordsForSlide(topic, index) {
  const baseKeywords = [topic];
  
  switch (index % 5) {
    case 0:
      return [...baseKeywords, "overview", "introduction", "concept"];
    case 1:
      return [...baseKeywords, "benefits", "advantages", "statistics"];
    case 2:
      return [...baseKeywords, "elements", "components", "structure"];
    case 3:
      return [...baseKeywords, "methods", "approach", "implementation"];
    case 4:
      return [...baseKeywords, "examples", "case study", "results"];
    default:
      return [...baseKeywords, "information", "notes", "summary"];
  }
}
