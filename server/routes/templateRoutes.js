const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authController = require('../controllers/authController');

// Lấy danh sách templates (public)
router.get('/', templateController.getTemplates);

// Lấy chi tiết một template (public nếu isPublic = true)
router.get('/:id', templateController.getTemplate);

// Tất cả các route dưới đây đều yêu cầu xác thực
router.use(authController.protect);

// Tạo template mới (admin hoặc premium user)
router.post('/', templateController.createTemplate);

// Route cho template cụ thể (admin hoặc người tạo)
router.route('/:id')
  .patch(templateController.updateTemplate)
  .delete(templateController.deleteTemplate);

module.exports = router; 