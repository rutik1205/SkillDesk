const mongoose = require('mongoose');

// Valid state transitions for strict order workflow
const ORDER_TRANSITIONS = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['delivered', 'cancelled'],
  delivered: ['completed', 'revision_requested'],
  revision_requested: ['in_progress'],
  completed: [],
  cancelled: [],
  rejected: [],
};

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'in_progress',
        'delivered',
        'revision_requested',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    requirements: {
      type: String,
      default: '',
    },
    deliveryDate: {
      type: Date,
    },
    deliveredWork: {
      message: { type: String, default: '' },
      files: [
        {
          url: { type: String },
          fileId: { type: String },
          name: { type: String },
        },
      ],
      deliveredAt: { type: Date },
    },
    revisionMessage: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Validate state transitions
orderSchema.methods.canTransitionTo = function (newStatus) {
  const allowed = ORDER_TRANSITIONS[this.status];
  return allowed && allowed.includes(newStatus);
};

orderSchema.index({ client: 1 });
orderSchema.index({ freelancer: 1 });
orderSchema.index({ status: 1 });

// Export transitions for use in service layer
orderSchema.statics.ORDER_TRANSITIONS = ORDER_TRANSITIONS;

module.exports = mongoose.model('Order', orderSchema);
