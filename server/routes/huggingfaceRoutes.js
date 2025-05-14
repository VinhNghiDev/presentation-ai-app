const express = require('express');
const router = express.Router();
const { callHuggingFace, callHuggingFaceForPresentation, generateDemoPresentationData } = require('../services/huggingfaceService');
const axios = require('axios');
const dotenv = require('dotenv');

// Đọc lại file .env
dotenv.config();

// Test với các mô hình khác (đơn giản hơn)
const TEST_MODELS = [
  "gpt2",
  "distilgpt2",
  "bert-base-uncased",
  "distilbert-base-uncased"
];

// Route để kiểm tra biến môi trường và cấu hình
router.get('/check-config', (req, res) => {
  // Lấy tất cả thông tin cấu hình Hugging Face, nhưng ẩn phần lớn API key
  const apiKey = process.env.HUGGINGFACE_API_KEY || 'not set';
  const apiKeyHidden = apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : 'not set';
  
  // Log thông tin đầy đủ cho server
  console.log('Hugging Face API Key (full):', process.env.HUGGINGFACE_API_KEY);
  
  const config = {
    API_KEY_STATUS: apiKey ? 'Set (correct format: ' + (apiKey.startsWith('hf_') ? 'Yes' : 'No') + ')' : 'Not set',
    API_KEY_PREVIEW: apiKeyHidden,
    API_KEY_LENGTH: apiKey ? apiKey.length : 0,
    API_URL: process.env.HUGGINGFACE_API_URL || 'not set',
    DEFAULT_MODEL: process.env.DEFAULT_HUGGINGFACE_MODEL || 'not set', 
    NODE_ENV: process.env.NODE_ENV || 'not set',
  };
  
  res.json({ config });
});

// Route kiểm tra API chi tiết với debug
router.get('/test-detailed', async (req, res) => {
  try {
    console.log('============ DETAILED API TEST ============');
    console.log('Environment variables:');
    console.log('- HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 5)}...` : 'not set');
    console.log('- HUGGINGFACE_API_URL:', process.env.HUGGINGFACE_API_URL);
    console.log('- DEFAULT_HUGGINGFACE_MODEL:', process.env.DEFAULT_HUGGINGFACE_MODEL);
    
    console.log('\nTesting API connection...');
    
    // Trước gọi API
    console.log('Preparing to call API with model:', process.env.DEFAULT_HUGGINGFACE_MODEL || 'distilgpt2');
    console.log('API URL:', `https://api-inference.huggingface.co/models/${process.env.DEFAULT_HUGGINGFACE_MODEL || 'distilgpt2'}`);
    console.log('Request data:', { inputs: "Hello, I am testing" });
    
    // Gọi API với timeout dài hơn
    const result = await axios({
      method: 'post',
      url: `https://api-inference.huggingface.co/models/${process.env.DEFAULT_HUGGINGFACE_MODEL || 'distilgpt2'}`,
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: { inputs: "Hello, I am testing" },
      timeout: 10000 // 10 giây timeout
    });
    
    console.log('Response received!');
    console.log('Status code:', result.status);
    console.log('Headers:', JSON.stringify(result.headers));
    console.log('Data (summary):', JSON.stringify(result.data).substring(0, 200) + '...');
    
    res.json({ 
      success: true, 
      status: result.status,
      headers: result.headers,
      data: result.data
    });
  } catch (error) {
    console.error('============ ERROR DETAILS ============');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      // Lỗi từ server (status code ngoài phạm vi 2xx)
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers));
      console.error('Response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      // Không nhận được phản hồi
      console.error('No response received. Request details:', error.request);
    } else {
      // Lỗi khi thiết lập request
      console.error('Error setting up request:', error.message);
    }
    
    console.error('Error config:', JSON.stringify(error.config));
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      errorType: error.name,
      errorDetails: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response'
    });
  }
});

