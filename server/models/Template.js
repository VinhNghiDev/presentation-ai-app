const mongoose = require('mongoose');

// Định nghĩa Schema cho Template
const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên template không được để trống'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  slides: [{
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
    }
  }],
  theme: {
    type: String,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
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

// Indexes
templateSchema.index({ name: 'text', description: 'text' });
templateSchema.index({ category: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ isPremium: 1 });
templateSchema.index({ status: 1 });

// Tạo và xuất model
const Template = mongoose.model('Template', templateSchema);

module.exports = Template; 