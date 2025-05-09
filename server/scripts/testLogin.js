const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối đến MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

async function testLogin() {
  try {
    // Test đăng nhập với tài khoản admin
    const email = 'admin@example.com';
    const password = 'admin123';

    console.log('Đang tìm user với email:', email);
    
    // Tìm user và bao gồm password để kiểm tra
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('Không tìm thấy user với email:', email);
      return;
    }

    console.log('Đã tìm thấy user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // Kiểm tra password
    const isMatch = await user.comparePassword(password);
    console.log('Password có khớp không:', isMatch);

    if (isMatch) {
      console.log('Đăng nhập thành công!');
    } else {
      console.log('Mật khẩu không chính xác');
    }

  } catch (error) {
    console.error('Lỗi khi test đăng nhập:', error);
    throw new Error(error.response?.data?.error || 'Email hoặc mật khẩu không chính xác');
  } finally {
    mongoose.connection.close();
  }
}

// Chạy test
testLogin(); 