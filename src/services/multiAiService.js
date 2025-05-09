/**
 * Dịch vụ tích hợp nhiều nền tảng AI
 * Hỗ trợ tích hợp OpenAI, Anthropic Claude, Google Gemini
 */

import { 
  AI_PROVIDERS, 
  AI_CONFIG, 
  getProviderConfig, 
  hasValidApiKey,
  getDefaultModel,
  getFallbackModel
} from './aiConfig';

/**
 * Lấy thông tin nhà cung cấp AI từ tên model
 * @param {string} modelName - Tên model AI
 * @returns {string} - Khóa của nhà cung cấp
 */
function getProviderFromModel(modelName) {
  if (!modelName) return AI_CONFIG.defaultProvider;
  
  for (const [providerKey, provider] of Object.entries(AI_PROVIDERS)) {
    const modelValues = Object.values(provider.models);
    if (modelValues.includes(modelName)) {
      return providerKey;
    }
  }
  
  return AI_CONFIG.defaultProvider;
}

/**
 * Tạo cấu trúc request body cho OpenAI API
 * @param {Object} options - Các tùy chọn cho yêu cầu
 * @returns {Object} - Request body cho API
 */
function createOpenAIRequestBody(options) {
  const {
    model = getDefaultModel('OPENAI'),
    messages,
    temperature = AI_CONFIG.defaultTemperature,
    maxTokens = AI_CONFIG.defaultMaxOutputTokens,
    topP = AI_CONFIG.defaultTopP
  } = options;
  
  return {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    top_p: topP
  };
}

/**
 * Tạo cấu trúc request body cho Anthropic Claude API
 * @param {Object} options - Các tùy chọn cho yêu cầu
 * @returns {Object} - Request body cho API
 */
function createClaudeRequestBody(options) {
  const {
    model = getDefaultModel('CLAUDE'),
    messages,
    temperature = AI_CONFIG.defaultTemperature,
    maxTokens = AI_CONFIG.defaultMaxOutputTokens
  } = options;
  
  // Chuyển đổi từ định dạng messages của OpenAI sang Claude
  const system = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');
  
  return {
    model,
    messages: userMessages,
    system: system,
    temperature,
    max_tokens: maxTokens
  };
}

/**
 * Tạo cấu trúc request body cho Gemini API
 * @param {Object} options - Các tùy chọn cho yêu cầu
 * @returns {Object} - Request body cho API
 */
function createGeminiRequestBody(options) {
  const {
    model = getDefaultModel('GEMINI'),
    messages,
    temperature = AI_CONFIG.defaultTemperature,
    maxTokens = AI_CONFIG.defaultMaxOutputTokens,
    topP = AI_CONFIG.defaultTopP
  } = options;
  
  // Chuyển đổi messages thành gemini format
  const geminiMessages = messages.map(msg => {
    if (msg.role === 'system') {
      // Gemini không có system message, chuyển thành user message
      return { role: 'user', parts: [{ text: msg.content }] };
    } else {
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      };
    }
  });
  
  return {
    model: `${model}`, // Đảm bảo là string
    contents: geminiMessages,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP
    }
  };
}

/**
 * Tạo cấu trúc yêu cầu tùy thuộc vào nhà cung cấp
 * @param {string} provider - Khóa của nhà cung cấp
 * @param {Object} options - Các tùy chọn cho yêu cầu
 * @returns {Object} - Request body cho API
 */
function createRequestBodyForProvider(provider, options) {
  switch (provider) {
    case 'OPENAI':
      return createOpenAIRequestBody(options);
    case 'CLAUDE':
      return createClaudeRequestBody(options);
    case 'GEMINI':
      return createGeminiRequestBody(options);
    default:
      return createOpenAIRequestBody(options);
  }
}

/**
 * Tạo request options cho Fetch API
 * @param {string} provider - Khóa của nhà cung cấp
 * @param {string} apiKey - API key cho nhà cung cấp
 * @param {Object} body - Request body
 * @returns {Object} - Request options cho fetch
 */
function createRequestOptions(provider, apiKey, body) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  switch (provider) {
    case 'OPENAI':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'CLAUDE':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'GEMINI':
      // Gemini sử dụng API key trong URL query parameter thay vì header
      break;
    default:
      headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  return {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  };
}

/**
 * Xử lý phản hồi từ API tùy thuộc vào nhà cung cấp
 * @param {Object} response - Phản hồi từ API
 * @param {string} provider - Khóa của nhà cung cấp
 * @returns {string} - Nội dung phản hồi
 */
function processApiResponse(response, provider) {
  switch (provider) {
    case 'OPENAI':
      return response.choices[0].message.content;
    case 'CLAUDE':
      return response.content[0].text;
    case 'GEMINI':
      return response.candidates[0].content.parts[0].text;
    default:
      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      }
      throw new Error('Không thể xử lý phản hồi từ AI');
  }
}

