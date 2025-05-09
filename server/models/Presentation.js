const mongoose = require('mongoose');

// Định nghĩa Schema cho Slide
const slideSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'chart', 'video', 'code'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  style: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  animations: [{
    type: {
      type: String,
      enum: ['fade', 'slide', 'zoom', 'bounce'],
      required: true
    },
    duration: Number,
    delay: Number
  }]
});

// Định nghĩa Schema cho Presentation
const presentationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề không được để trống'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slides: [slideSchema],
  theme: {
    type: String,
    default: 'default'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
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

// Thêm text index cho tìm kiếm
presentationSchema.index({ title: 'text', description: 'text' });
presentationSchema.index({ owner: 1, status: 1 });
presentationSchema.index({ tags: 1 });
presentationSchema.index({ category: 1 });

// Tạo và xuất model
const Presentation = mongoose.model('Presentation', presentationSchema);

module.exports = Presentation; 