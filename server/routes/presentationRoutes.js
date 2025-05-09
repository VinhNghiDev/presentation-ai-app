const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController');
const authController = require('../controllers/authController');

// Route tạo bài thuyết trình bằng AI (có thể sử dụng khi chưa đăng nhập)
router.post('/generate', presentationController.handleGeneratePresentation);

// Tất cả các route dưới đây đều yêu cầu xác thực
router.use(authController.protect);

// Lấy danh sách bài thuyết trình của người dùng hiện tại
router.get('/', presentationController.getPresentations);

// Tạo bài thuyết trình mới
router.post('/', presentationController.createPresentation);

// Route cho bài thuyết trình cụ thể
router.route('/:id')
  .get(presentationController.getPresentation)
  .patch(presentationController.updatePresentation)
  .delete(presentationController.deletePresentation);

module.exports = router; 