// Route test kết nối Hugging Face
router.get('/test', async (req, res) => {
  try {
    console.log('Testing Hugging Face connection...');
    console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? 'Present' : 'Missing');
    
    // Thực hiện test đơn giản
    const result = await callHuggingFace({ 
      inputs: "Hello!"
    });
    
    res.json({ 
      success: true, 
      message: 'Hugging Face connection successful',
      result: result
    });
  } catch (error) {
    console.error('Hugging Face Test Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Route test Hugging Face
router.post('/generate', async (req, res) => {
  try {
    const { prompt, parameters, options } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    console.log('Generate with parameters:', parameters);
    console.log('Generate with options:', options);

    const result = await callHuggingFace({ 
      inputs: prompt,
      parameters: parameters || undefined,
      options: options || undefined
    });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route tạo bài thuyết trình bằng Hugging Face
router.post('/presentation/generate', async (req, res) => {
  try {
    const { topic, style, slides, language, purpose, audience, includeCharts, includeImages } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Chủ đề không được để trống' });
    }
    
    console.log(`Nhận yêu cầu tạo bài thuyết trình: "${topic}" (${slides || 5} slides, ngôn ngữ: ${language || 'vi'})`);
    
    // Tạo prompt cho bài thuyết trình
    const prompt = createPresentationPrompt({
      topic, 
      style: style || 'professional', 
      slides: slides || 5, 
      language: language || 'vi',
      purpose: purpose || 'business',
      audience: audience || 'general',
      includeCharts: includeCharts !== undefined ? includeCharts : true,
      includeImages: includeImages !== undefined ? includeImages : true
    });

    // Thiết lập timeout dài hơn cho những model phức tạp
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Quá thời gian chờ khi tạo bài thuyết trình')), 60000); // 60 giây
    });
    
    // Gọi API Hugging Face với timeout
    const presentationPromise = callHuggingFaceForPresentation(prompt);
    
    // Race giữa API call và timeout
    const presentationData = await Promise.race([presentationPromise, timeoutPromise])
      .catch(error => {
        console.error('Lỗi hoặc timeout khi tạo bài thuyết trình:', error.message);
        // Trả về dữ liệu mẫu khi timeout
        return generateDemoPresentationData(topic, slides || 5, style || 'professional');
      });
    
    if (!presentationData) {
      console.log('Không nhận được dữ liệu, sử dụng dữ liệu mẫu');
      return res.json(generateDemoPresentationData(topic, slides || 5, style || 'professional'));
    }
    
    console.log('Tạo bài thuyết trình thành công!');
    res.json(presentationData);
  } catch (error) {
    console.error('Lỗi tạo bài thuyết trình với Hugging Face:', error);
    // Trong trường hợp lỗi, trả về dữ liệu mẫu thay vì báo lỗi
    const fallbackData = generateDemoPresentationData(
      req.body.topic || 'Chủ đề không xác định', 
      req.body.slides || 5, 
      req.body.style || 'professional'
    );
    res.json(fallbackData);
  }
});

// Route đơn giản để kiểm tra API Hugging Face cơ bản
router.get('/simple-test', async (req, res) => {
  try {
    console.log('Testing basic Hugging Face API...');
    
    // Gọi API với cấu hình đơn giản nhất
    const result = await axios.post(
      "https://api-inference.huggingface.co/models/distilgpt2",
      { inputs: "Hello, I am a" },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json({ 
      success: true, 
      result: result.data
    });
  } catch (error) {
    console.error('Simple Test Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Simple test route with specific model (text-classification instead of text-generation)
router.get('/simple-direct-test', async (req, res) => {
  try {
    console.log('Testing direct Hugging Face API with text-classification...');
    
    // Use a smaller, more reliable model - using a current working model
    const MODEL = "facebook/bart-large-mnli";
    
    // Log key information
    console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 5)}...` : 'not set');
    console.log('Using model:', MODEL);
    
    // Direct API call without any abstraction
    const result = await axios({
      method: 'post',
      url: `https://api-inference.huggingface.co/models/${MODEL}`,
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: { 
        inputs: "I love this product, it works great!",
        parameters: {
          candidate_labels: ["positive", "negative", "neutral"]
        }
      },
      timeout: 15000 // 15 second timeout - longer for model loading
    });
    
    console.log('Direct test response:', result.data);
    
    res.json({ 
      success: true, 
      model: MODEL,
      result: result.data
    });
  } catch (error) {
    console.error('Direct Test Error:', error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Fallback test route using another model
router.get('/fallback-test', async (req, res) => {
  try {
    console.log('Testing fallback Hugging Face API with text2text-generation...');
    
    // Using T5 model for simple text generation
    const MODEL = "google/flan-t5-small";
    
    // Log key information
    console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 5)}...` : 'not set');
    console.log('Using fallback model:', MODEL);
    
    // Direct API call without abstraction
    const result = await axios({
      method: 'post',
      url: `https://api-inference.huggingface.co/models/${MODEL}`,
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: { 
        inputs: "Translate to Vietnamese: Hello, how are you?" 
      },
      timeout: 15000 // 15 second timeout
    });
    
    console.log('Fallback test response:', result.data);
    
    res.json({ 
      success: true, 
      model: MODEL,
      result: result.data
    });
  } catch (error) {
    console.error('Fallback Test Error:', error.message);
    console.error('Error details:', error.response?.data || 'No response data');
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Route để test tất cả các model đơn giản
router.get('/test-all-models', async (req, res) => {
  const TEST_MODELS = [
    "google/flan-t5-small",
    "facebook/bart-large-mnli",
    "gpt2",
    "distilgpt2",
    "bert-base-uncased",
    "microsoft/DialoGPT-small",
    "EleutherAI/gpt-neo-125M",
  ];
  
  const results = {};
  
  for (const model of TEST_MODELS) {
    try {
      console.log(`Testing model: ${model}`);
      
      const result = await axios({
        method: 'post',
        url: `https://api-inference.huggingface.co/models/${model}`,
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        data: { 
          inputs: "Hello, I am testing the Hugging Face API"
        },
        timeout: 10000
      });
      
      results[model] = {
        success: true,
        status: result.status
      };
      
      console.log(`Model ${model} test successful`);
    } catch (error) {
      console.log(`Model ${model} test failed: ${error.message}`);
      results[model] = {
        success: false,
        error: error.message,
        status: error.response?.status || 'unknown'
      };
    }
  }
  
  res.json({ results });
});

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
    default:
      styleDescription = 'Chuyên nghiệp và dễ hiểu';
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
      "keywords": ["từ_khóa_1", "từ_khóa_2"]
    }
  ]
}

Hướng dẫn chi tiết:
1. Slide đầu tiên cần là trang bìa với tiêu đề chính và phụ đề.
2. Slide cuối cùng nên là trang kết luận và lời cảm ơn.
3. Mỗi slide nên có cấu trúc rõ ràng, nội dung ngắn gọn.
4. Tránh đoạn văn dài, ưu tiên sử dụng danh sách và từ khóa.
`;
}

module.exports = router; 