const Presentation = require('../models/Presentation');
const config = require('../config/config');
const openaiService = require('../services/openaiService');
const demoService = require('../services/demoService');
const { createPresentationPrompt } = require('../utils/promptUtils');

/**
 * Lấy danh sách bài thuyết trình của người dùng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getPresentations = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    
    // Hỗ trợ tìm kiếm
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
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
    const presentations = await Presentation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Đếm tổng số bài thuyết trình
    const total = await Presentation.countDocuments(filter);
    
    res.status(200).json({
      presentations,
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
 * Lấy chi tiết một bài thuyết trình
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getPresentation = async (req, res, next) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    
    // Kiểm tra xem bài thuyết trình có tồn tại không
    if (!presentation) {
      return res.status(404).json({ error: 'Không tìm thấy bài thuyết trình' });
    }
    
    // Kiểm tra quyền truy cập
    if (presentation.userId.toString() !== req.user._id.toString() && !presentation.isPublic && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập bài thuyết trình này' });
    }
    
    res.status(200).json({ presentation });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo bài thuyết trình mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createPresentation = async (req, res, next) => {
  try {
    const { title, description, slides, template, isPublic, tags } = req.body;
    
    // Tạo bài thuyết trình mới
    const newPresentation = await Presentation.create({
      title,
      description,
      slides,
      template,
      isPublic,
      tags,
      userId: req.user._id
    });
    
    res.status(201).json({ presentation: newPresentation });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật bài thuyết trình
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updatePresentation = async (req, res, next) => {
  try {
    const { title, description, slides, template, isPublic, tags } = req.body;
    
    // Tìm bài thuyết trình
    const presentation = await Presentation.findById(req.params.id);
    
    // Kiểm tra xem bài thuyết trình có tồn tại không
    if (!presentation) {
      return res.status(404).json({ error: 'Không tìm thấy bài thuyết trình' });
    }
    
    // Kiểm tra quyền truy cập
    if (presentation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật bài thuyết trình này' });
    }
    
    // Cập nhật bài thuyết trình
    const updatedPresentation = await Presentation.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        slides,
        template,
        isPublic,
        tags,
        lastEdited: new Date()
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ presentation: updatedPresentation });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa bài thuyết trình
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deletePresentation = async (req, res, next) => {
  try {
    // Tìm bài thuyết trình
    const presentation = await Presentation.findById(req.params.id);
    
    // Kiểm tra xem bài thuyết trình có tồn tại không
    if (!presentation) {
      return res.status(404).json({ error: 'Không tìm thấy bài thuyết trình' });
    }
    
    // Kiểm tra quyền truy cập
    if (presentation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bài thuyết trình này' });
    }
    
    // Xóa bài thuyết trình
    await Presentation.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Xóa bài thuyết trình thành công' });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý request tạo bài thuyết trình bằng AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.handleGeneratePresentation = async (req, res, next) => {
  try {
    const { 
      topic, 
      style, 
      slides, 
      language, 
      purpose, 
      audience, 
      includeCharts, 
      includeImages, 
      provider 
    } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Chủ đề không được để trống' });
    }
    
    // Chế độ DEMO: Trả về dữ liệu mẫu
    if (config.isDemoMode()) {
      console.log('Đang chạy tạo bài thuyết trình ở chế độ DEMO.');
      const demoData = demoService.generateDemoPresentation(topic, slides || 5, style);
      
      // Lưu bài thuyết trình mẫu vào database
      if (req.user) {
        try {
          await Presentation.create({
            title: demoData.title,
            description: demoData.description,
            slides: demoData.slides,
            template: style || 'default',
            isPublic: false,
            tags: [topic],
            userId: req.user._id,
            metadata: demoData.metadata
          });
        } catch (dbError) {
          console.error('Lỗi khi lưu bài thuyết trình mẫu:', dbError);
        }
      }
      
      return res.json(demoData);
    }
    
    // Chế độ thực: Gọi API tương ứng
    // Tạo prompt cho AI
    const prompt = createPresentationPrompt({
      topic, 
      style, 
      slides, 
      language, 
      purpose, 
      audience, 
      includeCharts, 
      includeImages
    });
    
    // Mặc định sử dụng OpenAI
    const apiResponse = await openaiService.callOpenAIForPresentation(prompt);
    
    if (!apiResponse) {
      return res.status(500).json({ error: 'Không thể tạo bài thuyết trình' });
    }
    
    // Lưu bài thuyết trình vào database
    if (req.user) {
      try {
        // Thêm id cho mỗi slide
        if (apiResponse.slides && Array.isArray(apiResponse.slides)) {
          apiResponse.slides = apiResponse.slides.map((slide, index) => ({
            ...slide,
            id: slide.id || `slide-${index + 1}`,
            order: index
          }));
        }
        
        await Presentation.create({
          title: apiResponse.title || topic,
          description: apiResponse.description || `Bài thuyết trình về ${topic}`,
          slides: apiResponse.slides || [],
          template: style || 'default',
          isPublic: false,
          tags: [topic],
          userId: req.user._id,
          metadata: {
            ...apiResponse.metadata,
            topic,
            style,
            language,
            purpose,
            audience
          }
        });
      } catch (dbError) {
        console.error('Lỗi khi lưu bài thuyết trình:', dbError);
      }
    }
    
    return res.json(apiResponse);
  } catch (error) {
    console.error('Lỗi tạo bài thuyết trình:', error);
    next(error);
  }
}; 