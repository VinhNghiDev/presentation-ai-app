const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Route xử lý AI completion
router.post('/completion', aiController.handleAICompletion);

// Route nâng cao nội dung slide
router.post('/enhance', aiController.handleEnhanceContent);

module.exports = router; 