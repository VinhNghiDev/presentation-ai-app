// src/services/openaiService.js - Sử dụng Fetch API thay vì Axios

// Cấu hình OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4'; // hoặc 'gpt-3.5-turbo' cho chi phí thấp hơn

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
  const { topic, style, slides, language = 'vi' } = options;
  
  return `
Tạo một bài thuyết trình về chủ đề "${topic}" với ${slides} slides.
Phong cách: ${style}
Ngôn ngữ: ${language}

Format JSON trả về như sau:
{
  "title": "Tiêu đề bài thuyết trình",
  "slides": [
    {
      "title": "Tiêu đề slide",
      "content": "Nội dung slide",
      "notes": "Ghi chú cho slide (nếu có)"
    }
  ]
}

Mỗi slide nên có cấu trúc rõ ràng, nội dung ngắn gọn, súc tích. 
Không nên có quá nhiều chữ trên mỗi slide.
Tạo nội dung thu hút, chuyên nghiệp và dễ hiểu.
Đối với slide đầu tiên, hãy tạo một slide giới thiệu hấp dẫn.
Đối với slide cuối cùng, hãy tạo slide kết luận và tóm tắt các điểm chính.
`;
};

/**
 * Tạo bài thuyết trình bằng OpenAI API
 * @param {Object} options - Tùy chọn bài thuyết trình
 * @param {string} apiKey - API key của OpenAI
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình
 */
export const generatePresentation = async (options, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API Key không được cung cấp');
    }

    const prompt = createPresentationPrompt(options);
    
    const requestBody = {
      model: options.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    // Sử dụng Fetch API thay vì Axios
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(apiKey, requestBody));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      
      try {
        // Phân tích cú pháp JSON từ phản hồi
        const presentationData = JSON.parse(content);
        return presentationData;
      } catch (jsonError) {
        console.error('Lỗi phân tích JSON:', jsonError);
        
        // Nếu không phân tích được JSON, tạo dữ liệu có cấu trúc từ nội dung
        const fallbackData = {
          title: options.topic,
          slides: createFallbackSlides(content, options.slides)
        };
        
        return fallbackData;
      }
    } else {
      throw new Error('Không nhận được phản hồi hợp lệ từ OpenAI');
    }
  } catch (error) {
    console.error('Error generating presentation:', error);
    throw error;
  }
};

/**
 * Cải thiện nội dung slide hiện có
 * @param {string} content - Nội dung cần cải thiện
 * @param {string} apiKey - API key của OpenAI
 * @returns {Promise<string>} - Nội dung được cải thiện
 */
export const enhanceSlideContent = async (content, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API Key không được cung cấp');
    }
    
    const requestBody = {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia về tạo nội dung bài thuyết trình. Nhiệm vụ của bạn là cải thiện nội dung slide.'
        },
        {
          role: 'user',
          content: `Hãy cải thiện nội dung slide sau đây để nó ngắn gọn, súc tích, dễ hiểu và thu hút hơn:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    // Sử dụng Fetch API
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(apiKey, requestBody));
    
    if (!response.ok) {
      return content; // Trả về nội dung ban đầu nếu có lỗi
    }
    
    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
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
    
    const requestBody = {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia về tìm kiếm và gợi ý hình ảnh cho bài thuyết trình.'
        },
        {
          role: 'user',
          content: `Dựa trên nội dung slide sau, hãy đề xuất 3 từ khóa tìm kiếm hình ảnh phù hợp. Trả về dưới dạng danh sách JSON các cụm từ.\n\n${slideContent}`
        }
      ],
      temperature: 0.6,
      max_tokens: 150
    };

    // Sử dụng Fetch API
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, createRequestOptions(apiKey, requestBody));
    
    if (!response.ok) {
      return []; // Trả về mảng rỗng nếu có lỗi
    }
    
    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      
      try {
        // Cố gắng phân tích JSON từ phản hồi
        const parsedResponse = JSON.parse(content);
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        }
        return parsedResponse.keywords || [];
      } catch (e) {
        // Nếu không phải JSON, tìm các từ khóa từ văn bản
        const keywordMatches = content.match(/"([^"]+)"|'([^']+)'/g);
        if (keywordMatches) {
          return keywordMatches.map(match => match.replace(/["']/g, ''));
        }
        // Trích xuất thủ công dựa trên dòng
        return content.split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 3);
      }
    }
    
    return []; // Trả về mảng rỗng nếu không thành công
  } catch (error) {
    console.error('Error suggesting image keywords:', error);
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

/**
 * Tạo dữ liệu slide dự phòng khi không thể phân tích JSON
 * @param {string} content - Nội dung từ API
 * @param {number} slideCount - Số slide cần tạo
 * @returns {Array} - Mảng các slide
 */
function createFallbackSlides(content, slideCount) {
  // Tách nội dung thành từng phần dựa trên dòng trống
  const sections = content.split('\n\n');
  
  // Nếu không có đủ phần để tạo các slide
  if (sections.length < slideCount) {
    const slides = [];
    
    // Slide đầu tiên - Giới thiệu
    slides.push({
      title: "Giới thiệu",
      content: sections[0] || "Slide giới thiệu"
    });
    
    // Các slide nội dung
    for (let i = 1; i < slideCount - 1; i++) {
      slides.push({
        title: `Slide ${i + 1}`,
        content: sections[i] || `Nội dung cho slide ${i + 1}`
      });
    }
    
    // Slide cuối - Kết luận
    slides.push({
      title: "Kết luận",
      content: sections[sections.length - 1] || "Tóm tắt và kết luận"
    });
    
    return slides;
  }
  
  // Nếu có đủ nội dung
  return sections.slice(0, slideCount).map((section, index) => {
    // Tách dòng đầu tiên làm tiêu đề (nếu có)
    const lines = section.split('\n');
    const title = lines[0] || `Slide ${index + 1}`;
    const content = lines.length > 1 ? lines.slice(1).join('\n') : '';
    
    return {
      title,
      content
    };
  });
}