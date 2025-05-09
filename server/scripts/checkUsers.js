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

async function checkUsers() {
  try {
    // Lấy tất cả users
    const users = await User.find({}).select('-password');
    
    console.log('\nDanh sách người dùng trong hệ thống:');
    console.log('----------------------------------------');
    
    if (users.length === 0) {
      console.log('Chưa có người dùng nào trong hệ thống');
    } else {
      users.forEach((user, index) => {
        console.log(`\nNgười dùng ${index + 1}:`);
        console.log(`ID: ${user._id}`);
        console.log(`Tên: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Vai trò: ${user.role}`);
        console.log(`Ngày tạo: ${user.createdAt}`);
        console.log(`Lần đăng nhập cuối: ${user.lastLogin}`);
        console.log('----------------------------------------');
      });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra users:', error);
  } finally {
    // Đóng kết nối
    mongoose.connection.close();
  }
}

// Chạy hàm kiểm tra
checkUsers(); 