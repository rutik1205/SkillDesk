const Service = require('../models/Service');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

const createService = async (freelancerId, data) => {
  const service = await Service.create({
    ...data,
    freelancer: freelancerId,
  });

  // Increment category service count
  await Category.findByIdAndUpdate(data.category, {
    $inc: { serviceCount: 1 },
  });

  return service.populate(['freelancer', 'category']);
};

const getServices = async (query = {}) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    tags,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (tags) {
    const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
    filter.tags = { $in: tagList };
  }

  // Build sort object
  let sortObj = {};
  switch (sort) {
    case 'price_asc':
      sortObj = { price: 1 };
      break;
    case 'price_desc':
      sortObj = { price: -1 };
      break;
    case 'rating':
      sortObj = { avgRating: -1 };
      break;
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    case 'popular':
      sortObj = { totalOrders: -1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('freelancer', 'name avatar avgRating totalReviews professionalTitle')
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit)),
    Service.countDocuments(filter),
  ]);

  return {
    services,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getServiceById = async (serviceId) => {
  const service = await Service.findById(serviceId)
    .populate(
      'freelancer',
      'name avatar bio skills professionalTitle experience avgRating totalReviews completedOrders isOnline location'
    )
    .populate('category', 'name slug');

  if (!service) {
    throw ApiError.notFound('Service not found.');
  }
  return service;
};

const updateService = async (serviceId, freelancerId, data) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw ApiError.notFound('Service not found.');
  }
  if (service.freelancer.toString() !== freelancerId.toString()) {
    throw ApiError.forbidden('You can only edit your own services.');
  }

  // Don't allow changing the freelancer
  delete data.freelancer;

  Object.assign(service, data);
  await service.save();

  return service.populate(['freelancer', 'category']);
};

const deleteService = async (serviceId, freelancerId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw ApiError.notFound('Service not found.');
  }
  if (service.freelancer.toString() !== freelancerId.toString()) {
    throw ApiError.forbidden('You can only delete your own services.');
  }

  await Category.findByIdAndUpdate(service.category, {
    $inc: { serviceCount: -1 },
  });

  await service.deleteOne();
  return { message: 'Service deleted successfully.' };
};

const getMyServices = async (freelancerId) => {
  const services = await Service.find({ freelancer: freelancerId })
    .populate('category', 'name slug')
    .sort('-createdAt');
  return services;
};

const getFeaturedServices = async (limit = 8) => {
  const services = await Service.find({ isActive: true })
    .populate('freelancer', 'name avatar avgRating totalReviews')
    .populate('category', 'name slug')
    .sort('-avgRating -totalOrders')
    .limit(limit);
  return services;
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
  getFeaturedServices,
};
