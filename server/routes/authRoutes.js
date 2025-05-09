const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký người dùng mới
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy thông tin người dùng hiện tại (cần xác thực)
router.get('/me', authController.protect, authController.getCurrentUser);

// Kiểm tra danh sách người dùng (chỉ admin)
router.get('/users', authController.protect, authController.checkUsers);

module.exports = router; 