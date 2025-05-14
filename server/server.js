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
require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/dbConfig');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { requestLogger, errorLogger } = require('./utils/logger');
const auth = require('./middleware/auth');
const path = require('path');
const { OpenAI } = require('openai');

// Import routes
const aiRoutes = require('./routes/aiRoutes');
const presentationRoutes = require('./routes/presentationRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const openaiService = require('./services/openaiService');
const huggingfaceRoutes = require('./routes/huggingfaceRoutes');

// Config
const config = require('./config/config');

// Cấu hình
const PORT = process.env.PORT || 3001;

// Log server configuration
console.log('Server configuration:');
console.log('- Port:', PORT);
console.log('- Client URL:', process.env.CLIENT_URL || 'http://localhost:3000');
console.log('- API URL:', `http://localhost:${PORT}/api`);

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
const server = http.createServer(app);

// Cấu hình CORS cho Express
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Khởi tạo Socket.IO
const { initializeSocket } = require('./socket');
const io = initializeSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', auth, require('./routes/userRoutes'));
app.use('/api/presentations', auth, presentationRoutes);
app.use('/api/templates', auth, require('./routes/templateRoutes'));
app.use('/api/huggingface', huggingfaceRoutes);

// Route test OpenAI không yêu cầu xác thực
app.post('/api/test-openai', async (req, res) => {
  try {
    console.log('Testing OpenAI connection...');
    
    const response = await openaiService.callOpenAI({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }]
    });

    res.json({ 
      success: true, 
      message: 'OpenAI connection successful',
      response: response
    });
  } catch (error) {
    console.error('OpenAI Test Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Route test Claude AI không yêu cầu xác thực
app.get('/api/test-claude', async (req, res) => {
  try {
    console.log('Testing Claude connection...');
    console.log('API Key:', process.env.CLAUDE_API_KEY ? 'Present' : 'Missing');
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    console.log('Claude Response:', response.data);
    res.json({ 
      success: true, 
      message: 'Claude connection successful',
      response: response.data.content[0].text 
    });
  } catch (error) {
    console.error('Claude Test Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Kiểm tra kết nối
app.get('/api/health', (req, res) => {
  const availableApis = [];
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') availableApis.push('OpenAI');
  if (CLAUDE_API_KEY && CLAUDE_API_KEY !== 'your_claude_api_key_here') availableApis.push('Claude');
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') availableApis.push('Gemini');
  if (process.env.HUGGINGFACE_API_KEY) availableApis.push('Hugging Face');
  
  res.json({ 
    status: 'ok', 
    message: 'Server đang hoạt động',
    availableApis: availableApis,
    demoMode: DEMO_MODE,
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
      const demoContent = "Không có API key hợp lệ. Hãy sử dụng Hugging Face API hoặc cung cấp API key hợp lệ.";
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
      return res.json({
        title: "Bạn đang ở chế độ DEMO",
        description: "Không có API key hợp lệ. Vui lòng sử dụng endpoint /api/huggingface/presentation/generate để tạo bài thuyết trình.",
        redirectTo: "/api/huggingface/presentation/generate"
      });
    }
    
    // Chế độ thực: Gọi API tương ứng
    // Tạo prompt cho AI
    const prompt = "Chức năng tạo prompt đã được chuyển sang Hugging Face API. Vui lòng sử dụng endpoint /api/huggingface/presentation/generate";
    
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
      const enhancedContent = "Nội dung đã được cải thiện (phiên bản demo). Để có kết quả tốt hơn, hãy cung cấp API key hợp lệ.";
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
    return "Không thể nâng cao nội dung do thiếu API key. Vui lòng cung cấp OpenAI API key hợp lệ.";
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
    default:
      return content;
  }
}

// Connect to MongoDB
connectDB().then(() => {
  console.log('MongoDB connected successfully, starting server...');
}).catch(err => {
  console.error('Không thể kết nối đến MongoDB:', err);
  console.log('Server sẽ chạy ở chế độ demo database.');
  global.useDemoDatabase = true;
});

// Luôn khởi động server bất kể kết nối MongoDB thành công hay không
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  if (DEMO_MODE) {
    console.log('Chế độ DEMO đang hoạt động. Các API calls sẽ trả về dữ liệu mẫu.');
  }
  if (global.useDemoDatabase) {
    console.log('Database DEMO đang hoạt động. Dữ liệu sẽ không được lưu trữ.');
  }
});

// Xử lý lỗi không bắt được
process.on('uncaughtException', (error) => {
  console.error('Lỗi không bắt được:', error);
});

// Export app để có thể sử dụng trong tests
module.exports = app;