/**
 * Gọi API AI từ nhiều nhà cung cấp khác nhau
 * @param {Object} options - Các tùy chọn cho yêu cầu
 * @param {string} customApiKey - API key tùy chỉnh (nếu có)
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
export async function callAiApi(options, customApiKey = null) {
  // Xác định model và provider
  const modelName = options.model || getDefaultModel(AI_CONFIG.defaultProvider);
  const providerKey = getProviderFromModel(modelName);
  const provider = getProviderConfig(providerKey);
  
  // Chọn API key
  const apiKey = customApiKey || AI_CONFIG.apiKeys[providerKey];
  
  // Kiểm tra API key
  if (!apiKey && !AI_CONFIG.useFallback) {
    throw new Error(`API key cho ${provider.name} không được cung cấp`);
  }
  
  // Nếu không có API key hợp lệ và cấu hình sử dụng dữ liệu mẫu
  if (!apiKey && AI_CONFIG.useFallback) {
    console.log(`multiAiService: Không có API key cho ${provider.name}, sử dụng dữ liệu mẫu`);
    // Giả lập độ trễ mạng để giao diện người dùng hiển thị tiến trình
    await new Promise(resolve => setTimeout(resolve, 1500));
    return 'Đây là dữ liệu mẫu từ AI khi không có API key';
  }
  
  // Sử dụng proxy server nếu được cấu hình
  if (AI_CONFIG.useServerProxy) {
    return callServerProxyApi(options, apiKey, providerKey);
  }
  
  // Tạo request body tùy thuộc vào nhà cung cấp
  const requestBody = createRequestBodyForProvider(providerKey, options);
  
  // Tạo URL cho API call
  let apiUrl;
  switch (providerKey) {
    case 'OPENAI':
      apiUrl = `${provider.apiUrl}/chat/completions`;
      break;
    case 'CLAUDE':
      apiUrl = provider.apiUrl;
      break;
    case 'GEMINI':
      apiUrl = `${provider.apiUrl}/${modelName}:generateContent?key=${apiKey}`;
      break;
    default:
      apiUrl = `${provider.apiUrl}/chat/completions`;
  }
  
  try {
    // Tạo request options
    const requestOptions = createRequestOptions(providerKey, apiKey, requestBody);
    
    // Gọi API
    const response = await fetch(apiUrl, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Lỗi từ ${provider.name} API:`, errorData);
      
      // Nếu sử dụng model cao cấp thất bại, thử lại với model dự phòng
      if (modelName !== provider.fallbackModel) {
        console.log(`Thử lại với model dự phòng: ${provider.fallbackModel}`);
        return callAiApi({
          ...options,
          model: provider.fallbackModel
        }, apiKey);
      }
      
      throw new Error(errorData.error?.message || `Lỗi từ ${provider.name} API: ${response.status}`);
    }
    
    const data = await response.json();
    return processApiResponse(data, providerKey);
  } catch (error) {
    console.error(`Lỗi khi gọi ${provider.name} API:`, error);
    
    // Thử lại với model dự phòng nếu chưa thử
    if (modelName !== provider.fallbackModel) {
      console.log(`Thử lại với model dự phòng: ${provider.fallbackModel}`);
      return callAiApi({
        ...options,
        model: provider.fallbackModel
      }, apiKey);
    }
    
    throw error;
  }
}

/**
 * Gọi API AI thông qua server proxy
 * @param {Object} options - Các tùy chọn cho yêu cầu
 * @param {string} apiKey - API key cho nhà cung cấp
 * @param {string} providerKey - Khóa của nhà cung cấp
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
async function callServerProxyApi(options, apiKey, providerKey) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  try {
    const response = await fetch(`${API_BASE_URL}/ai/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        options,
        provider: providerKey,
        apiKey
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Lỗi từ server proxy: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Lỗi khi gọi API qua server proxy:', error);
    throw error;
  }
}

/**
 * Tạo completion từ AI với nhiều provider khác nhau
 * @param {string} prompt - Prompt cho AI
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
export async function generateCompletion(prompt, options = {}) {
  const {
    systemPrompt = 'Bạn là trợ lý AI hữu ích, cung cấp thông tin chính xác, đầy đủ và hữu ích.',
    model = getDefaultModel(AI_CONFIG.defaultProvider),
    temperature = AI_CONFIG.defaultTemperature,
    maxTokens = AI_CONFIG.defaultMaxOutputTokens,
    apiKey = null
  } = options;
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];
  
  return callAiApi({
    model,
    messages,
    temperature,
    maxTokens
  }, apiKey);
}

/**
 * Tạo chat completion từ AI với nhiều provider khác nhau
 * @param {Array} messages - Mảng các message theo định dạng OpenAI
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
export async function generateChatCompletion(messages, options = {}) {
  const {
    model = getDefaultModel(AI_CONFIG.defaultProvider),
    temperature = AI_CONFIG.defaultTemperature,
    maxTokens = AI_CONFIG.defaultMaxOutputTokens,
    apiKey = null
  } = options;
  
  return callAiApi({
    model,
    messages,
    temperature,
    maxTokens
  }, apiKey);
}

export default {
  generateCompletion,
  generateChatCompletion,
  callAiApi
}; 