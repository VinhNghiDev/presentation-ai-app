const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Định nghĩa Schema cho User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên không được để trống'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu không được để trống'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionExpires: {
    type: Date
  },
  preferences: {
    language: {
      type: String,
      enum: ['vi', 'en'],
      default: 'vi'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware để hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được sửa đổi
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Nếu password chưa được select, cần select nó
    if (!this.password) {
      const user = await this.constructor.findById(this._id).select('+password');
      if (!user) {
        console.log('Không tìm thấy user khi so sánh password');
        return false;
      }
      console.log('Đã tìm thấy user khi so sánh password');
      const isMatch = await bcrypt.compare(candidatePassword, user.password);
      console.log('Kết quả so sánh password:', isMatch);
      return isMatch;
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Kết quả so sánh password:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Lỗi khi so sánh password:', error);
    return false;
  }
};

// Phương thức chuyển đổi thành JSON để loại bỏ password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Tạo và xuất model
const User = mongoose.model('User', userSchema);

module.exports = User; 