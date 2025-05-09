const Template = require('../models/Template');

/**
 * Lấy danh sách templates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTemplates = async (req, res, next) => {
  try {
    const filter = { isPublic: true };
    
    // Người dùng đăng nhập có thể xem templates của họ
    if (req.user) {
      filter.$or = [{ isPublic: true }, { createdBy: req.user._id }];
    }
    
    // Admin có thể xem tất cả templates
    if (req.user && req.user.role === 'admin') {
      delete filter.isPublic;
      delete filter.$or;
    }
    
    // Lọc theo category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Lọc theo isPremium
    if (req.query.isPremium) {
      filter.isPremium = req.query.isPremium === 'true';
    }
    
    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sắp xếp
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Mặc định sắp xếp theo thời gian tạo giảm dần
    }
    
    // Thực hiện truy vấn
    const templates = await Template.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Đếm tổng số templates
    const total = await Template.countDocuments(filter);
    
    res.status(200).json({
      templates,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết một template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    // Kiểm tra xem template có tồn tại không
    if (!template) {
      return res.status(404).json({ error: 'Không tìm thấy template' });
    }
    
    // Kiểm tra quyền truy cập
    if (!template.isPublic && 
        (!req.user || 
         (template.createdBy && template.createdBy.toString() !== req.user._id.toString() && 
          req.user.role !== 'admin'))) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập template này' });
    }
    
    res.status(200).json({ template });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo template mới (admin hoặc premium user)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createTemplate = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      thumbnail, 
      category, 
      styles, 
      slideLayouts, 
      isPublic, 
      isPremium 
    } = req.body;
    
    // Kiểm tra tên template có trùng không
    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ error: 'Tên template đã tồn tại' });
    }
    
    // Tạo template mới
    const newTemplate = await Template.create({
      name,
      description,
      thumbnail,
      category,
      styles,
      slideLayouts,
      isPublic: isPublic !== undefined ? isPublic : true,
      isPremium: isPremium !== undefined ? isPremium : false,
      createdBy: req.user._id
    });
    
    res.status(201).json({ template: newTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật template (admin hoặc người tạo)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    const {
      name,
      description,
      thumbnail,
      category,
      styles,
      slideLayouts,
      isPublic,
      isPremium
    } = req.body;
    
    // Tìm template
    const template = await Template.findById(req.params.id);
    
    // Kiểm tra xem template có tồn tại không
    if (!template) {
      return res.status(404).json({ error: 'Không tìm thấy template' });
    }
    
    // Kiểm tra quyền cập nhật
    if (template.createdBy && 
        template.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật template này' });
    }
    
    // Kiểm tra tên template có trùng không nếu thay đổi tên
    if (name && name !== template.name) {
      const existingTemplate = await Template.findOne({ name, _id: { $ne: req.params.id } });
      if (existingTemplate) {
        return res.status(400).json({ error: 'Tên template đã tồn tại' });
      }
    }
    
    // Cập nhật template
    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        thumbnail,
        category,
        styles,
        slideLayouts,
        isPublic,
        isPremium
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ template: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa template (admin hoặc người tạo)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    // Tìm template
    const template = await Template.findById(req.params.id);
    
    // Kiểm tra xem template có tồn tại không
    if (!template) {
      return res.status(404).json({ error: 'Không tìm thấy template' });
    }
    
    // Kiểm tra quyền xóa
    if (template.createdBy && 
        template.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa template này' });
    }
    
    // Xóa template
    await Template.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Xóa template thành công' });
  } catch (error) {
    next(error);
  }
}; 