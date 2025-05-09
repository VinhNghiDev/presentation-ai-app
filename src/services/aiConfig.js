/**
 * Cấu hình cho các dịch vụ AI API được sử dụng trong ứng dụng
 * Tệp này chứa các thông tin cấu hình cho việc tích hợp nhiều dịch vụ AI khác nhau
 */

// Liệt kê các API endpoints cho mỗi nhà cung cấp dịch vụ AI
export const AI_PROVIDERS = {
  OPENAI: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    models: {
      GPT_35_TURBO: 'gpt-3.5-turbo',
      GPT_4: 'gpt-4',
      GPT_4_TURBO: 'gpt-4-turbo-preview',
      GPT_4o: 'gpt-4o',  // Model mới nhất với khả năng cao
    },
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-3.5-turbo',
    maxTokens: {
      'gpt-4o': 4096,
      'gpt-4-turbo-preview': 4096,
      'gpt-4': 4096,
      'gpt-3.5-turbo': 4096
    }
  },
  CLAUDE: {
    name: 'Anthropic Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: {
      CLAUDE_3_OPUS: 'claude-3-opus-20240229',
      CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
      CLAUDE_3_HAIKU: 'claude-3-haiku-20240307'
    },
    defaultModel: 'claude-3-sonnet-20240229',
    fallbackModel: 'claude-3-haiku-20240307',
    maxTokens: {
      'claude-3-opus-20240229': 4096,
      'claude-3-sonnet-20240229': 4096,
      'claude-3-haiku-20240307': 4096
    }
  },
  GEMINI: {
    name: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      GEMINI_PRO: 'gemini-pro',
      GEMINI_ULTRA: 'gemini-ultra'
    },
    defaultModel: 'gemini-pro',
    fallbackModel: 'gemini-pro',
    maxTokens: {
      'gemini-pro': 4096,
      'gemini-ultra': 8192
    }
  }
};

// Cấu hình chung cho API AI
export const AI_CONFIG = {
  defaultProvider: 'OPENAI',
  defaultTimeoutMs: 60000,
  maxRetries: 2,
  retryDelayMs: 1000,
  useServerProxy: true, // Sử dụng proxy qua server để bảo vệ API key
  
  // Các giá trị mặc định cho các thông số gọi API
  defaultTemperature: 0.7,
  defaultMaxOutputTokens: 3000,
  defaultTopP: 0.9,
  
  // Cấu hình fallback
  useFallback: process.env.REACT_APP_USE_FALLBACK === 'true' || false,
  
  // Biến môi trường cho API Keys (ưu tiên lấy từ môi trường)
  apiKeys: {
    OPENAI: process.env.REACT_APP_OPENAI_API_KEY || '',
    CLAUDE: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
    GEMINI: process.env.REACT_APP_GEMINI_API_KEY || ''
  }
};

/**
 * Lấy thông tin cấu hình cho nhà cung cấp AI
 * @param {string} providerKey - Khóa của nhà cung cấp (OPENAI, CLAUDE, GEMINI)
 * @returns {Object} - Thông tin cấu hình
 */
export function getProviderConfig(providerKey) {
  // Nếu không cung cấp provider hoặc provider không hợp lệ, trả về nhà cung cấp mặc định
  if (!providerKey || !AI_PROVIDERS[providerKey]) {
    return AI_PROVIDERS[AI_CONFIG.defaultProvider];
  }
  
  return AI_PROVIDERS[providerKey];
}

/**
 * Kiểm tra API key có sẵn cho provider
 * @param {string} providerKey - Khóa của nhà cung cấp
 * @returns {boolean} - API key có hợp lệ hay không
 */
export function hasValidApiKey(providerKey) {
  const apiKey = AI_CONFIG.apiKeys[providerKey];
  return Boolean(apiKey) && apiKey !== 'your_api_key_here' && apiKey.length > 10;
}

/**
 * Lấy thông tin model AI mặc định cho một nhà cung cấp
 * @param {string} providerKey - Khóa của nhà cung cấp
 * @returns {string} - Tên model mặc định
 */
export function getDefaultModel(providerKey) {
  const provider = getProviderConfig(providerKey);
  return provider.defaultModel;
}

/**
 * Lấy thông tin model AI dự phòng cho một nhà cung cấp
 * @param {string} providerKey - Khóa của nhà cung cấp 
 * @returns {string} - Tên model dự phòng
 */
export function getFallbackModel(providerKey) {
  const provider = getProviderConfig(providerKey);
  return provider.fallbackModel;
}

export default {
  AI_PROVIDERS,
  AI_CONFIG,
  getProviderConfig,
  hasValidApiKey,
  getDefaultModel,
  getFallbackModel
}; 