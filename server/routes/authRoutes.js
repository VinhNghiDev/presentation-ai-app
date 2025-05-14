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

// Routes cho xác thực Google
router.get('/google', authController.googleCallback);
router.post('/google/auth', authController.googleAuth);

// Routes cho xác thực Microsoft
router.get('/microsoft', authController.microsoftCallback);
router.post('/microsoft/auth', authController.microsoftAuth);

module.exports = router; 