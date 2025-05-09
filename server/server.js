// Đầu tiên, hãy tạo cấu trúc thư mục mới
// server/
//   - controllers/
//     - aiController.js
//     - presentationController.js
//   - services/
//     - openaiService.js
//     - claudeService.js
//     - geminiService.js
//     - demoService.js
//   - routes/
//     - aiRoutes.js
//     - presentationRoutes.js
//   - utils/
//     - promptUtils.js
//   - config/
//     - config.js
//   - server.js

// Nội dung mới cho server.js
// Thêm dotenv để đọc biến môi trường từ file .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { connectDB } = require('./config/dbConfig');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { requestLogger, errorLogger } = require('./utils/logger');
const auth = require('./middleware/auth');

// Import routes
const aiRoutes = require('./routes/aiRoutes');
const presentationRoutes = require('./routes/presentationRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');

// Config
const config = require('./config/config');

// Cấu hình
const PORT = config.PORT || 5000;

// API Keys từ biến môi trường
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API URLs
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';

// Models
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gpt-3.5-turbo';
const DEFAULT_CLAUDE_MODEL = process.env.DEFAULT_CLAUDE_MODEL || 'claude-3-haiku-20240307';
const DEFAULT_GEMINI_MODEL = process.env.DEFAULT_GEMINI_MODEL || 'gemini-pro';

// Chế độ DEMO khi không có API key nào hợp lệ
const DEMO_MODE = (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') && 
                 (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your_claude_api_key_here') &&
                 (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here');

// Kiểm tra API key
if (DEMO_MODE) {
  console.warn('Không có API key hợp lệ. Chạy ở chế độ DEMO.');
  console.warn('Trong chế độ DEMO, các API calls sẽ trả về dữ liệu mẫu thay vì gọi API thực.');
} else {
  console.log('Các API có sẵn:');
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') console.log('- OpenAI API');
  if (CLAUDE_API_KEY && CLAUDE_API_KEY !== 'your_claude_api_key_here') console.log('- Claude API');
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') console.log('- Gemini API');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', auth, require('./routes/userRoutes'));
app.use('/api/presentations', auth, require('./routes/presentationRoutes'));
app.use('/api/templates', auth, require('./routes/templateRoutes'));

// Kiểm tra kết nối
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server đang hoạt động',
    availableApis: config.getAvailableApis(),
    demoMode: config.isDemoMode(),
    databaseMode: global.useDemoDatabase ? 'demo' : 'mongodb'
  });
});

// API endpoint chung cho tất cả các dịch vụ AI
app.post('/api/ai/completion', async (req, res) => {
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
        effectiveApiKey = apiKey || OPENAI_API_KEY;
        break;
      case 'CLAUDE':
        effectiveApiKey = apiKey || CLAUDE_API_KEY;
        break;
      case 'GEMINI':
        effectiveApiKey = apiKey || GEMINI_API_KEY;
        break;
      default:
        effectiveApiKey = apiKey || OPENAI_API_KEY;
    }
    
    // Chế độ DEMO nếu không có API key hợp lệ
    if (!effectiveApiKey || effectiveApiKey === 'your_openai_api_key_here' || effectiveApiKey.startsWith('your_')) {
      console.log(`Đang chạy ở chế độ DEMO cho ${providerKey}`);
      const demoContent = generateDemoAIResponse(options);
      return res.json({ content: demoContent });
    }
    
    // Gọi API tương ứng
    let apiResponse;
    switch (providerKey) {
      case 'OPENAI':
        apiResponse = await callOpenAI(options, effectiveApiKey);
        break;
      case 'CLAUDE':
        apiResponse = await callClaude(options, effectiveApiKey);
        break;
      case 'GEMINI':
        apiResponse = await callGemini(options, effectiveApiKey);
        break;
      default:
        apiResponse = await callOpenAI(options, effectiveApiKey);
    }
    
    return res.json({ content: apiResponse });
  } catch (error) {
    console.error('Lỗi khi gọi AI API:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Lỗi server';
    res.status(status).json({ error: message });
  }
});

