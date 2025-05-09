const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Config
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Kiểm tra JWT_SECRET
if (!JWT_SECRET) {
  console.error('JWT_SECRET chưa được cấu hình trong file .env');
  process.exit(1);
}

/**
 * Tạo JWT token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Xử lý đăng ký người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp đầy đủ thông tin: tên, email và mật khẩu'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({
        error: 'Email không hợp lệ'
      });
    }
    
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email đã được sử dụng'
      });
    }
    
    // Tạo người dùng mới
    const newUser = await User.create({
      name,
      email,
      password,
      lastLogin: new Date()
    });
    
    // Tạo token
    const token = generateToken(newUser);
    
    // Trả về thông tin người dùng (không bao gồm password)
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.'
    });
  }
};

/**
 * Xử lý đăng nhập người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp email và mật khẩu'
      });
    }
    
    // Tìm người dùng theo email và bao gồm password để kiểm tra
    const user = await User.findOne({ email }).select('+password');
    
    // Kiểm tra xem người dùng tồn tại và password có đúng không
    if (!user) {
      return res.status(401).json({
        error: 'Email không tồn tại'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Mật khẩu không chính xác'
      });
    }
    
    // Cập nhật lần đăng nhập cuối
    user.lastLogin = new Date();
    await user.save();
    
    // Tạo token
    const token = generateToken(user);
    
    // Trả về thông tin người dùng (không bao gồm password)
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.'
    });
  }
};

/**
 * Xử lý yêu cầu lấy thông tin người dùng hiện tại
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // Người dùng đã được xác thực trong middleware và được thêm vào req
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware xác thực token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Kiểm tra xem token có được cung cấp không
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.'
      });
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra xem người dùng vẫn tồn tại không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        error: 'Người dùng không tồn tại'
      });
    }
    
    // Thêm người dùng vào request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token đã hết hạn'
      });
    }
    
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền
 * @param  {...string} roles - Các role được phép truy cập
 * @returns {Function} - Middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    
    next();
  };
};

/**
 * Kiểm tra danh sách người dùng (chỉ admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.checkUsers = async (req, res, next) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập thông tin này'
      });
    }

    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra users:', error);
    res.status(500).json({
      error: 'Có lỗi xảy ra khi lấy danh sách người dùng'
    });
  }
}; 