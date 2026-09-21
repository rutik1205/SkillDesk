const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per order
reviewSchema.index({ order: 1 }, { unique: true });
reviewSchema.index({ service: 1 });
reviewSchema.index({ freelancer: 1 });

// Update service and freelancer average rating after save
reviewSchema.post('save', async function () {
  const Review = this.constructor;

  // Update service rating
  const serviceStats = await Review.aggregate([
    { $match: { service: this.service } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (serviceStats.length > 0) {
    await mongoose.model('Service').findByIdAndUpdate(this.service, {
      avgRating: Math.round(serviceStats[0].avgRating * 10) / 10,
      totalReviews: serviceStats[0].totalReviews,
    });
  }

  // Update freelancer rating
  const freelancerStats = await Review.aggregate([
    { $match: { freelancer: this.freelancer } },
    {
      $group: {
        _id: '$freelancer',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (freelancerStats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(this.freelancer, {
      avgRating: Math.round(freelancerStats[0].avgRating * 10) / 10,
      totalReviews: freelancerStats[0].totalReviews,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