// API tạo bài thuyết trình
app.post('/api/presentation/generate', async (req, res) => {
  try {
    const { topic, style, slides, language, purpose, audience, includeCharts, includeImages, provider } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Chủ đề không được để trống' });
    }
    
    // Chế độ DEMO: Trả về dữ liệu mẫu
    if (DEMO_MODE) {
      console.log('Đang chạy tạo bài thuyết trình ở chế độ DEMO.');
      const demoData = generateDemoPresentation(topic, slides || 5, style);
      return res.json(demoData);
    }
    
    // Chế độ thực: Gọi API tương ứng
    // Tạo prompt cho AI
    const prompt = createPresentationPrompt({
      topic, style, slides, language, purpose, audience, includeCharts, includeImages
    });
    
    let apiKey, apiResponse;
    
    // Xác định API để sử dụng
    switch (provider) {
      case 'CLAUDE':
        apiKey = CLAUDE_API_KEY;
        if (!apiKey || apiKey === 'your_claude_api_key_here') {
          console.log('Claude API key không hợp lệ, sử dụng fallback.');
          apiResponse = await callOpenAIForPresentation(prompt);
        } else {
          apiResponse = await callClaudeForPresentation(prompt, apiKey);
        }
        break;
      case 'GEMINI':
        apiKey = GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          console.log('Gemini API key không hợp lệ, sử dụng fallback.');
          apiResponse = await callOpenAIForPresentation(prompt);
        } else {
          apiResponse = await callGeminiForPresentation(prompt, apiKey);
        }
        break;
      default:
        // Mặc định là OpenAI
        apiResponse = await callOpenAIForPresentation(prompt);
    }
    
    if (!apiResponse) {
      return res.status(500).json({ error: 'Không thể tạo bài thuyết trình' });
    }
    
    return res.json(apiResponse);
  } catch (error) {
    console.error('Lỗi tạo bài thuyết trình:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Lỗi server';
    res.status(status).json({ error: message });
  }
});

// Gọi OpenAI API
async function callOpenAI(options, apiKey) {
  const { model = DEFAULT_MODEL, messages, temperature = 0.7, maxTokens = 3000 } = options;
  
  const requestBody = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  };
  
  const response = await axios.post(
    `${OPENAI_API_URL}/chat/completions`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );
  
  return response.data.choices[0].message.content;
}

// Gọi Claude API
async function callClaude(options, apiKey) {
  const { model = DEFAULT_CLAUDE_MODEL, messages, temperature = 0.7, maxTokens = 3000 } = options;
  
  // Chuyển đổi từ định dạng messages của OpenAI sang Claude
  const system = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const requestBody = {
    model,
    messages: userMessages,
    system,
    temperature,
    max_tokens: maxTokens
  };
  
  const response = await axios.post(
    CLAUDE_API_URL,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    }
  );
  
  return response.data.content[0].text;
}

