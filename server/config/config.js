// Cấu hình ứng dụng
require('dotenv').config();

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

// Port
const PORT = process.env.PORT || 3001;

// Lấy danh sách API khả dụng
function getAvailableApis() {
  const availableApis = [];
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') availableApis.push('OpenAI');
  if (CLAUDE_API_KEY && CLAUDE_API_KEY !== 'your_claude_api_key_here') availableApis.push('Claude');
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') availableApis.push('Gemini');
  return availableApis;
}

// Kiểm tra chế độ demo
function isDemoMode() {
  return DEMO_MODE;
}

module.exports = {
  OPENAI_API_KEY,
  CLAUDE_API_KEY,
  GEMINI_API_KEY,
  OPENAI_API_URL,
  CLAUDE_API_URL,
  GEMINI_API_URL,
  DEFAULT_MODEL,
  DEFAULT_CLAUDE_MODEL,
  DEFAULT_GEMINI_MODEL,
  PORT,
  getAvailableApis,
  isDemoMode
}; 