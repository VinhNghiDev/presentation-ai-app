const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  features: {
    maxPresentations: {
      type: Number,
      required: true
    },
    maxSlides: {
      type: Number,
      required: true
    },
    aiGenerations: {
      type: Number,
      required: true
    },
    customTemplates: {
      type: Boolean,
      default: false
    },
    collaboration: {
      type: Boolean,
      default: false
    },
    exportFormats: [{
      type: String,
      enum: ['pdf', 'pptx', 'html', 'image']
    }]
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'VND'
    },
    paymentMethod: {
      type: String
    },
    transactionId: {
      type: String
    }
  },
  autoRenew: {
    type: Boolean,
    default: false
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
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 