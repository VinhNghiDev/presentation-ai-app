const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Lấy danh sách người dùng (chỉ admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin một người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Không tìm thấy người dùng'
      });
    }
    
    res.status(200).json({
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Kiểm tra xem người dùng có đang cố gắng cập nhật thông tin của người khác không
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Bạn không có quyền cập nhật thông tin của người dùng khác'
      });
    }
    
    // Lọc dữ liệu cần cập nhật
    const { name, email, avatar } = req.body;
    
    // Không cho phép cập nhật email thành email đã tồn tại
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email đã được sử dụng'
        });
      }
    }
    
    // Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, avatar },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'Không tìm thấy người dùng'
      });
    }
    
    res.status(200).json({
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật mật khẩu người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // Kiểm tra xem người dùng có đang cố gắng cập nhật mật khẩu của người khác không
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Bạn không có quyền cập nhật mật khẩu của người dùng khác'
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Lấy người dùng từ database kèm theo password
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Không tìm thấy người dùng'
      });
    }
    
    // Nếu không phải admin, kiểm tra mật khẩu hiện tại
    if (req.user.role !== 'admin') {
      // Kiểm tra mật khẩu hiện tại
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Vui lòng cung cấp mật khẩu hiện tại'
        });
      }
      
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
          error: 'Mật khẩu hiện tại không chính xác'
        });
      }
    }
    
    // Kiểm tra mật khẩu mới
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }
    
    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      message: 'Cập nhật mật khẩu thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa người dùng (chỉ admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Không tìm thấy người dùng'
      });
    }
    
    res.status(200).json({
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
}; 