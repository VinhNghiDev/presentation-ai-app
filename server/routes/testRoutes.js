const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');

// Route test kết nối OpenAI - không yêu cầu xác thực
router.post('/openai', async (req, res) => {
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

module.exports = router; 