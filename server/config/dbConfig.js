const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

// Cấu hình kết nối MongoDB
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/presentation-ai';

// Hàm kết nối đến MongoDB
const connectDB = async () => {
  try {
    console.log('Đang kết nối đến MongoDB...');
    
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    
    // Xử lý lỗi với chế độ db demo nếu không kết nối được
    console.log('Chuyển sang chế độ database demo...');
    global.useDemoDatabase = true;
    
    // Thoát process nếu trong môi trường sản phẩm
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Xử lý sự kiện kết nối bị lỗi sau khi đã kết nối
mongoose.connection.on('error', err => {
  console.error('Lỗi kết nối MongoDB:', err);
  
  // Đánh dấu sử dụng database demo
  global.useDemoDatabase = true;
});

// Tái kết nối khi bị mất kết nối
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bị ngắt kết nối, đang thử kết nối lại...');
  
  // Đánh dấu sử dụng database demo đến khi kết nối lại
  global.useDemoDatabase = true;
  
  // Thử kết nối lại sau 5 giây
  setTimeout(() => {
    connectDB();
  }, 5000);
});

module.exports = {
  connectDB,
  mongoose
}; 