const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['presentation', 'slide', 'content', 'image'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  metadata: {
    model: {
      type: String,
      required: true
    },
    tokens: {
      type: Number
    },
    duration: {
      type: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
aiGenerationSchema.index({ user: 1, type: 1 });
aiGenerationSchema.index({ status: 1 });
aiGenerationSchema.index({ createdAt: -1 });

const AIGeneration = mongoose.model('AIGeneration', aiGenerationSchema);

module.exports = AIGeneration; 