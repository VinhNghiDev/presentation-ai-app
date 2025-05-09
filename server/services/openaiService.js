const axios = require('axios');
const config = require('../config/config');

/**
 * Gọi OpenAI API
 * @param {Object} options - Tùy chọn cho API
 * @param {string} apiKey - API key (tùy chọn, mặc định lấy từ config)
 * @returns {Promise<string>} - Nội dung phản hồi
 */
async function callOpenAI(options, apiKey = config.OPENAI_API_KEY) {
  const { model = config.DEFAULT_MODEL, messages, temperature = 0.7, maxTokens = 3000 } = options;
  
  const requestBody = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };
  
  const response = await axios.post(
    `${config.OPENAI_API_URL}/chat/completions`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );
  
  if (response.data && response.data.choices && response.data.choices.length > 0) {
    return response.data.choices[0].message.content;
  } else {
    throw new Error('Không nhận được phản hồi hợp lệ từ OpenAI API');
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