// Gọi Gemini API
async function callGemini(options, apiKey) {
  const { model = DEFAULT_GEMINI_MODEL, messages, temperature = 0.7, maxTokens = 3000 } = options;
  
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
  
  const requestBody = {
    contents: geminiMessages,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens
    }
  };
  
  const response = await axios.post(
    `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}

// Gọi OpenAI API cho bài thuyết trình
async function callOpenAIForPresentation(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('OpenAI API key không hợp lệ, trả về dữ liệu mẫu.');
    return null;
  }
  
  const requestBody = {
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp. Bạn có kiến thức sâu rộng về nhiều lĩnh vực và hiểu rõ nguyên tắc thiết kế bài thuyết trình hiệu quả. Luôn trả về JSON theo định dạng yêu cầu.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000
  };
  
  const response = await axios.post(
    `${OPENAI_API_URL}/chat/completions`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    }
  );
  
  if (response.data.choices && response.data.choices.length > 0) {
    const content = response.data.choices[0].message.content;
    
    try {
      // Phân tích cú pháp JSON từ phản hồi
      const jsonStartIndex = content.indexOf('{');
      const jsonEndIndex = content.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
        const presentationData = JSON.parse(jsonContent);
        return presentationData;
      } else {
        throw new Error('Không thể phân tích dữ liệu JSON từ phản hồi');
      }
    } catch (jsonError) {
      console.error('Lỗi phân tích JSON:', jsonError);
      return null;
    }
  } else {
    return null;
  }
}

// Gọi Claude API cho bài thuyết trình
async function callClaudeForPresentation(prompt, apiKey) {
  const requestBody = {
    model: DEFAULT_CLAUDE_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: 'Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp. Bạn có kiến thức sâu rộng về nhiều lĩnh vực và hiểu rõ nguyên tắc thiết kế bài thuyết trình hiệu quả. Luôn trả về JSON theo định dạng yêu cầu.',
    temperature: 0.7,
    max_tokens: 3000
  };
  
  const response = await axios.post(
    CLAUDE_API_URL,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    }
  );
  
  if (response.data.content && response.data.content.length > 0) {
    const content = response.data.content[0].text;
    
    try {
      // Phân tích cú pháp JSON từ phản hồi
      const jsonStartIndex = content.indexOf('{');
      const jsonEndIndex = content.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
        const presentationData = JSON.parse(jsonContent);
        return presentationData;
      } else {
        throw new Error('Không thể phân tích dữ liệu JSON từ phản hồi Claude');
      }
    } catch (jsonError) {
      console.error('Lỗi phân tích JSON từ Claude:', jsonError);
      return null;
    }
  } else {
    return null;
  }
}

// Gọi Gemini API cho bài thuyết trình
async function callGeminiForPresentation(prompt, apiKey) {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Bạn là trợ lý AI chuyên tạo nội dung bài thuyết trình chuyên nghiệp. Bạn có kiến thức sâu rộng về nhiều lĩnh vực và hiểu rõ nguyên tắc thiết kế bài thuyết trình hiệu quả. Luôn trả về JSON theo định dạng yêu cầu.'
          }
        ]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Tôi hiểu rồi. Tôi sẽ tạo nội dung bài thuyết trình chuyên nghiệp và trả về kết quả theo định dạng JSON theo yêu cầu của bạn.'
          }
        ]
      },
      {
        role: 'user',
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 3000
    }
  };
  
  const response = await axios.post(
    `${GEMINI_API_URL}/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.data.candidates && response.data.candidates.length > 0) {
    const content = response.data.candidates[0].content.parts[0].text;
    
    try {
      // Phân tích cú pháp JSON từ phản hồi
      const jsonStartIndex = content.indexOf('{');
      const jsonEndIndex = content.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonContent = content.substring(jsonStartIndex, jsonEndIndex);
        const presentationData = JSON.parse(jsonContent);
        return presentationData;
      } else {
        throw new Error('Không thể phân tích dữ liệu JSON từ phản hồi Gemini');
      }
    } catch (jsonError) {
      console.error('Lỗi phân tích JSON từ Gemini:', jsonError);
      return null;
    }
  } else {
    return null;
  }
}

// API nâng cao nội dung slide
app.post('/api/presentation/enhance', async (req, res) => {
  try {
    const { content, type, provider } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Nội dung không được để trống' });
    }
    
    // Chế độ DEMO: Trả về nội dung đã nâng cao mẫu
    if (DEMO_MODE) {
      console.log('Đang chạy nâng cao nội dung ở chế độ DEMO.');
      const enhancedContent = enhanceContentDemo(content, type);
      return res.json({ enhancedContent });
    }
    
    const enhancementPrompt = createEnhancementPrompt(content, type);
    
    let apiKey, enhancedContent;
    
    // Xác định API để sử dụng
    switch (provider) {
      case 'CLAUDE':
        apiKey = CLAUDE_API_KEY;
        if (!apiKey || apiKey === 'your_claude_api_key_here') {
          enhancedContent = await callOpenAIForEnhancement(enhancementPrompt);
        } else {
          enhancedContent = await callClaudeForEnhancement(enhancementPrompt, apiKey);
        }
        break;
      case 'GEMINI':
        apiKey = GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          enhancedContent = await callOpenAIForEnhancement(enhancementPrompt);
        } else {
          enhancedContent = await callGeminiForEnhancement(enhancementPrompt, apiKey);
        }
        break;
      default:
        // Mặc định là OpenAI
        enhancedContent = await callOpenAIForEnhancement(enhancementPrompt);
    }
    
    if (!enhancedContent) {
      return res.status(500).json({ error: 'Không thể nâng cao nội dung' });
    }
    
    return res.json({ enhancedContent });
  } catch (error) {
    console.error('Lỗi nâng cao nội dung:', error);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Lỗi server';
    res.status(status).json({ error: message });
  }
});

