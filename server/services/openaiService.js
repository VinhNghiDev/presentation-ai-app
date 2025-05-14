const axios = require('axios');
const config = require('../config/config');

/**
 * Kiểm tra API key có hợp lệ không
 * @param {string} apiKey - API key cần kiểm tra
 * @returns {boolean} - Kết quả kiểm tra
 */
function isValidApiKey(apiKey) {
  return apiKey && 
         apiKey !== 'your_openai_api_key_here' && 
         apiKey.startsWith('sk-');
}

/**
 * Gọi OpenAI API
 * @param {Object} options - Tùy chọn cho API
 * @param {string} apiKey - API key (tùy chọn, mặc định lấy từ config)
 * @returns {Promise<string>} - Nội dung phản hồi
 */
async function callOpenAI(options, apiKey = config.OPENAI_API_KEY) {
  // Kiểm tra API key
  if (!isValidApiKey(apiKey)) {
    throw new Error('API key không hợp lệ hoặc không được cung cấp');
  }

  const { model = config.DEFAULT_MODEL, messages, temperature = 0.7, maxTokens = 3000 } = options;
  
  const requestBody = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };
  
  try {
    // Đảm bảo URL đúng và đầy đủ
    const apiUrl = `${config.OPENAI_API_URL}/chat/completions`;
    console.log('Calling OpenAI API at:', apiUrl);
    
    const response = await axios.post(
      apiUrl,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000 // Timeout sau 30 giây
      }
    );
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Không nhận được phản hồi hợp lệ từ OpenAI API');
    }
  } catch (error) {
    if (error.response) {
      // Lỗi từ API
      console.error('OpenAI API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(`OpenAI API error: ${error.response.data.error?.message || error.message}`);
    } else if (error.request) {
      // Không nhận được phản hồi
      console.error('No response from OpenAI API:', error.request);
      throw new Error('Không thể kết nối đến OpenAI API');
    } else {
      // Lỗi khác
      console.error('Error calling OpenAI API:', error.message);
      throw new Error(`Lỗi khi gọi OpenAI API: ${error.message}`);
    }
  }
}

/**
 * Gọi OpenAI API để tạo bài thuyết trình
 * @param {string} prompt - Prompt cho API
 * @param {string} apiKey - API key (tùy chọn)
 * @returns {Promise<Object>} - Dữ liệu bài thuyết trình
 */
async function callOpenAIForPresentation(prompt, apiKey = config.OPENAI_API_KEY) {
  try {
    const messages = [
      {
        role: 'system',
        content: `Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp, chất lượng cao. 
Bạn có kiến thức sâu rộng về nhiều lĩnh vực và hiểu rõ nguyên tắc thiết kế bài thuyết trình hiệu quả.
Bạn tạo nội dung phân tích sâu, sử dụng dữ liệu thực tế, case studies, và xu hướng hiện tại.
Luôn trả về JSON theo định dạng yêu cầu, không thêm bất kỳ văn bản giải thích nào trước hoặc sau JSON.`
      },
      { role: 'user', content: prompt }
    ];
    
    const completionResponse = await callOpenAI({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      maxTokens: 4000
    }, apiKey);
    
    // Phân tích JSON từ phản hồi
    try {
      // Tìm và phân tích JSON
      const jsonStartIndex = completionResponse.indexOf('{');
      const jsonEndIndex = completionResponse.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonContent = completionResponse.substring(jsonStartIndex, jsonEndIndex);
        return JSON.parse(jsonContent);
      } else {
        throw new Error('Không tìm thấy JSON trong phản hồi');
      }
    } catch (parseError) {
      console.error('Lỗi phân tích JSON:', parseError);
      throw new Error('Không thể phân tích JSON từ phản hồi');
    }
  } catch (error) {
    console.error('Lỗi khi gọi OpenAI API:', error);
    throw error;
  }
}

/**
 * Gọi OpenAI API để nâng cao nội dung slide
 * @param {string} prompt - Prompt cho API
 * @param {string} apiKey - API key (tùy chọn)
 * @returns {Promise<string>} - Nội dung đã được nâng cao
 */
async function callOpenAIForEnhancement(prompt, apiKey = config.OPENAI_API_KEY) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'Bạn là chuyên gia cải thiện nội dung bài thuyết trình. Hãy nâng cao chất lượng nội dung.'
      },
      { role: 'user', content: prompt }
    ];
    
    return await callOpenAI({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      maxTokens: 2000
    }, apiKey);
  } catch (error) {
    console.error('Lỗi khi nâng cao nội dung:', error);
    throw error;
  }
}

module.exports = {
  callOpenAI,
  callOpenAIForPresentation,
  callOpenAIForEnhancement
}; 