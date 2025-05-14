const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController');
const authController = require('../controllers/authController');
const { validatePresentation, validatePresentationOptions } = require('../utils/validation');
const { createPresentationPrompt } = require('../utils/promptUtils');
const openaiService = require('../services/openaiService');
const multer = require('multer');
const path = require('path');

// Route test kết nối OpenAI - đặt TRƯỚC middleware xác thực
router.post('/test-openai', async (req, res) => {
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

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Tất cả các route dưới đây đều yêu cầu xác thực
router.use(authController.protect);

// Tạo bài thuyết trình mới
router.post('/', presentationController.createPresentation);

// Tạo outline cho bài thuyết trình
router.post('/outline', async (req, res) => {
  try {
    const { topic, options } = req.body;

    // Validate options
    validatePresentationOptions(options);

    // Tạo prompt cho outline
    const prompt = createPresentationPrompt({
      topic,
      ...options,
      type: 'outline'
    });

    // Gọi API OpenAI thông qua service
    const content = await openaiService.callOpenAI({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    
    try {
      // Parse JSON từ response
      const outline = JSON.parse(content);
      
      // Validate outline structure
      if (!outline.title || !outline.slides || !Array.isArray(outline.slides)) {
        throw new Error('Invalid outline structure');
      }

      res.json(outline);
    } catch (parseError) {
      console.error('Error parsing outline:', parseError);
      res.status(500).json({ error: 'Failed to parse outline data' });
    }
  } catch (error) {
    console.error('Error generating outline:', error);
    res.status(500).json({ error: error.message || 'Failed to generate outline' });
  }
});

// Tạo nội dung cho slide
router.post('/slide-content', async (req, res) => {
  try {
    const { outline, slideIndex } = req.body;

    if (!outline || !outline.slides || !Array.isArray(outline.slides)) {
      throw new Error('Invalid outline data');
    }

    const slide = outline.slides[slideIndex];
    if (!slide) {
      throw new Error('Invalid slide index');
    }

    const prompt = `Tạo nội dung chi tiết cho slide "${slide.title}" trong bài thuyết trình về "${outline.topic}".
    Hãy tạo nội dung phù hợp với phong cách ${outline.style} và đối tượng ${outline.audience}.
    Nội dung nên ngắn gọn, dễ hiểu và có cấu trúc rõ ràng.`;

    const content = await openaiService.callOpenAI({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });
    
    try {
      // Parse JSON từ response
      const slideContent = JSON.parse(content);
      
      // Validate slide content
      if (!slideContent.title || !slideContent.content) {
        throw new Error('Invalid slide content structure');
      }

      res.json(slideContent);
    } catch (parseError) {
      console.error('Error parsing slide content:', parseError);
      res.status(500).json({ error: 'Failed to parse slide content' });
    }
  } catch (error) {
    console.error('Error generating slide content:', error);
    res.status(500).json({ error: error.message || 'Failed to generate slide content' });
  }
});

// Tạo hình ảnh cho slide
router.post('/generate-images', async (req, res) => {
  try {
    const { prompt, count } = req.body;
    
    const images = [];
    for (let i = 0; i < count; i++) {
      const response = await openaiService.callOpenAI({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      
      images.push({
        url: response.data[0].url,
        description: prompt
      });
    }
    
    res.json(images);
  } catch (error) {
    console.error('Error generating images:', error);
    res.status(500).json({ error: 'Failed to generate images' });
  }
});

// Tăng cường dữ liệu bài thuyết trình
router.post('/enhance', async (req, res) => {
  try {
    const presentation = req.body;

    // Validate presentation data
    validatePresentation(presentation);

    // Enhance presentation with additional data
    const enhancedPresentation = {
      ...presentation,
      metadata: {
        ...presentation.metadata,
        enhanced: true,
        enhancedAt: new Date().toISOString()
      },
      slides: presentation.slides.map((slide, index) => {
        // Add slide type if not exists
        if (!slide.type) {
          slide.type = index === 0 ? 'cover' :
                      index === 1 ? 'table-of-contents' :
                      index === presentation.slides.length - 1 ? 'conclusion' : 'content';
        }

        // Add slide number
        slide.number = index + 1;

        // Add keywords if not exists
        if (!slide.keywords) {
          slide.keywords = extractKeywords(slide.content);
        }

        return slide;
      })
    };

    res.json(enhancedPresentation);
  } catch (error) {
    console.error('Error enhancing presentation:', error);
    res.status(500).json({ error: error.message || 'Failed to enhance presentation' });
  }
});

// Helper function to extract keywords from content
function extractKeywords(content) {
  if (!content) return [];
  
  // Split content into words
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Filter out short words

  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and get top 5 keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

module.exports = router; 