// Các hàm gọi API cho nâng cao nội dung
async function callOpenAIForEnhancement(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    return enhanceContentDemo(prompt);
  }
  
  const requestBody = {
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Bạn là chuyên gia nâng cao nội dung bài thuyết trình. Hãy cải thiện và tối ưu hóa nội dung theo yêu cầu.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };
  
  const response = await axios.post(
    `${OPENAI_API_URL}/chat/completions`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    }
  );
  
  if (response.data.choices && response.data.choices.length > 0) {
    return response.data.choices[0].message.content;
  }
  
  return null;
}

async function callClaudeForEnhancement(prompt, apiKey) {
  const requestBody = {
    model: DEFAULT_CLAUDE_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: 'Bạn là chuyên gia nâng cao nội dung bài thuyết trình. Hãy cải thiện và tối ưu hóa nội dung theo yêu cầu.',
    temperature: 0.7,
    max_tokens: 1000
  };
  
  const response = await axios.post(
    CLAUDE_API_URL,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    }
  );
  
  if (response.data.content && response.data.content.length > 0) {
    return response.data.content[0].text;
  }
  
  return null;
}

async function callGeminiForEnhancement(prompt, apiKey) {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Bạn là chuyên gia nâng cao nội dung bài thuyết trình. Hãy cải thiện và tối ưu hóa nội dung theo yêu cầu.'
          }
        ]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Tôi sẽ giúp bạn nâng cao nội dung bài thuyết trình.'
          }
        ]
      },
      {
        role: 'user',
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  };
  
  const response = await axios.post(
    `${GEMINI_API_URL}/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.data.candidates && response.data.candidates.length > 0) {
    return response.data.candidates[0].content.parts[0].text;
  }
  
  return null;
}

// Hàm trích xuất từ khóa từ văn bản
function extractKeywordsFromText(text) {
  const cleanedText = text.replace(/[^\w\s,]/g, '');
  const words = cleanedText.split(/[\s,]+/);
  return words.filter(word => word.length > 2).slice(0, 5);
}

// Hàm tạo prompt cho cải thiện nội dung
function createEnhancementPrompt(content, type) {
  switch (type) {
    case 'concise':
      return `Hãy tóm tắt và làm súc tích nội dung sau đây, đảm bảo giữ lại những điểm quan trọng nhất:\n\n${content}`;
    case 'elaborate':
      return `Hãy mở rộng và bổ sung chi tiết cho nội dung sau đây, làm cho nó phong phú và đầy đủ hơn:\n\n${content}`;
    case 'professional':
      return `Hãy viết lại nội dung sau đây theo phong cách chuyên nghiệp và trang trọng hơn:\n\n${content}`;
    case 'creative':
      return `Hãy viết lại nội dung sau đây theo phong cách sáng tạo và hấp dẫn hơn:\n\n${content}`;
    default:
      return `Hãy cải thiện nội dung sau đây, làm cho nó rõ ràng, dễ hiểu và có tính thuyết phục hơn:\n\n${content}`;
  }
}

// Hàm tạo prompt cho bài thuyết trình
function createPresentationPrompt(options) {
  const { 
    topic, 
    style, 
    slides, 
    language = 'vi',
    purpose = 'business',
    audience = 'general',
    includeCharts = true,
    includeImages = true
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
      audienceDescription = 'Lãnh đạo và quản lý cấp cao, tập trung vào chiến lược và kết quả';
      break;
    case 'technical':
      audienceDescription = 'Chuyên gia kỹ thuật, có kiến thức chuyên môn trong lĩnh vực';
      break;
    case 'student':
      audienceDescription = 'Học sinh và sinh viên, nội dung giáo dục và dễ tiếp cận';
      break;
    case 'client':
      audienceDescription = 'Khách hàng và đối tác, tập trung vào giá trị và lợi ích';
      break;
    default:
      audienceDescription = 'Đối tượng đại chúng với nhiều cấp độ hiểu biết khác nhau';
  }
  
  let purposeDescription = '';
  switch (purpose) {
    case 'education':
      purposeDescription = 'Giáo dục và đào tạo, truyền đạt kiến thức';
      break;
    case 'marketing':
      purposeDescription = 'Marketing và truyền thông, thuyết phục và thu hút';
      break;
    case 'academic':
      purposeDescription = 'Nghiên cứu học thuật, báo cáo khoa học';
      break;
    case 'personal':
      purposeDescription = 'Sử dụng cá nhân, chia sẻ thông tin hoặc kỹ năng';
      break;
    default:
      purposeDescription = 'Sử dụng trong môi trường doanh nghiệp và công việc';
  }
  
  // Bổ sung thông tin về biểu đồ và hình ảnh
  const mediaGuidance = `
Hướng dẫn về phương tiện trực quan:
- ${includeCharts ? 'Đề xuất dữ liệu biểu đồ thống kê cho các slide có nội dung phù hợp.' : 'Không đề xuất biểu đồ.'}
- ${includeImages ? 'Đề xuất từ khóa hình ảnh phù hợp cho mỗi slide.' : 'Không đề xuất hình ảnh.'}
`;
  
  return `
Tạo một bài thuyết trình chi tiết và chuyên nghiệp về chủ đề "${topic}" với ${slides} slides.

Thông tin cơ bản:
- Phong cách: ${styleDescription}
- Đối tượng: ${audienceDescription}
- Mục đích: ${purposeDescription}
- Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'Tiếng Anh' : `${language}`}
${mediaGuidance}

