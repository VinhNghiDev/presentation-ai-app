const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Tất cả các route dưới đây đều yêu cầu xác thực
router.use(authController.protect);

// Lấy danh sách người dùng (chỉ admin)
router.get('/', authController.restrictTo('admin'), userController.getAllUsers);

// Route cho người dùng cụ thể
router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

// Cập nhật mật khẩu
router.patch('/:id/password', userController.updatePassword);

module.exports = router; 