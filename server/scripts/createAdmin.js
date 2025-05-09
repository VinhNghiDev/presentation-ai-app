const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối đến MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Import User model
const User = require('../models/User');

async function createAdmin() {
  try {
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Đã tồn tại tài khoản admin trong hệ thống');
      return;
    }

    // Tạo tài khoản admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });

    console.log('Đã tạo tài khoản admin thành công:');
    console.log('Email:', admin.email);
    console.log('Password:', 'admin123');
    console.log('Vui lòng đổi mật khẩu sau khi đăng nhập!');
  } catch (error) {
    console.error('Lỗi khi tạo admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy hàm tạo admin
createAdmin(); 