Format JSON trả về như sau:
{
  "title": "Tiêu đề bài thuyết trình",
  "description": "Mô tả ngắn về bài thuyết trình",
  "slides": [
    {
      "title": "Tiêu đề slide",
      "content": "Nội dung slide với định dạng súc tích và dễ hiểu",
      "notes": "Ghi chú cho người thuyết trình (không hiển thị trong slide)",
      "keywords": ["từ_khóa_1", "từ_khóa_2"] // Từ khóa hình ảnh gợi ý nếu cần
    }
  ]
}

Hướng dẫn chi tiết:
1. Slide đầu tiên cần là trang bìa hấp dẫn với tiêu đề chính và phụ đề.
2. Slide cuối cùng nên là trang kết luận và lời cảm ơn.
3. Mỗi slide nên có cấu trúc rõ ràng, nội dung ngắn gọn (tối đa 5-7 điểm chính).
4. Tránh đoạn văn dài, ưu tiên sử dụng danh sách, từ khóa và câu ngắn.
5. Đối với các slide có số liệu, hãy đề xuất dạng biểu đồ phù hợp (nếu được yêu cầu).
6. Ghi chú cho người thuyết trình nên bao gồm thông tin bổ sung, lời thoại gợi ý.

Hãy đảm bảo nội dung:
- Có tính học thuật và đáng tin cậy nếu là bài thuyết trình giáo dục/học thuật
- Có tính thuyết phục và hấp dẫn nếu là bài thuyết trình marketing/kinh doanh
- Dễ hiểu và phù hợp với trình độ nếu là bài thuyết trình cho học sinh/sinh viên
- Chuyên nghiệp và định hướng kết quả nếu là bài thuyết trình cho lãnh đạo

