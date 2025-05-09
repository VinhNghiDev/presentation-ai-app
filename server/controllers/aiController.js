const config = require('../config/config');
const openaiService = require('../services/openaiService');
const demoService = require('../services/demoService');
const { createEnhancementPrompt } = require('../utils/promptUtils');

/**
 * Xử lý request gọi AI completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleAICompletion(req, res) {
  try {
    const { options, provider, apiKey } = req.body;
    
    if (!options || !options.messages) {
      return res.status(400).json({ error: 'Yêu cầu không hợp lệ. Thiếu options hoặc messages.' });
    }
    
    // Xác định API key và provider
    const providerKey = provider || 'OPENAI';
    let effectiveApiKey;
    
    // Sử dụng API key từ request (nếu có) hoặc từ biến môi trường
    switch (providerKey) {
      case 'OPENAI':
        effectiveApiKey = apiKey || config.OPENAI_API_KEY;
        break;
      case 'CLAUDE':
        effectiveApiKey = apiKey || config.CLAUDE_API_KEY;
        break;
      case 'GEMINI':
        effectiveApiKey = apiKey || config.GEMINI_API_KEY;
        break;
      default:
        effectiveApiKey = apiKey || config.OPENAI_API_KEY;
    }
    
    // Chế độ DEMO nếu không có API key hợp lệ
    if (!effectiveApiKey || effectiveApiKey === 'your_openai_api_key_here' || effectiveApiKey.startsWith('your_')) {
      console.log(`Đang chạy ở chế độ DEMO cho ${providerKey}`);
      const demoContent = demoService.generateDemoAIResponse(options);
      return res.json({ content: demoContent });
    }
    
    // Gọi OpenAI API
    const apiResponse = await openaiService.callOpenAI(options, effectiveApiKey);
    return res.json({ content: apiResponse });
  } catch (error) {
    console.error('Lỗi khi gọi AI API:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Lỗi server';
    res.status(status).json({ error: message });
  }
}

/**
 * Xử lý request nâng cao nội dung slide
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleEnhanceContent(req, res) {
  try {
    const { content, type = 'improve', provider = 'OPENAI', apiKey } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Thiếu nội dung cần nâng cao' });
    }
    
    // Tạo prompt cho việc nâng cao nội dung
    const prompt = createEnhancementPrompt(content, type);
    
    // Chế độ DEMO nếu không có API key hợp lệ
    const effectiveApiKey = apiKey || config.OPENAI_API_KEY;
    if (config.isDemoMode() || !effectiveApiKey || effectiveApiKey === 'your_openai_api_key_here') {
      console.log(`Đang chạy nâng cao nội dung ở chế độ DEMO`);
      return res.json({ 
        content: demoService.generateDemoAIResponse({
          messages: [{ role: 'user', content: prompt }]
        })
      });
    }
    
    // Gọi API để nâng cao nội dung
    const enhancedContent = await openaiService.callOpenAIForEnhancement(prompt, effectiveApiKey);
    
    return res.json({ content: enhancedContent });
  } catch (error) {
    console.error('Lỗi khi nâng cao nội dung:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Lỗi server';
    res.status(status).json({ error: message });
  }
}

module.exports = {
  handleAICompletion,
  handleEnhanceContent
}; 