Đặc biệt chú ý tạo cấu trúc rõ ràng và hợp lý trong toàn bộ bài thuyết trình.
`;
}

// Hàm tạo dữ liệu thuyết trình mẫu cho chế độ DEMO
function generateDemoPresentation(topic, slideCount = 5, style = 'professional') {
  console.log(`Tạo bài thuyết trình mẫu với chủ đề: ${topic}, ${slideCount} slides, style: ${style}`);
  
  const titlePrefix = style === 'creative' ? 'Sáng tạo cùng' : 
                     style === 'minimal' ? 'Tối giản về' : 
                     style === 'academic' ? 'Nghiên cứu về' : 
                     style === 'tech' ? 'Công nghệ & ' : 'Giới thiệu về';
  
  const demoPresentation = {
    title: `${titlePrefix} ${topic}`,
    description: `Bài thuyết trình về ${topic} được tạo tự động bằng AI.`,
    slides: []
  };
  
  // Tạo slide đầu tiên - Trang bìa
  demoPresentation.slides.push({
    title: demoPresentation.title,
    content: `Một bài thuyết trình về ${topic}\nTạo bởi Presentation AI App`,
    notes: "Giới thiệu bản thân và chào đón khán giả. Giải thích ngắn gọn mục đích của bài thuyết trình.",
    keywords: ["presentation", "introduction", topic.toLowerCase()]
  });
  
  // Tạo các slide nội dung
  const contentSlides = slideCount - 2; // Trừ slide đầu và cuối
  
  for (let i = 0; i < contentSlides; i++) {
    const slideIndex = i + 1;
    let slideTitle = '';
    let slideContent = '';
    let slideNotes = '';
    let slideKeywords = [];
    
    switch (slideIndex) {
      case 1:
        slideTitle = 'Tổng quan';
        slideContent = `- ${topic} là gì?\n- Tầm quan trọng\n- Lịch sử phát triển\n- Ứng dụng chính`;
        slideNotes = "Giải thích ngắn gọn về chủ đề và cung cấp bối cảnh lịch sử.";
        slideKeywords = ["overview", "introduction", topic.toLowerCase()];
        break;
      case 2:
        slideTitle = 'Lợi ích chính';
        slideContent = `- Lợi ích 1: Tăng hiệu quả công việc\n- Lợi ích 2: Tiết kiệm thời gian và chi phí\n- Lợi ích 3: Cải thiện chất lượng\n- Lợi ích 4: Phát triển bền vững`;
        slideNotes = "Nhấn mạnh những lợi ích quan trọng nhất và đưa ra ví dụ cụ thể nếu có thể.";
        slideKeywords = ["benefits", "advantages", "efficiency"];
        break;
      case 3:
        slideTitle = 'Thống kê quan trọng';
        slideContent = `- 75% người dùng thấy cải thiện hiệu suất\n- Tăng trưởng 30% so với năm trước\n- Chi phí giảm 15%\n- 90% khách hàng hài lòng`;
        slideNotes = "Dẫn nguồn cho các số liệu và giải thích ý nghĩa của chúng.";
        slideKeywords = ["statistics", "growth", "data", "numbers"];
        break;
      default:
        slideTitle = `Chủ đề ${slideIndex}`;
        slideContent = `- Điểm chính 1\n- Điểm chính 2\n- Điểm chính 3\n- Kết luận`;
        slideNotes = "Thêm các chi tiết và ví dụ để minh họa các điểm chính.";
        slideKeywords = ["key points", topic.toLowerCase(), "example"];
    }
    
    demoPresentation.slides.push({
      title: slideTitle,
      content: slideContent,
      notes: slideNotes,
      keywords: slideKeywords
    });
  }
  
  // Tạo slide cuối - Kết luận
  demoPresentation.slides.push({
    title: "Kết luận",
    content: `- Tóm tắt các điểm chính\n- Bước tiếp theo\n- Lời cảm ơn\n- Thông tin liên hệ`,
    notes: "Tóm tắt các điểm chính, nêu bật bước tiếp theo và cảm ơn khán giả.",
    keywords: ["conclusion", "summary", "thank you"]
  });
  
  return demoPresentation;
}

// Hàm nâng cao nội dung mẫu cho chế độ DEMO
function enhanceContentDemo(content, type = 'improve') {
  console.log(`Nâng cao nội dung mẫu với kiểu: ${type}`);
  
  // Nội dung gốc
  const originalContent = content.trim();
  
  // Xử lý dựa trên kiểu nâng cao
  switch (type) {
    case 'concise':
      // Làm súc tích: Tóm tắt và rút gọn
      return `${originalContent.split('\n').slice(0, 2).join('\n')}\n\nTóm tắt: ${originalContent.length > 100 ? originalContent.substring(0, 100) + '...' : originalContent}`;
      
    case 'elaborate':
      // Mở rộng: Thêm chi tiết
      return `${originalContent}\n\nPhân tích chi tiết:\n- Điểm 1: Tăng cường hiểu biết về chủ đề\n- Điểm 2: Cung cấp ví dụ thực tế\n- Điểm 3: Xem xét ứng dụng trong thực tiễn\n\nKết luận: Những thông tin trên giúp làm rõ và mở rộng ý tưởng ban đầu.`;
      
    case 'professional':
      // Chuyên nghiệp: Sử dụng ngôn ngữ chuyên nghiệp
      return `${originalContent}\n\nLưu ý cho người thuyết trình:\nHãy trình bày nội dung này một cách tự tin và chuyên nghiệp. Sử dụng dữ liệu và số liệu thống kê để hỗ trợ các luận điểm. Đảm bảo liên kết nội dung với mục tiêu tổng thể của bài thuyết trình.`;
      
    case 'creative':
      // Sáng tạo: Thêm màu sắc và hình ảnh
      return `✨ ${originalContent} ✨\n\nHãy tưởng tượng: ${originalContent.split(' ').slice(0, 5).join(' ')}... như một cuộc phiêu lưu đầy màu sắc!\n\nLà nguồn cảm hứng cho mọi người nghe.\n\n🚀 Hãy biến ý tưởng này thành hiện thực!`;
      
    default:
      // Cải thiện tổng thể
      return `${originalContent}\n\nNội dung đã được cải thiện:\n- Cấu trúc rõ ràng hơn\n- Thông tin được tổ chức tốt hơn\n- Ngôn ngữ chính xác và mạch lạc\n- Thêm các ví dụ minh họa\n\nĐề xuất: Sử dụng hình ảnh hoặc biểu đồ để minh họa các điểm chính.`;
  }
}

/**
 * Tạo phản hồi AI mẫu cho chế độ demo
 * @param {Object} options - Tùy chọn cho phản hồi
 * @returns {string} - Nội dung phản hồi mẫu
 */
function generateDemoAIResponse(options) {
  const messages = options.messages || [];
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  
  if (userMessage.length < 10) {
    return 'Tôi không có đủ thông tin để trả lời. Vui lòng cung cấp thêm chi tiết.';
  }
  
  return `Đây là phản hồi mẫu cho yêu cầu của bạn về "${userMessage.substring(0, 50)}...".
  
Phản hồi này được tạo ra ở chế độ DEMO vì không có API key hợp lệ. Trong môi trường thực tế, phản hồi sẽ được tạo bởi AI thông qua API.

Để sử dụng chức năng này, vui lòng cấu hình API key trong file .env của server.`;
}

// Error handling
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
connectDB().then(() => {
  // Khởi động server sau khi kết nối MongoDB thành công
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    if (DEMO_MODE) {
      console.log('Chế độ DEMO đang hoạt động. Các API calls sẽ trả về dữ liệu mẫu.');
    }
  });
}).catch(err => {
  console.error('Không thể kết nối đến MongoDB:', err);
  process.exit(1);
});

// Xử lý lỗi không bắt được
process.on('uncaughtException', (error) => {
  console.error('Lỗi không bắt được:', error);
});

// Export app để có thể sử dụng trong tests
module.exports = app; 